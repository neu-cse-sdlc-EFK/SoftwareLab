package database

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func Connect() (*sql.DB, error) {
	err := godotenv.Load()
	if err != nil {
		return nil, fmt.Errorf("error loading .env: %w", err)
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is not set")
	}

	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	err = db.Ping()
	if err != nil {
		db.Close()
		return nil, fmt.Errorf("database connection failed: %w", err)
	}
	fmt.Println("Connected to Neon PostgreSQL")

	schema, err := os.ReadFile("database/schema.sql")
	if err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to read schema.sql: %w", err)
	}

	_, err = db.Exec(string(schema))
	if err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to execute schema.sql: %w", err)
	}

	fmt.Println("Database schema initialized")

	return db, nil
}
