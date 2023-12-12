package roomHandlers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"slices"
	"sync"

	"cloud.google.com/go/firestore"
	"github.com/gorilla/mux"
	"github.com/webbben/code-duel/firebase"
	authHandlers "github.com/webbben/code-duel/handlers/auth"
	"github.com/webbben/code-duel/handlers/general"
	"github.com/webbben/code-duel/models"
)

var (
	// mutex for locking handlers for joining and leaving rooms
	roomMutexes sync.Map
)

func JoinRoomHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomID := vars["id"]

	roomMutex := general.GetMappedMutex(roomID, &roomMutexes)
	roomMutex.Lock()
	defer roomMutex.Unlock()

	roomData := loadRoomData(roomID)
	if roomData == nil {
		http.Error(w, fmt.Sprintf("Failed to join room: failed to fetch data for room %s", roomID), http.StatusBadRequest)
		return
	}

	// TODO: check if the room requires a password - if it does, verify the password

	// check if the room is full - if it is, return with a failure
	if len(roomData.Users) >= roomData.MaxCapacity {
		http.Error(w, "Room is already full", http.StatusForbidden)
		return
	}

	// add user to room
	claims, err := authHandlers.GetUserClaimsFromContext(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	err = addUserToRoom(claims.DisplayName, roomID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// return success response
	response := map[string]interface{}{
		"success": true,
	}
	general.WriteResponse(w, response)
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

	claims, err := authHandlers.GetUserClaimsFromContext(r)
	if err != nil {
		fmt.Println(err.Error()) // TODO remove
		http.Error(w, fmt.Sprintf("Unauthorized: %s", err.Error()), http.StatusUnauthorized)
		return
	}
	username := claims.DisplayName

	var request models.CreateRoomRequest
	err = json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// create new room object with the provided params, and set the ordering user as the owner
	roomID, err := CreateRoom(&request, username)
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

func CreateRoom(request *models.CreateRoomRequest, username string) (roomID string, err error) {
	ctx := context.Background()

	// create user document in firestore
	firestoreClient := firebase.GetFirestoreClient()
	if firestoreClient == nil {
		fmt.Printf("firestore client is null!")
		err = errors.New("firestore client is null")
		return
	}
	room := models.Room{
		Owner:       username,
		Title:       request.Title,
		Difficulty:  request.Difficulty,
		MaxCapacity: request.MaxCapacity,
		Users:       make([]string, 0),
		Status:      "waiting",
		ReqPassword: request.ReqPassword,
		Password:    request.Password,
	}
	docRef, _, err := firestoreClient.Collection("rooms").Add(ctx, room)
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

func GetRoomListHandler(w http.ResponseWriter, r *http.Request) {
	firestoreClient := firebase.GetFirestoreClient()
	ctx := context.Background()

	collectionRef := firestoreClient.Collection("rooms")
	if collectionRef == nil {

	}
	rooms, err := collectionRef.Documents(ctx).GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var output []map[string]interface{}
	for _, roomSnapshot := range rooms {
		id := roomSnapshot.Ref.ID
		data := roomSnapshot.Data()
		data["id"] = id // add the doc ref ID too
		output = append(output, data)
	}

	response := map[string]interface{}{
		"success": true,
		"rooms":   output,
	}
	responseJSON, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(responseJSON)
}

func GetRoomHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomID := vars["id"]
	if roomID == "" {
		http.Error(w, "No room ID found in request vars", http.StatusBadRequest)
		return
	}
	roomData := loadRoomData(roomID)
	response := map[string]interface{}{
		"success": true,
		"room":    roomData,
	}
	responseJSON, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(responseJSON)
}

// loads the data for a room from firestore
func loadRoomData(roomID string) *models.Room {
	firestoreClient := firebase.GetFirestoreClient()
	ctx := context.Background()
	snapshot, err := firestoreClient.Collection("rooms").Doc(roomID).Get(ctx)
	if err != nil {
		return nil
	}
	var roomData models.Room
	err = snapshot.DataTo(&roomData)
	if err != nil {
		return nil
	}
	return &roomData
}

func addUserToRoom(username string, roomID string) error {
	firestoreClient := firebase.GetFirestoreClient()
	ctx := context.Background()
	// Reference to the room document
	roomRef := firestoreClient.Collection("rooms").Doc(roomID)

	err := firestoreClient.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		// Get the current room data
		doc, err := tx.Get(roomRef)
		if err != nil {
			return err
		}
		var room models.Room
		if err := doc.DataTo(&room); err != nil {
			return err
		}

		// user is already in the room, so do nothing
		if slices.Contains(room.Users, username) {
			return nil
		}

		room.Users = append(room.Users, username)
		// Update the document in Firestore
		err = tx.Update(roomRef, []firestore.Update{
			{Path: "Users", Value: room.Users},
		})
		if err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return fmt.Errorf("Failed to update users in room: %v", err)
	}
	return nil
}
