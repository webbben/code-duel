// server/main.go
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/webbben/code-duel/firebase"
	authHandlers "github.com/webbben/code-duel/handlers/auth"
	roomHandlers "github.com/webbben/code-duel/handlers/room"
	userHandlers "github.com/webbben/code-duel/handlers/user"
	"github.com/webbben/code-duel/middleware"
)

// functions

func main() {
	_ = firebase.GetFirestoreClient()
	router := mux.NewRouter()
	protectedRouter := router.PathPrefix("/protected").Subrouter()

	// middleware
	// CORS handling. Note: you must add OPTIONS method to API endpoint for this middleware to run!
	router.Use(middleware.CorsMiddleware)
	// add authentication middleware to protected APIs too
	protectedRouter.Use(middleware.CorsMiddleware, middleware.AuthenticationMiddleware)

	// TODO: serve static files for react app here?
	router.HandleFunc("/", YourHandlerFunction).Methods("GET")

	// auth API
	router.HandleFunc("/verifyToken", authHandlers.VerifyTokenHandler).Methods("POST", "OPTIONS")

	// user API
	router.HandleFunc("/users/{id}", userHandlers.GetUserHandler).Methods("GET", "OPTIONS") // TODO
	router.HandleFunc("/users", userHandlers.CreateUserHandler).Methods("POST", "OPTIONS")

	// room API
	protectedRouter.HandleFunc("/rooms", roomHandlers.CreateRoomHandler).Methods("POST", "OPTIONS")
	router.HandleFunc("/rooms", roomHandlers.GetRoomListHandler).Methods("GET", "OPTIONS")
	protectedRouter.HandleFunc("/rooms/{id}/join", roomHandlers.JoinRoomHandler).Methods("POST", "OPTIONS") // TODO

	port := ":8080"
	fmt.Printf("Server is running on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, router))
}

func YourHandlerFunction(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, your Go server is up and running!")
}
