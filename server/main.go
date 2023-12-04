// server/main.go
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/webbben/code-duel/firebase"
	userHandlers "github.com/webbben/code-duel/handlers"
)

func main() {
	_ = firebase.GetFirestoreClient()
	router := mux.NewRouter()

	router.HandleFunc("/{route:.*}", CORSOptionsHandler).Methods(http.MethodOptions)

	router.HandleFunc("/", YourHandlerFunction).Methods("GET")

	router.HandleFunc("/users/{id}", userHandlers.GetUserHandler).Methods("GET")
	router.HandleFunc("/users", userHandlers.CreateUserHandler).Methods("POST")
	router.HandleFunc("/test", userHandlers.Test).Methods("GET")

	port := ":8080"
	fmt.Printf("Server is running on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, router))
}

func YourHandlerFunction(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, your Go server is up and running!")
}

// CORS middleware for handling OPTIONS preflight requests
func CORSOptionsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.WriteHeader(http.StatusOK)
}
