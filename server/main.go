// server/main.go
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/webbben/code-duel/firebase"
	"github.com/webbben/code-duel/handlers"
)

func main() {

	_ = firebase.GetFirestoreClient()

	router := mux.NewRouter()
	router.HandleFunc("/", YourHandlerFunction).Methods("GET")

	router.HandleFunc("/users/{id}", handlers.GetUserHandler).Methods("GET")
	router.HandleFunc("/users", handlers.CreateUserHandler).Methods("POST")
	router.HandleFunc("/test", handlers.Test).Methods("GET")

	port := ":8080"
	fmt.Printf("Server is running on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, router))
}

func YourHandlerFunction(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, your Go server is up and running!")
}
