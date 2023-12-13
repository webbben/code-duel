package middleware

import (
	"context"
	"log"
	"net/http"

	authHandlers "github.com/webbben/code-duel/handlers/auth"
)

var debug = false

func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//log.Println("cors middleware")
		// Set CORS headers for all requests
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == "OPTIONS" {

			w.WriteHeader(http.StatusOK)
			return
		}

		// Call the next handler in the chain
		next.ServeHTTP(w, r)
	})
}

// Middleware to handle token authentication
func AuthenticationMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extract the token from the Authorization header
		//log.Println("auth middleware")
		tokenString, err := authHandlers.ExtractTokenFromHeader(r.Header.Get("Authorization"))
		if err != nil {
			log.Println("failed to extract token from header")
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		// Validate and extract claims from the token
		claimsMap, err := authHandlers.VerifyTokenAndGetClaims(tokenString)
		if err != nil {
			log.Println("token verification failed")
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}
		claims, err := authHandlers.ExtractTokenClaims(claimsMap)
		if err != nil {
			log.Println("failed to extract token claims")
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		// Add the user claims to the request context
		ctx := context.WithValue(r.Context(), authHandlers.ClaimsKey, claims)
		r = r.WithContext(ctx)

		// Call the next handler in the chain
		next.ServeHTTP(w, r)
	})
}
