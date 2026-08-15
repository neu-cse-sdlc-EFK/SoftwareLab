package handlers

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/sessions"
)

var Store *sessions.CookieStore

const SessionName = "session"

func InitSessionStore() error {
	secret := os.Getenv("SESSION_SECRET")

	if secret == "" {
		return fmt.Errorf("SESSION_SECRET is not set")
	}

	Store = sessions.NewCookieStore(
		[]byte(secret),
	)

	return nil
}

func GetSession(r *http.Request) (*sessions.Session, error) {
	return Store.Get(r, SessionName)
}
