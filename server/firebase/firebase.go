// for initializing firebase and getting firestore and auth clients
package firebase

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/webbben/code-duel/models"
	"google.golang.org/api/option"
)

var firestoreClient *firestore.Client = nil
var authClient *auth.Client = nil

func init() {
	// get firebase vars and put together the credentials JSON
	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	clientEmail := os.Getenv("FIREBASE_CLIENT_EMAIL")
	privateKey := os.Getenv("FIREBASE_PRIVATE_KEY")
	if projectID == "" || clientEmail == "" || privateKey == "" {
		fmt.Println("One or more firebase environment variables is missing")
		return
	}
	ctx := context.Background()
	opt := option.WithCredentialsJSON([]byte(fmt.Sprintf(`{
		"type": "service_account",
		"project_id": "%s",
		"private_key_id": "a38cda0726982f1f98fdf992e97bde9698303b52",
		"private_key": "%s",
		"client_email": "%s",
		"client_id": "101472714036584736551",
		"auth_uri": "https://accounts.google.com/o/oauth2/auth",
		"token_uri": "https://oauth2.googleapis.com/token",
		"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
		"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-z09pt%%40code-duel-dd410.iam.gserviceaccount.com",
		"universe_domain": "googleapis.com"
	}`, projectID, privateKey, clientEmail)))

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalln("failed to create firebase app:", err)
	}

	firestoreClient, err = app.Firestore(ctx)
	if err != nil {
		log.Fatalln("failed to connect to firestore client:", err)
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
