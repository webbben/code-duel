// server/main.go
package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/webbben/code-duel/firebase"
	"github.com/webbben/code-duel/firebase/rooms"
	authHandlers "github.com/webbben/code-duel/handlers/auth"
	"github.com/webbben/code-duel/handlers/code"
	problem_handlers "github.com/webbben/code-duel/handlers/problem"
	roomHandlers "github.com/webbben/code-duel/handlers/room"
	userHandlers "github.com/webbben/code-duel/handlers/user"
	"github.com/webbben/code-duel/handlers/websocket"
	"github.com/webbben/code-duel/middleware"
)

// functions

func main() {
	// initialize firebase
	_ = firebase.GetFirestoreClient()
	// launch task schedule goroutine
	go scheduledJobs()

	// router stuff
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
	router.HandleFunc("/rooms/{id}", roomHandlers.GetRoomHandler).Methods("GET", "OPTIONS")
	protectedRouter.HandleFunc("/rooms/{id}/join", roomHandlers.JoinRoomHandler).Methods("POST", "OPTIONS")
	protectedRouter.HandleFunc("/rooms/{id}/leave", roomHandlers.LeaveRoomHandler).Methods("POST", "OPTIONS")
	protectedRouter.HandleFunc("/rooms/{id}/launchGame", roomHandlers.LaunchGameRoomHandler).Methods("POST", "OPTIONS")
	protectedRouter.HandleFunc("/rooms/{id}/game", roomHandlers.LoadGameHandler).Methods("GET", "OPTIONS")

	// problem API
	router.HandleFunc("/problems/{id}", problem_handlers.GetProblemHandler).Methods("GET", "OPTIONS")
	router.HandleFunc("/problems/{id}/template/{lang}", problem_handlers.GetProblemTemplate).Methods("GET", "OPTIONS")
	router.HandleFunc("/problems", problem_handlers.GetProblemListHandler).Methods("GET", "OPTIONS")

	// submit code API
	protectedRouter.HandleFunc("/testCode", code.HandleTestCode).Methods("POST", "OPTIONS")
	protectedRouter.HandleFunc("/submitCode", code.HandleSubmitCode).Methods("POST", "OPTIONS")

	// websocket communication
	router.HandleFunc("/ws", websocket.HandleWebSocketConnection)

	// TODO - handle automated tasks like cleanup - launched as their own go routines

	port := ":8080"
	fmt.Printf("Server is running on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, router))
}

func YourHandlerFunction(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, your Go server is up and running!")
}

// place to register periodic jobs such as automated database cleanup, misc maintenance, etc.
func scheduledJobs() {
	ticker := time.NewTicker(time.Hour)
	defer ticker.Stop()

	// tasks to run on server start-up
	log.Println("SCHED: Performing jobs on server startup...")
	cleanupEmptyRooms()
	log.Println("SCHED: Server startup jobs complete.")

	select {
	case <-ticker.C:
		// tasks to run on an hourly basis
		log.Println("SCHED: Performing hourly jobs...")
		cleanupEmptyRooms()
		log.Println("SCHED: Hourly jobs complete.")
	}
}

// cleans up any empty rooms that haven't been closed yet
func cleanupEmptyRooms() {
	rooms, err := rooms.GetRooms()
	if err != nil {
		log.Printf("error during room cleanup: failed to get rooms data; %v\n", err)
		return
	}
	delCount := 0
	for _, room := range rooms {
		if len(room.Users) == 0 {
			_, err := firebase.DeleteDocument("rooms", room.ID)
			if err != nil {
				log.Printf("error during room cleanup: failed to delete room %s; %v\n", room.ID, err)
			} else {
				delCount++
			}
			continue
		}
		// check that each room actually has client connections still, and aren't orphaned w/ incorrect user counts
		if !websocket.RoomHasClients(room.ID) {
			_, err := firebase.DeleteDocument("rooms", room.ID)
			if err != nil {
				log.Printf("error during room cleanup: failed to delete room %s; %v\n", room.ID, err)
			} else {
				delCount++
			}
		}
	}
	log.Printf("room cleanup complete: %v rooms deleted\n", delCount)
}
