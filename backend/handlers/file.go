package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"time"

	"SoftwareLab/database"
)

type File struct {
	ID           int       `json:"id"`
	ClassroomID  int       `json:"classroom_id"`
	FileName     string    `json:"file_name"`
	SizeBytes    int64     `json:"size_bytes"`
	UploadedBy   string    `json:"uploaded_by"`
	UploaderName string    `json:"uploader_name"`
	CreatedAt    time.Time `json:"created_at"`
	URL          string    `json:"url"`
}

// uploadDir resolves where files are stored on disk. Override with
// UPLOAD_DIR if you want them outside the repo (recommended in prod).
func uploadDir() string {
	dir := os.Getenv("UPLOAD_DIR")
	if dir == "" {
		dir = "./uploads"
	}
	return dir
}

var unsafeNameChars = regexp.MustCompile(`[^a-zA-Z0-9._-]+`)

func sanitizeFileName(name string) string {
	base := filepath.Base(name)
	cleaned := unsafeNameChars.ReplaceAllString(base, "_")
	if cleaned == "" {
		cleaned = "file"
	}
	return cleaned
}

// GET /api/classrooms/{id}/files
func GetFiles(w http.ResponseWriter, r *http.Request) {
	classroomID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	_, _, ok := classroomAccess(r, classroomID)
	if !ok {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// classroom_files columns: id, classroom_id, filename, url, uploaded_by, created_at.
	// "url" holds the on-disk stored file name (the storage locator), not a
	// public URL — the actual download link is built separately below.
	rows, err := database.DB.Query(`
		SELECT f.id, f.classroom_id, f.filename, f.url, f.uploaded_by, f.created_at,
		       COALESCE(s.name, t.name) AS uploader_name
		FROM classroom_files f
		LEFT JOIN students s ON f.uploaded_by = s.id
		LEFT JOIN teachers t ON f.uploaded_by = t.id
		WHERE f.classroom_id = $1
		ORDER BY f.created_at DESC
	`, classroomID)
	if err != nil {
		log.Println("GetFiles: query error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	files := []File{}
	for rows.Next() {
		var f File
		var storedName string
		if err := rows.Scan(
			&f.ID, &f.ClassroomID, &f.FileName, &storedName, &f.UploadedBy,
			&f.CreatedAt, &f.UploaderName,
		); err != nil {
			log.Println("GetFiles: scan error:", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		// Best-effort file size lookup from disk; there is no size_bytes column.
		fullPath := filepath.Join(uploadDir(), strconv.Itoa(f.ClassroomID), storedName)
		if info, statErr := os.Stat(fullPath); statErr == nil {
			f.SizeBytes = info.Size()
		}

		f.URL = fmt.Sprintf("/api/classrooms/%d/files/%d/download", f.ClassroomID, f.ID)
		files = append(files, f)
	}

	if err := rows.Err(); err != nil {
		log.Println("GetFiles: rows iteration error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(files)
}

// POST /api/classrooms/{id}/files — multipart form, field name "file"
func PostFile(w http.ResponseWriter, r *http.Request) {
	classroomID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	id, _, ok := classroomAccess(r, classroomID)
	if !ok {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// 32MB in memory before spilling to a temp file; adjust to taste.
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		log.Println("PostFile: parse multipart error:", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		log.Println("PostFile: form file error:", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	defer file.Close()

	dir := filepath.Join(uploadDir(), strconv.Itoa(classroomID))
	if err := os.MkdirAll(dir, 0o755); err != nil {
		log.Println("PostFile: mkdir error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	safeName := sanitizeFileName(header.Filename)
	storedName := fmt.Sprintf("%d_%s", time.Now().UnixNano(), safeName)
	fullPath := filepath.Join(dir, storedName)

	dst, err := os.Create(fullPath)
	if err != nil {
		log.Println("PostFile: create file error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		log.Println("PostFile: write file error:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var newID int
	// filename = original display name, url = on-disk stored name (storage locator).
	err = database.DB.QueryRow(`
		INSERT INTO classroom_files (classroom_id, filename, url, uploaded_by)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, classroomID, header.Filename, storedName, id).Scan(&newID)

	if err != nil {
		log.Println("PostFile: insert error:", err)
		// Best-effort cleanup of the orphaned file on disk.
		os.Remove(fullPath)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int{"id": newID})
}

// GET /api/classrooms/{id}/files/{fileId}/download
func DownloadFile(w http.ResponseWriter, r *http.Request) {
	classroomID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	fileID, err := strconv.Atoi(r.PathValue("fileId"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	_, _, ok := classroomAccess(r, classroomID)
	if !ok {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	var fileName, storedName string
	err = database.DB.QueryRow(`
		SELECT filename, url FROM classroom_files
		WHERE id = $1 AND classroom_id = $2
	`, fileID, classroomID).Scan(&fileName, &storedName)

	if err != nil {
		log.Println("DownloadFile: query error:", err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	fullPath := filepath.Join(uploadDir(), strconv.Itoa(classroomID), storedName)

	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, fileName))
	http.ServeFile(w, r, fullPath)
}
