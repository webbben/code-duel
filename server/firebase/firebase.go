// server/firebase/firestore.go
package firebase

import (
	"context"
	"fmt"
	"log"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"github.com/webbben/code-duel/models"
	"google.golang.org/api/option"
)

var firestoreClient *firestore.Client = nil
var test string = "start"

func init() {
	// Use a service account
	ctx := context.Background()
	sa := option.WithCredentialsFile("/Users/benwebb/Dev/Projects/code-duel/server/firebase/credentials.json")
	app, err := firebase.NewApp(ctx, nil, sa)
	if err != nil {
		log.Fatalln(err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalln(err)
	}

	firestoreClient = client
	fmt.Println("firestore init complete")
}

func CreateUser(user *models.User) {
	//fmt.Printf("creating user")
	fmt.Println(test)
	if firestoreClient == nil {
		fmt.Printf("firestore client is null!")
		return
	}
	_, _, err := firestoreClient.Collection("users").Add(context.Background(), map[string]interface{}{
		"username": user.Username,
		"email":    user.Username,
	})
	if err != nil {
		log.Fatalf("Failed adding user: %v", err)
	}
}

// GetFirestoreClient returns the initialized Firestore client
func GetFirestoreClient() *firestore.Client {
	return firestoreClient
}
