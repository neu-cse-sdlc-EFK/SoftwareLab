package handlers

import (
	"SoftwareLab/database"
	"encoding/json"
	"net/http"

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
		respondJSON(w, http.StatusMethodNotAllowed, AddResponse{
			Success: false,
			Message: "Method not allowed",
		})
		return
	}

	name := r.FormValue("name")
	id := r.FormValue("id")
	email := r.FormValue("email")
	password := r.FormValue("password")
	batch := r.FormValue("batch")
	session := r.FormValue("session")
	roll := r.FormValue("roll")
	examRoll := r.FormValue("exam_roll")

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, AddResponse{
			Success: false,
			Message: "Failed to hash password",
		})
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
		session,
		roll,
		examRoll,
	)

	if err != nil {
		respondJSON(w, http.StatusInternalServerError, AddResponse{
			Success: false,
			Message: "Failed to add student",
		})
		return
	}

	respondJSON(w, http.StatusCreated, AddResponse{
		Success: true,
		Message: "Student added successfully",
	})
}

func AddTeacher(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondJSON(w, http.StatusMethodNotAllowed, AddResponse{
			Success: false,
			Message: "Method not allowed",
		})
		return
	}

	name := r.FormValue("name")
	id := r.FormValue("id")
	email := r.FormValue("email")
	password := r.FormValue("password")
	chairman := r.FormValue("chairman")

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, AddResponse{
			Success: false,
			Message: "Failed to hash password",
		})
		return
	}

	_, err = database.DB.Exec(`
		INSERT INTO teachers
			(name, id, email, password,chairman)
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
		respondJSON(w, http.StatusInternalServerError, AddResponse{
			Success: false,
			Message: "Failed to add student",
		})
		return
	}

	respondJSON(w, http.StatusCreated, AddResponse{
		Success: true,
		Message: "Student added successfully",
	})
}
