package userHandlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"firebase.google.com/go/auth"
	"github.com/gorilla/mux"
	"github.com/webbben/code-duel/firebase"
	"github.com/webbben/code-duel/handlers/general"
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
	// Decode the incoming JSON payload
	var request models.CreateUserRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		fmt.Println("error creating user!")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if request.Email == "" || request.Username == "" || request.Password == "" {
		fmt.Println("Error creating user: request lacking required data")
		http.Error(w, "Error creating user: request lacking required data", http.StatusBadRequest)
		return
	}

	// TODO: add username validation!

	userID, returnErr := CreateUser(&request)
	if returnErr != "" {
		if userID != "" {
			fmt.Printf("\nUser document %s was still created though, and may require cleanup.", userID)
		}
		response := map[string]interface{}{
			"success": false,
			"error":   returnErr,
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

	// user creation succeeded; return user info back to client
	newUser := models.User{
		Username: request.Username,
		Email:    request.Email,
		ID:       userID,
	}
	fmt.Printf("New User: %+v\n", newUser)
	general.WriteResponse(w, true, map[string]interface{}{
		"success": true,
		"user":    newUser,
	}, http.StatusCreated)
}

// creates the user document in firestore and adds user in firebase auth
func CreateUser(request *models.CreateUserRequest) (userID string, returnErr string) {
	returnErr = ""
	userID = ""
	ctx := context.Background()

	// create user document in firestore
	firestoreClient := firebase.GetFirestoreClient()
	if firestoreClient == nil {
		fmt.Printf("firestore client is null!")
		returnErr = "firestore client is null"
		return
	}
	docRef, _, err := firestoreClient.Collection("users").Add(ctx, map[string]interface{}{
		"username": request.Username,
		"email":    request.Email,
	})
	if err != nil {
		log.Fatalf("Failed adding user: %v", err)
		returnErr = err.Error()
		return
	}
	userID = docRef.ID

	// create user in firebase auth, using the same user document ID
	authClient := firebase.GetAuthClient()

	params := (&auth.UserToCreate{}).
		Email(request.Email).
		EmailVerified(false).
		Password(request.Password).
		UID(userID).
		DisplayName(request.Username)

	_, err = authClient.CreateUser(ctx, params)
	if err != nil {
		log.Fatalf("error creating user: %v\n", err)
		returnErr = err.Error()
	}
	return
}
