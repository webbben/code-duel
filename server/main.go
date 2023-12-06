// server/main.go
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/webbben/code-duel/firebase"
	authHandlers "github.com/webbben/code-duel/handlers/auth"
	userHandlers "github.com/webbben/code-duel/handlers/user"
)

func main() {
	_ = firebase.GetFirestoreClient()
	router := mux.NewRouter()

	// middleware
	// CORS handling. Note: you must add OPTIONS method to API endpoint for this middleware to run!
	router.Use(corsMiddleware)

	// TODO: serve static files for react app here?
	router.HandleFunc("/", YourHandlerFunction).Methods(http.MethodGet)

	// auth API
	router.HandleFunc("/verifyToken", authHandlers.VerifyToken).Methods(http.MethodPost, http.MethodOptions)

	// user API
	router.HandleFunc("/users/{id}", userHandlers.GetUserHandler).Methods(http.MethodGet)
	router.HandleFunc("/users", userHandlers.CreateUserHandler).Methods(http.MethodPost, http.MethodOptions)

	port := ":8080"
	fmt.Printf("Server is running on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, router))
}

func YourHandlerFunction(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, your Go server is up and running!")
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers for all requests
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Call the next handler in the chain
		next.ServeHTTP(w, r)
	})
}
