package problem

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/webbben/code-duel/firebase"
	"github.com/webbben/code-duel/handlers/general"
	"github.com/webbben/code-duel/models"
)

func CreateProblemHandler(w http.ResponseWriter, r *http.Request) {
	var request models.Problem
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, "Couldn't decode request body", http.StatusBadRequest)
	}

	firestoreClient := firebase.GetFirestoreClient()
	ctx := context.Background()

	docRef, _, err := firestoreClient.Collection("problems").Add(ctx, request)
	if err != nil {
		http.Error(w, "Failed to create Problem", http.StatusInternalServerError)
	}
	problemID := docRef.ID
	general.WriteResponse(w, true, map[string]interface{}{
		"problemID": problemID,
	})
}

func GetProblemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	problemID := vars["id"]
	if problemID == "" {
		http.Error(w, "problem ID not found in URL", http.StatusBadRequest)
	}
	problem, err := firebase.GetDocument("problems", problemID)
	if err != nil {
		http.Error(w, "failed to retrieve document from firestore", http.StatusInternalServerError)
	}
	general.WriteResponse(w, true, map[string]interface{}{
		"problem": problem,
	})
}

func GetProblemListHandler(w http.ResponseWriter, r *http.Request) {
	problems, err := firebase.GetAllDocsInCollection("problems")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	general.WriteResponse(w, true, map[string]interface{}{
		"problems": problems,
	})
}
