package authHandlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/webbben/code-duel/firebase"
)

type Claims struct {
	UserID      string
	Email       string
	DisplayName string
}

var ClaimsKey string = "userClaims"

// Effectively a login handler; verifies a token and returns the user data in the response
func VerifyTokenHandler(w http.ResponseWriter, r *http.Request) {
	// get ID token and remove "Bearer " prefix
	authHeader := r.Header.Get("Authorization")
	token, err := ExtractTokenFromHeader(authHeader)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	claimsMap, err := VerifyTokenAndGetClaims(token)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// extract user info from claims and write to response
	claims, err := ExtractTokenClaims(claimsMap)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := map[string]interface{}{
		"success":  true,
		"userID":   claims.UserID,
		"username": claims.DisplayName,
		"email":    claims.Email,
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

func ExtractTokenFromHeader(authHeader string) (token string, err error) {
	if authHeader == "" {
		err = errors.New("Unauthorized: No Authentication Header found.")
		return
	}
	// Extract the token from the "Bearer" scheme
	splitToken := strings.Split(authHeader, "Bearer ")
	if len(splitToken) != 2 {
		err = errors.New("Unauthorized: Malformed ID token")
		return
	}
	token = splitToken[1]
	return
}

// extracts the user values from a token's claims
func ExtractTokenClaims(claimsMap map[string]interface{}) (claims Claims, err error) {
	userID, ok := claimsMap["user_id"].(string)
	if !ok {
		err = errors.New("failed to extract userID from token claims")
		return
	}
	username, ok := claimsMap["name"].(string)
	if !ok {
		err = errors.New("failed to extract username from token claims")
		return
	}
	email, ok := claimsMap["email"].(string)
	if !ok {
		err = errors.New("failed to extract email from token claims")
		return
	}
	claims = Claims{
		UserID:      userID,
		DisplayName: username,
		Email:       email,
	}
	return
}

// Extract the user ID from the request context
func GetUserClaimsFromContext(r *http.Request) (claims Claims, err error) {
	claims, ok := r.Context().Value(ClaimsKey).(Claims)
	if !ok {
		err = errors.New("Failed to retrieve user claims from context")
	}
	return
}

// Verifies a given token and returns the associated claims map
func VerifyTokenAndGetClaims(token string) (claims map[string]interface{}, err error) {
	ctx := context.Background()
	// validate token
	authClient := firebase.GetAuthClient()
	authToken, err := authClient.VerifyIDToken(ctx, token)
	if err != nil {
		return
	}
	claims = authToken.Claims
	return
}
