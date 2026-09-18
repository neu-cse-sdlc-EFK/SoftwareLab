package handlers

import (
	"encoding/json"
	"net/http"

	"SoftwareLab/database"
)

type MeResponse struct {
	ID   string `json:"id"`
	Role string `json:"role"`
	Name string `json:"name"`
}

// GET /api/me — returns the logged-in user's identity, or 401 if not logged in.
func GetMe(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	session, err := GetSession(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	id, idOk := session.Values["id"].(string)
	role, roleOk := session.Values["role"].(string)

	if !idOk || !roleOk || id == "" || role == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"message": "Not logged in"})
		return
	}

	var name string
	var query string
	switch role {
	case "student":
		query = `SELECT name FROM students WHERE id = $1`
	case "teacher":
		query = `SELECT name FROM teachers WHERE id = $1`
	case "admin":
		query = `SELECT email FROM admin WHERE id = $1` // admin has no name column
	default:
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	if err := database.DB.QueryRow(query, id).Scan(&name); err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	json.NewEncoder(w).Encode(MeResponse{ID: id, Role: role, Name: name})
}
