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

	http.HandleFunc("/login", handlers.LoginHandler)
	http.HandleFunc("/profile", handlers.ProfileHandler)
	http.HandleFunc("/logout", handlers.LogoutHandler)

	fmt.Println("Server running on http://localhost:8080")

	log.Fatal(
		http.ListenAndServe(":8080", nil),
	)
}
