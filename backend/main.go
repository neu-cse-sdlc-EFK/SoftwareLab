package main

import (
	"fmt"
	"log"
	"net/http"

	"SoftwareLab/database"
	"SoftwareLab/handlers"
)

func main() {

	err := database.Connect()
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/login", handlers.LoginHandler)
	mux.HandleFunc("/logout", handlers.LogoutHandler)
	mux.HandleFunc("/profile", handlers.ProfileHandler)

	// admin-only routes
	mux.HandleFunc("/addstudent", handlers.RequireRole("admin")(handlers.AddStudent))
	mux.HandleFunc("/addteacher", handlers.RequireRole("admin")(handlers.AddTeacher))
	mux.HandleFunc("GET /api/classrooms", handlers.RequireRole("student", "teacher")(handlers.GetClassrooms))
	mux.HandleFunc("GET /api/classrooms/{id}/messages", handlers.RequireRole("student", "teacher")(handlers.GetMessages))
	mux.HandleFunc("POST /api/classrooms/{id}/messages", handlers.RequireRole("student", "teacher")(handlers.PostMessage))
	mux.HandleFunc("GET /api/classrooms/{id}/notices", handlers.RequireRole("student", "teacher")(handlers.GetNotices))
	mux.HandleFunc("POST /api/classrooms/{id}/notices", handlers.RequireRole("teacher")(handlers.PostNotice))
	mux.HandleFunc("GET /api/me", handlers.GetMe)
	handler := handlers.CORSMiddleware(mux)

	fmt.Println("Server running on http://localhost:8080")

	log.Fatal(
		http.ListenAndServe(":8080", handler),
	)
}
