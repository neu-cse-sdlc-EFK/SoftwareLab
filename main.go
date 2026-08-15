package main

import (
	"SoftwareLab/database"
	"fmt"
	"log"
	"net/http"
)

func main() {
	DB, err := database.Connect()
	if err != nil {
		fmt.Println(err.Error())
	}
	var x int
	DB.QueryRow("select 100").Scan(&x)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
