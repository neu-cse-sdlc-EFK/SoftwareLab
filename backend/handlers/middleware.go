package handlers

import (
	"net/http"
)

var allowedOrigins = map[string]bool{
	"http://localhost:3000": true,
	"http://127.0.0.1:3000": true,
}

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		origin := r.Header.Get("Origin")

		if allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set(
				"Access-Control-Allow-Methods",
				"GET, POST, PUT, DELETE, OPTIONS",
			)
			w.Header().Set(
				"Access-Control-Allow-Headers",
				"Content-Type",
			)
			w.Header().Set("Vary", "Origin")
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func RequireRole(roles ...string) func(http.HandlerFunc) http.HandlerFunc {
	allowed := make(map[string]bool, len(roles))

	for _, role := range roles {
		allowed[role] = true
	}

	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {

			session, err := GetSession(r)

			if err != nil {
				http.Error(w, "Internal server error", http.StatusInternalServerError)
				return
			}

			role, ok := session.Values["role"].(string)

			if !ok || role == "" {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			if !allowed[role] {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		}
	}
}
