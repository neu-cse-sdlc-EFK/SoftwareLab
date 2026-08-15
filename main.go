package main

import (
	"fmt"
	"net/http"
)

<input type="text" name="email">

func loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		fmt.Println("login successful")
		return
	} else {
		fmt.Println("login successful")
		return
	}
}

func main() {
	http.HandleFunc("/login", "loginHandler")
}
