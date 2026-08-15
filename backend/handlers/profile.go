package handlers

import (
	"encoding/json"
	"net/http"
)

type ProfileResponse struct {
	Success  bool   `json:"success"`
	Message  string `json:"message"`
	Username string `json:"username,omitempty"`
	Role     string `json:"role,omitempty"`
}

func ProfileHandler(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)

		json.NewEncoder(w).Encode(ProfileResponse{
			Success: false,
			Message: "Method not allowed",
		})

		return
	}

	session, err := GetSession(r)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)

		json.NewEncoder(w).Encode(ProfileResponse{
			Success: false,
			Message: "Session error",
		})

		return
	}

	username, ok := session.Values["username"].(string)

	if !ok || username == "" {
		w.WriteHeader(http.StatusUnauthorized)

		json.NewEncoder(w).Encode(ProfileResponse{
			Success: false,
			Message: "Not logged in",
		})

		return
	}

	role, _ := session.Values["role"].(string)

	json.NewEncoder(w).Encode(ProfileResponse{
		Success:  true,
		Message:  "Authenticated",
		Username: username,
		Role:     role,
	})
}
