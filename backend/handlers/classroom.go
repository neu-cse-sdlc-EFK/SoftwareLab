package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"SoftwareLab/database"
)

type Classroom struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Batch     int    `json:"batch"`
	TeacherID string `json:"teacher_id,omitempty"`
}

type Message struct {
	ID         int       `json:"id"`
	SenderID   string    `json:"sender_id"`
	SenderRole string    `json:"sender_role"`
	SenderName string    `json:"sender_name"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"created_at"`
}

type Notice struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Body      string    `json:"body"`
	Tag       string    `json:"tag"`
	CreatedAt time.Time `json:"created_at"`
}

// GET /api/classrooms — list classrooms visible to the logged-in user
func GetClassrooms(w http.ResponseWriter, r *http.Request) {
	session, err := GetSession(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	id, _ := session.Values["id"].(string)
	role, _ := session.Values["role"].(string)

	var rows *sql.Rows

	switch role {
	case "student":
		rows, err = database.DB.Query(`
			SELECT c.id, c.name, c.batch, c.teacher_id
			FROM classrooms c
			JOIN students s ON s.batch = c.batch
			WHERE s.id = $1
		`, id)
	case "teacher":
		rows, err = database.DB.Query(`
			SELECT id, name, batch, teacher_id
			FROM classrooms
			WHERE teacher_id = $1
		`, id)
	default:
		w.WriteHeader(http.StatusForbidden)
		return
	}

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	classrooms := []Classroom{}
	for rows.Next() {
		var c Classroom
		var teacherID sql.NullString
		if err := rows.Scan(&c.ID, &c.Name, &c.Batch, &teacherID); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		c.TeacherID = teacherID.String
		classrooms = append(classrooms, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(classrooms)
}

// classroomAccess checks the caller is a member of classroomID, returns their role.
func classroomAccess(r *http.Request, classroomID int) (id, role string, ok bool) {
	session, err := GetSession(r)
	if err != nil {
		return "", "", false
	}
	id, _ = session.Values["id"].(string)
	role, _ = session.Values["role"].(string)

	var count int
	switch role {
	case "student":
		err = database.DB.QueryRow(`
			SELECT COUNT(*) FROM classrooms c
			JOIN students s ON s.batch = c.batch
			WHERE c.id = $1 AND s.id = $2
		`, classroomID, id).Scan(&count)
	case "teacher":
		err = database.DB.QueryRow(`
			SELECT COUNT(*) FROM classrooms
			WHERE id = $1 AND teacher_id = $2
		`, classroomID, id).Scan(&count)
	default:
		return id, role, false
	}

	if err != nil || count == 0 {
		return id, role, false
	}
	return id, role, true
}

// GET /api/classrooms/{id}/messages
func GetMessages(w http.ResponseWriter, r *http.Request) {
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

	rows, err := database.DB.Query(`
		SELECT m.id, m.sender_id, m.sender_role, m.content, m.created_at,
		       COALESCE(s.name, t.name) AS sender_name
		FROM messages m
		LEFT JOIN students s ON m.sender_role = 'student' AND m.sender_id = s.id
		LEFT JOIN teachers t ON m.sender_role = 'teacher' AND m.sender_id = t.id
		WHERE m.classroom_id = $1
		ORDER BY m.created_at ASC
	`, classroomID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	messages := []Message{}
	for rows.Next() {
		var m Message
		if err := rows.Scan(&m.ID, &m.SenderID, &m.SenderRole, &m.Content, &m.CreatedAt, &m.SenderName); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		messages = append(messages, m)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

// POST /api/classrooms/{id}/messages
func PostMessage(w http.ResponseWriter, r *http.Request) {
	classroomID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	id, role, ok := classroomAccess(r, classroomID)
	if !ok {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	content := r.FormValue("content")
	if content == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	_, err = database.DB.Exec(`
		INSERT INTO messages (classroom_id, sender_id, sender_role, content)
		VALUES ($1, $2, $3, $4)
	`, classroomID, id, role, content)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// GET /api/classrooms/{id}/notices
func GetNotices(w http.ResponseWriter, r *http.Request) {
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

	rows, err := database.DB.Query(`
		SELECT id, title, body, tag, created_at
		FROM notices
		WHERE classroom_id = $1 OR classroom_id IS NULL
		ORDER BY created_at DESC
	`, classroomID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	notices := []Notice{}
	for rows.Next() {
		var n Notice
		if err := rows.Scan(&n.ID, &n.Title, &n.Body, &n.Tag, &n.CreatedAt); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		notices = append(notices, n)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notices)
}

// POST /api/classrooms/{id}/notices — teacher only
func PostNotice(w http.ResponseWriter, r *http.Request) {
	classroomID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	teacherID, role, ok := classroomAccess(r, classroomID)
	if !ok || role != "teacher" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	title := r.FormValue("title")
	body := r.FormValue("body")
	tag := r.FormValue("tag")
	if title == "" || body == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if tag == "" {
		tag = "general"
	}

	_, err = database.DB.Exec(`
		INSERT INTO notices (classroom_id, title, body, tag, posted_by)
		VALUES ($1, $2, $3, $4, $5)
	`, classroomID, title, body, tag, teacherID)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}
