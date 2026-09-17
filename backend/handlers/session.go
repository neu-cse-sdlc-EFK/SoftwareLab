package handlers

import (
	"net/http"
	"os"

	"github.com/gorilla/sessions"
)

var store *sessions.CookieStore

func init() {
	secret := os.Getenv("SESSION_SECRET")

	// Development fallback.
	// Set SESSION_SECRET in production.
	if secret == "" {
		secret = "softwarelab-development-secret-change-this"
	}

	store = sessions.NewCookieStore([]byte(secret))

	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   60 * 60 * 24 * 30,
		HttpOnly: true,
		Secure:   false, // true when using HTTPS
		SameSite: http.SameSiteLaxMode,
	}
}

func GetSession(r *http.Request) (*sessions.Session, error) {
	return store.Get(r, "softwarelab-session")
}
