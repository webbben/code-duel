// code for handling room resources in the firestore database
package rooms

import (
	"context"
	"errors"
	"fmt"
	"log"
	"slices"

	"cloud.google.com/go/firestore"
	"github.com/webbben/code-duel/firebase"
	"github.com/webbben/code-duel/handlers/general"
	"github.com/webbben/code-duel/models"
)

// create room in firestore
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

// adds or removes a user from a room. code is combined since logic is similar
func AddOrRemoveUser(username string, roomID string, add bool) error {
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

func GetRoom(roomID string) (*models.Room, error) {
	ctx := context.Background()
	firestoreClient := firebase.GetFirestoreClient()
	snapshot, err := firestoreClient.Collection("rooms").Doc(roomID).Get(ctx)
	if err != nil {
		return nil, err
	}
	var room *models.Room
	err = snapshot.DataTo(&room)
	if err != nil {
		fmt.Printf("get room: %s\n", err.Error())
		return nil, err
	}
	return room, nil
}

func GetRooms() ([]models.Room, error) {
	firestoreClient := firebase.GetFirestoreClient()
	collectionRef := firestoreClient.Collection("rooms")
	if collectionRef == nil {
		return nil, errors.New("failed to get collection ref")
	}
	ctx := context.Background()
	snapshots, err := collectionRef.Documents(ctx).GetAll()
	if err != nil {
		return nil, errors.New(fmt.Sprintf("failed to get snapshots; %v", err))
	}

	// get the data out of the snapshots
	var docs []models.Room
	for _, snapshot := range snapshots {
		id := snapshot.Ref.ID
		var data models.Room
		err = snapshot.DataTo(&data)
		if err != nil {
			return nil, errors.New(fmt.Sprintf("failed to get data from snapshot; %v", err))
		}
		data.ID = id // add the document ID too
		docs = append(docs, data)
	}
	return docs, nil
}

// set game information in room
func SetupGameContext(roomID string, problemID string) error {
	updates := []firestore.Update{
		{Path: "Status", Value: "In game"},
		{Path: "InGame", Value: true},
		{Path: "Problem", Value: problemID},
	}
	return firebase.UpdateDocument("rooms", roomID, updates)
}
