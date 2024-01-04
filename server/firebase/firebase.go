// for initializing firebase and getting firestore and auth clients
package firebase

import (
	"context"
	"errors"
	"fmt"
	"log"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/webbben/code-duel/models"
	"google.golang.org/api/option"
)

var firestoreClient *firestore.Client = nil
var authClient *auth.Client = nil

func init() {
	// Use a service account
	ctx := context.Background()
	sa := option.WithCredentialsFile("/Users/benwebb/Dev/Projects/code-duel/server/firebase/credentials.json")
	app, err := firebase.NewApp(ctx, nil, sa)
	if err != nil {
		log.Fatalln(err)
	}

	firestoreClient, err = app.Firestore(ctx)
	if err != nil {
		log.Fatalln(err)
	}

	authClient, err = app.Auth(ctx)
	if err != nil {
		log.Fatalf("error getting Auth client: %v\n", err)
	}

	fmt.Println("firebase init complete")
}

func CreateUser(user *models.User, success *bool) {
	*success = true
	if firestoreClient == nil {
		fmt.Printf("firestore client is null!")
		*success = false
		return
	}
	_, _, err := firestoreClient.Collection("users").Add(context.Background(), map[string]interface{}{
		"username": user.Username,
		"email":    user.Email,
	})
	if err != nil {
		log.Fatalf("Failed adding user: %v", err)
		*success = false
	}
}

// GetFirestoreClient returns the initialized Firestore client
func GetFirestoreClient() *firestore.Client {
	return firestoreClient
}

func GetAuthClient() *auth.Client {
	return authClient
}

// gets all documents in a given collection
func GetAllDocsInCollection(collectionPath string) (docs []map[string]interface{}, err error) {
	collectionRef := firestoreClient.Collection(collectionPath)
	if collectionRef == nil {
		err = errors.New("failed to get collection ref")
		return
	}
	ctx := context.Background()
	snapshots, err := collectionRef.Documents(ctx).GetAll()
	if err != nil {
		return
	}
	for _, snapshot := range snapshots {
		id := snapshot.Ref.ID
		data := snapshot.Data()
		data["id"] = id // add the document ID too
		docs = append(docs, data)
	}
	return
}

// deletes a document in firestore
func DeleteDocument(collectionPath string, documentID string) (writeResult *firestore.WriteResult, err error) {
	if collectionPath == "" || documentID == "" {
		return nil, errors.New("failed to delete document: missing collection path or document ID")
	}
	ctx := context.Background()
	writeResult, err = firestoreClient.Collection(collectionPath).Doc(documentID).Delete(ctx)
	return
}

// updates a document with the given changes
func UpdateDocument(collectionPath string, documentID string, updates []firestore.Update) error {
	ctx := context.Background()
	docRef := firestoreClient.Collection(collectionPath).Doc(documentID)
	_, err := docRef.Update(ctx, updates)
	return err
}
