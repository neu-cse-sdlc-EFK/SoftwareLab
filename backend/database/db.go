package database

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect() error {
	err := godotenv.Load()
	if err != nil {
		return fmt.Errorf("error loading .env: %w", err)
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return fmt.Errorf("DATABASE_URL is not set")
	}

	DB, err = sql.Open("postgres", databaseURL)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	err = DB.Ping()
	if err != nil {
		DB.Close()
		return fmt.Errorf("database connection failed: %w", err)
	}

	fmt.Println("Connected to NEON PostgreSQL server")

	schema, err := os.ReadFile("database/schema.sql")
	if err != nil {
		DB.Close()
		return fmt.Errorf("failed to read schema.sql: %w", err)
	}

	_, err = DB.Exec(string(schema))
	if err != nil {
		DB.Close()
		return fmt.Errorf("failed to execute schema.sql: %w", err)
	}

	fmt.Println("Database schema initialized")

	return nil
}
