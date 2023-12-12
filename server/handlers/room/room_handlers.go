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
	JoinOrLeaveRoomHandler(w, r, true)
}

func LeaveRoomHandler(w http.ResponseWriter, r *http.Request) {
	JoinOrLeaveRoomHandler(w, r, false)
}

// combined the code for joining and leaving rooms since the logic is nearly the same
func JoinOrLeaveRoomHandler(w http.ResponseWriter, r *http.Request, join bool) {
	vars := mux.Vars(r)
	roomID := vars["id"]
	roomMutex := general.GetMappedMutex(roomID, &roomMutexes)
	roomMutex.Lock()
	defer roomMutex.Unlock()

	claims, err := authHandlers.GetUserClaimsFromContext(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	err = addOrRemoveUser(claims.DisplayName, roomID, join)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	response := map[string]interface{}{
		"success": true,
	}
	general.WriteResponse(w, response)
}

func CreateRoomHandler(w http.ResponseWriter, r *http.Request) {
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

// adds or removes a user from a room. code is combined since logic is similar
func addOrRemoveUser(username string, roomID string, add bool) error {
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
		err = doc.DataTo(&room)
		if err != nil {
			return err
		}
		if add {
			if len(room.Users) >= room.MaxCapacity {
				return errors.New("Add user: room is already full.")
			}
		} else {
			// no users in room, so do nothing
			if len(room.Users) == 0 {
				return nil
			}
		}

		// trying to add user but they're already in the room, so do nothing
		if add && slices.Contains(room.Users, username) {
			return nil
		}
		// trying to remove user but they're not in room, so do nothing
		if !add && !slices.Contains(room.Users, username) {
			return nil
		}

		if add {
			room.Users = append(room.Users, username)
		} else {
			room.Users = general.RemoveElementFromArray(username, room.Users)
		}
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
