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

// API request for creating room
type CreateRoomRequest struct {
	Title           string `json:"title"`           // title of the room
	MaxCapacity     int    `json:"maxcapacity"`     // limit to number of users allowed in room (up to 5)
	Difficulty      int    `json:"difficulty"`      // difficulty for problems - 1=easy, 2=med, 3=hard
	ReqPassword     bool   `json:"reqpassword"`     // whether or not a password is required for this room
	Password        string `json:"password"`        // password for this room (if applicable)
	AllowSpectators bool   `json:"allowspectators"` // whether or not spectators are allowed
}

type Room struct {
	Owner        string       `json:"owner"`        // owner of the room is the user that created it
	MaxCapacity  int          `json:"maxcapacity"`  // limit to number of users allowed in room (up to 5)
	GameSettings GameSettings `json:"gamesettings"` // settings for the problems solved in-game
}

// settings for a code-duel game
type GameSettings struct {
	Difficulty       int    `json:"difficulty"`    // difficulty for problems - 1=easy, 2=med, 3=hard
	TimeLimit        int    `json:"timelimit"`     // time limit to solve problems
	GameMode         int    `json:"gamemode"`      // game mode - either vs or co-op
	ProblemSelection int    `json:"problemselect"` // how problems are selected - 1 = random, 2 = owner select
	Problem          string `json:"problem"`       // ID of the problem to solve in-game - selected based on ProblemSelection
}

// Problems that can be played in a match room
type Problem struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Difficulty  int    `json:"difficulty"`
}
