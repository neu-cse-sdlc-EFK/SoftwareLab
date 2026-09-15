package handlers

import (
	"net/http"
)

var allowedOrigins = map[string]bool{
	"http://localhost:3000": true, // Next.js dev
	// "https://your-dms.com": true, // add prod origin here
}

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func RequireRole(roles ...string) func(http.HandlerFunc) http.HandlerFunc {
	allowed := make(map[string]bool, len(roles))
	for _, r := range roles {
		allowed[r] = true
	}

	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			session, err := GetSession(r)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			role, ok := session.Values["role"].(string)
			if !ok || role == "" {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			if !allowed[role] {
				w.WriteHeader(http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		}
	}
}
