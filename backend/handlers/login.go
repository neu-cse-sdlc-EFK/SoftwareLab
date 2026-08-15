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

	if email == "" || pass == "" || role == "" {
		w.WriteHeader(http.StatusBadRequest)

		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Email, password and role are required",
		})

		return
	}

	var name, passwordHash, userType string

	err := database.DB.QueryRow(
		`SELECT name, password, user_type
		 FROM users
		 WHERE email = $1 AND user_type = $2`,
		email,
		role,
	).Scan(
		&name,
		&passwordHash,
		&userType,
	)

	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)

		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Invalid email, password, or role",
		})

		return
	}

	// Compare entered password with bcrypt hash
	err = bcrypt.CompareHashAndPassword(
		[]byte(passwordHash),
		[]byte(pass),
	)

	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)

		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Invalid email or password",
		})

		return
	}

	// Create session
	session, err := GetSession(r)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)

		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Could not create session",
		})

		return
	}

	// Store information in session
	session.Values["id"] = id
	session.Values["role"] = userType

	// Cookie configuration
	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   60 * 60 * 24 * 7, // 7 days
		HttpOnly: true,
		Secure:   false, // true when using HTTPS
		SameSite: http.SameSiteLaxMode,
	}

	// Save session to browser
	err = session.Save(r, w)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)

		json.NewEncoder(w).Encode(LoginResponse{
			Success: false,
			Message: "Could not save session",
		})

		return
	}

	// Login successful
	json.NewEncoder(w).Encode(LoginResponse{
		Success:  true,
		Message:  "Login successful",
		Username: username,
		Role:     userType,
	})
}
