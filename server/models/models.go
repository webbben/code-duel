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
	Owner       string   `json:"owner"`       // owner of the room is the user that created it
	Title       string   `json:"title"`       // title of the room
	Difficulty  int      `json:"difficulty"`  // difficulty of the problems for this room
	MaxCapacity int      `json:"maxcapacity"` // limit to number of users allowed in room (up to 5)
	Users       []string `json:"users"`       // list of users in the room
	Status      string   `json:"status"`      // status of the room; if it's waiting, or in game, etc
	ReqPassword bool     `json:"reqpassword"` // whether this room requires a password to join
	Password    string   `json:"password"`    // the password for this room, if applicable
}
