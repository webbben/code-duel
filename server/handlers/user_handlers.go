package userHandlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/webbben/code-duel/firebase"
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
	enableCors(&w)
	// Decode the incoming JSON payload into a User struct
	var newUser models.User
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		fmt.Println("error creating user!")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var success bool
	firebase.CreateUser(&newUser, &success)

	if success == false {
		response := map[string]interface{}{
			"success": false,
			"error":   "failed to create user",
		}
		responseJSON, err := json.Marshal(response)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		// respond with 400 bad request message
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		w.Write(responseJSON)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"user":    newUser,
	}
	responseJSON, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	fmt.Printf("New User: %+v\n", newUser)

	// Respond with a success message
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(responseJSON)
}

func Test(w http.ResponseWriter, r *http.Request) {
	client := firebase.GetFirestoreClient()
	if client == nil {
		fmt.Println("client is null!")
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, `{"message": "Test!"}`)
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
}
