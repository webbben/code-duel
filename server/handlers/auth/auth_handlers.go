package authHandlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/webbben/code-duel/firebase"
)

var verifyTokenRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Token    string `json:"token"`
}

func VerifyToken(w http.ResponseWriter, r *http.Request) {
	// get ID token and remove "Bearer " prefix
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	token := authHeader[7:] // strip "Bearer " prefix
	ctx := context.Background()

	// validate token
	authClient := firebase.GetAuthClient()
	_, err := authClient.VerifyIDToken(ctx, token)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	response := map[string]interface{}{
		"success": true,
	}
	responseJSON, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseJSON)
}
