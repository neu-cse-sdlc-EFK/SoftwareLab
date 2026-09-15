package handlers

import (
	"encoding/json"
	"net/http"

	"SoftwareLab/database"

	"github.com/gorilla/sessions"
	"golang.org/x/crypto/bcrypt"
)

type LoginResponse struct {
	Success  bool   `json:"success"`
	Message  string `json:"message"`
	Username string `json:"username,omitempty"`
	Role     string `json:"role,omitempty"`
}

var dummyHash = "$2a$10$5RzQaCkJoWEYTDJG0qOc7uESaIsOcd/uKGqCe0uNUsLTUYJ73DSHW"

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Method not allowed",
		})
		return
	}

	email := r.FormValue("email")
	pass := r.FormValue("pass")
	role := r.FormValue("type")
	remember := r.FormValue("remember")

	if email == "" || pass == "" || role == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Email, password and role are required",
		})
		return
	}

	var (
		id           string
		username     string
		passwordHash string
	)

	var query string

	switch role {

	case "student":
		query = `
			SELECT id, name, password
			FROM students
			WHERE email = $1
			  AND status = 'active'
		`

	case "teacher":
		query = `
			SELECT id, name, password
			FROM teachers
			WHERE email = $1
			  AND status = 'active'
		`

	case "admin":
		query = `
			SELECT id, email, password
			FROM admin
			WHERE email = $1
		`

	default:
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Invalid role",
		})
		return
	}

	err := database.DB.QueryRow(query, email).Scan(
		&id,
		&username,
		&passwordHash,
	)

	// If user doesn't exist, still perform bcrypt comparison
	// to avoid making user enumeration easier.
	if err != nil {
		passwordHash = dummyHash
	}

	bcryptErr := bcrypt.CompareHashAndPassword(
		[]byte(passwordHash),
		[]byte(pass),
	)

	if err != nil || bcryptErr != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Invalid email, password, or role",
		})
		return
	}

	session, err := GetSession(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Could not create session",
		})
		return
	}

	session.Values["id"] = id
	session.Values["role"] = role

	// Remember me
	maxAge := 0

	if remember == "true" {
		maxAge = 60 * 60 * 24 * 30 // 30 days
	} else {
		maxAge = 60 * 60 * 24 // 1 day
	}

	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   false, // localhost development
		SameSite: http.SameSiteLaxMode,
	}

	if err := session.Save(r, w); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Could not save session",
		})
		return
	}

	json.NewEncoder(w).Encode(LoginResponse{
		Success:  true,
		Message:  "Login successful",
		Username: username,
		Role:     role,
	})
}
