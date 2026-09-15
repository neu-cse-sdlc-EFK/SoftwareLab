package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"SoftwareLab/database"

	"golang.org/x/crypto/bcrypt"
)

type AddResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func respondJSON(w http.ResponseWriter, statusCode int, response AddResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}

func AddStudent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondJSON(w, http.StatusMethodNotAllowed, AddResponse{Success: false, Message: "Method not allowed"})
		return
	}

	name := r.FormValue("name")
	id := r.FormValue("id")
	email := r.FormValue("email")
	password := r.FormValue("password")
	batchStr := r.FormValue("batch")
	sess := r.FormValue("session")
	rollStr := r.FormValue("roll")
	examRollStr := r.FormValue("exam_roll")

	if name == "" || id == "" || email == "" || password == "" || batchStr == "" || sess == "" || rollStr == "" || examRollStr == "" {
		respondJSON(w, http.StatusBadRequest, AddResponse{Success: false, Message: "All fields are required"})
		return
	}

	if len(id) != 9 {
		respondJSON(w, http.StatusBadRequest, AddResponse{Success: false, Message: "Student ID must be 9 characters"})
		return
	}

	batch, err := strconv.Atoi(batchStr)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, AddResponse{Success: false, Message: "Batch must be a number"})
		return
	}

	roll, err := strconv.Atoi(rollStr)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, AddResponse{Success: false, Message: "Roll must be a number"})
		return
	}

	examRoll, err := strconv.Atoi(examRollStr)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, AddResponse{Success: false, Message: "Exam roll must be a number"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, AddResponse{Success: false, Message: "Failed to hash password"})
		return
	}

	_, err = database.DB.Exec(`
		INSERT INTO students
			(name, id, email, password, batch, session, roll, exam_roll)
		VALUES
			($1, $2, $3, $4, $5, $6, $7, $8)
	`,
		name,
		id,
		email,
		string(hashedPassword),
		batch,
		sess,
		roll,
		examRoll,
	)

	if err != nil {
		respondJSON(w, http.StatusInternalServerError, AddResponse{Success: false, Message: "Failed to add student"})
		return
	}

	respondJSON(w, http.StatusCreated, AddResponse{Success: true, Message: "Student added successfully"})
}

func AddTeacher(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondJSON(w, http.StatusMethodNotAllowed, AddResponse{Success: false, Message: "Method not allowed"})
		return
	}

	name := r.FormValue("name")
	id := r.FormValue("id")
	email := r.FormValue("email")
	password := r.FormValue("password")
	chairmanStr := r.FormValue("chairman")

	if name == "" || id == "" || email == "" || password == "" {
		respondJSON(w, http.StatusBadRequest, AddResponse{Success: false, Message: "All fields are required"})
		return
	}

	if len(id) != 6 {
		respondJSON(w, http.StatusBadRequest, AddResponse{Success: false, Message: "Teacher ID must be 6 characters"})
		return
	}

	// chairman is optional; default to false if not sent or unparsable
	chairman := false
	if chairmanStr != "" {
		var perr error
		chairman, perr = strconv.ParseBool(chairmanStr)
		if perr != nil {
			respondJSON(w, http.StatusBadRequest, AddResponse{Success: false, Message: "Chairman must be true or false"})
			return
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, AddResponse{Success: false, Message: "Failed to hash password"})
		return
	}

	_, err = database.DB.Exec(`
		INSERT INTO teachers
			(name, id, email, password, chairman)
		VALUES
			($1, $2, $3, $4, $5)
	`,
		name,
		id,
		email,
		string(hashedPassword),
		chairman,
	)

	if err != nil {
		respondJSON(w, http.StatusInternalServerError, AddResponse{Success: false, Message: "Failed to add teacher"})
		return
	}

	respondJSON(w, http.StatusCreated, AddResponse{Success: true, Message: "Teacher added successfully"})
}