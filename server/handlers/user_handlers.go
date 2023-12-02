// server/handlers/user_handlers.go
package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/webbben/code-duel/models"
)

// GetUserHandler handles GET requests to retrieve a user by ID
func GetUserHandler(w http.ResponseWriter, r *http.Request) {
	// Extract user ID from the request parameters
	vars := mux.Vars(r)
	userID := vars["id"]

	// In a real application, you would fetch the user from the database
	// For simplicity, let's create a sample user
	user := models.User{
		ID:       userID,
		Username: "sample_user",
		Email:    "sample@example.com",
	}

	// Convert user to JSON and send it in the response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// CreateUserHandler handles POST requests to create a new user
func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	// Decode the incoming JSON payload into a User struct
	var newUser models.User
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// In a real application, you would save the new user to the database
	// For simplicity, let's print the user details for now
	fmt.Printf("New User: %+v\n", newUser)

	// Respond with a success message
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, `{"message": "User created successfully"}`)
}
