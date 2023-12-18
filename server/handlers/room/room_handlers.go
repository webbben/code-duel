package roomHandlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/mux"
	"github.com/webbben/code-duel/firebase"
	"github.com/webbben/code-duel/firebase/rooms"
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
	err = rooms.AddOrRemoveUser(claims.DisplayName, roomID, join)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	if join {
		log.Printf("user %s joined room %s", claims.DisplayName, roomID)
	} else {
		log.Printf("user %s left room %s", claims.DisplayName, roomID)
	}
	general.WriteResponse(w, true, nil)
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
	roomID, err := rooms.CreateRoom(&request, username)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	general.WriteResponse(w, true, map[string]interface{}{
		"roomID": roomID,
	}, http.StatusCreated)
}

func DeleteRoomHandler(w http.ResponseWriter, r *http.Request) {
	// lock to handle concurrency, defer unlock (?)

	// check if the room's owner is the same as the user ordering the deletion

	// if the user isn't the same - return failure unauthorized response
	// if the user is, delete the room - return success response
}

func GetRoomListHandler(w http.ResponseWriter, r *http.Request) {
	output, err := firebase.GetAllDocsInCollection("rooms")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	general.WriteResponse(w, true, map[string]interface{}{
		"rooms": output,
	})
}

func GetRoomHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomID := vars["id"]
	if roomID == "" {
		http.Error(w, "No room ID found in request vars", http.StatusBadRequest)
		return
	}
	roomData, err := firebase.GetDocument("rooms", roomID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	general.WriteResponse(w, true, map[string]interface{}{
		"room": roomData,
	})
}
