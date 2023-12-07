package roomHandlers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/webbben/code-duel/firebase"
	authHandlers "github.com/webbben/code-duel/handlers/auth"
	"github.com/webbben/code-duel/models"
)

func JoinRoomHandler(w http.ResponseWriter, r *http.Request) {
	// lock to handle concurrency, and defer unlock

	// check if the room requires a password - if it does, verify the password attached in a header or body property.

	// check if the room is full - if it is, return with a failure

	// if it isn't add the user to the room.

	// return success response
}

func LeaveRoomHandler(w http.ResponseWriter, r *http.Request) {
	// lock to handle concurrency, defer unlock

	// check if user is the owner of the room - if so, delete the room

	// check if user is in room - if so, remove the user and decrement the room's current occupancy

	// check if there are any other users left in the room - if not, delete the room

	// return success response
}

func CreateRoomHandler(w http.ResponseWriter, r *http.Request) {

	// I don't think I need to lock here - there shouldn't be an issue with multiple threads making different rooms at the same time... right?

	userID := authHandlers.GetUserIDFromContext(r)
	if userID == "" {
		fmt.Println("couldn't find userID in context!") // TODO remove
		http.Error(w, "Unauthorized: no userID found in request context", http.StatusUnauthorized)
		return
	}

	var request models.CreateRoomRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if userID != request.Owner {
		http.Error(w, "Unauthorized: requesting userID isn't the owner of the room", http.StatusUnauthorized)
		return
	}

	// create new room object with the provided params, and set the ordering user as the owner
	roomID, err := CreateRoom(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"roomID":  roomID,
	}
	responseJSON, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// return success response if no errors occur
	fmt.Printf("New room: %+v\n", roomID)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(responseJSON)
}

func CreateRoom(request *models.CreateRoomRequest) (roomID string, err error) {
	ctx := context.Background()

	// create user document in firestore
	firestoreClient := firebase.GetFirestoreClient()
	if firestoreClient == nil {
		fmt.Printf("firestore client is null!")
		err = errors.New("firestore client is null")
		return
	}
	docRef, _, err := firestoreClient.Collection("rooms").Add(ctx, map[string]interface{}{
		"owner":       request.Owner,
		"title":       request.Title,
		"difficulty":  request.Difficulty,
		"gamemode":    request.GameMode,
		"maxcapacity": request.MaxCapacity,
	})
	if err != nil {
		log.Fatalf("Failed creating room: %v", err)
		return
	}
	roomID = docRef.ID
	return
}

func DeleteRoomHandler(w http.ResponseWriter, r *http.Request) {
	// lock to handle concurrency, defer unlock (?)

	// check if the room's owner is the same as the user ordering the deletion

	// if the user isn't the same - return failure unauthorized response
	// if the user is, delete the room - return success response
}
