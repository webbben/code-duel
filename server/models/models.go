package models

// Users of the app
type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

// API request for creating user
type CreateUserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Problems that can be played in a match room
type Problem struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Difficulty  int    `json:"difficulty"`
}

// A Match room - room where users can solve problems either competitively or collaboratively
type Room struct {
	Name            string `json:"name"`
	Occupancy       int    `json:"occupancy"`
	GameMode        int    `json:"gamemode"`
	Difficulty      int    `json:"difficulty"`
	Password        string `json:"password"`
	AllowSpectators bool   `json:"spectators"`
	Status          string `json:"status"`
	Owner           string `json:"user"`
}
