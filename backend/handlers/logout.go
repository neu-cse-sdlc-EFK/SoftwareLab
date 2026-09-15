package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/sessions"
)

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Method not allowed",
		})
		return
	}

	session, err := GetSession(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Session error",
		})
		return
	}

	for k := range session.Values {
		delete(session.Values, k)
	}

	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}

	if err = session.Save(r, w); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Could not logout",
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Logged out successfully",
	})
}