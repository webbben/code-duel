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
	Title       string `json:"title"`       // title of the room
	MaxCapacity int    `json:"maxcapacity"` // limit to number of users allowed in room (up to 5)
	Difficulty  int    `json:"difficulty"`  // difficulty for problems - 1=easy, 2=med, 3=hard
	ReqPassword bool   `json:"reqpassword"` // whether or not a password is required for this room
	Password    string `json:"password"`    // password for this room (if applicable)
}

type Room struct {
	Owner         string   `json:"Owner"`         // owner of the room is the user that created it
	Title         string   `json:"Title"`         // title of the room
	Difficulty    int      `json:"Difficulty"`    // difficulty of the problems for this room
	MaxCapacity   int      `json:"MaxCapacity"`   // limit to number of users allowed in room (up to 5)
	Users         []string `json:"Users"`         // list of users in the room
	Status        string   `json:"Status"`        // status message of the room; if it's waiting, or in game, etc
	InGame        bool     `json:"InGame"`        // whether this room is currently in game or not
	ReqPassword   bool     `json:"ReqPassword"`   // whether this room requires a password to join
	Password      string   `json:"Password"`      // the password for this room, if applicable
	GameMode      int      `json:"GameMode"`      // game mode; vs or coop
	TimeLimit     int      `json:"TimeLimit"`     // time limit to solve the problem
	RandomProblem bool     `json:"RandomProblem"` // whether its a random problem (true) or user selects it (false)
	Problem       Problem  `json:"Problem"`       // problem to be solved in the game
}

type ProblemOverview struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Difficulty int    `json:"difficulty"`
	QuickDesc  string `json:"quickDesc"`
}

// getter functions for a problem
type ProblemFunc struct {
	GetTemplate func(string) string `json:"-"`
}

type Problem struct {
	ProblemOverview
	ProblemFunc
	FullDesc  string     `json:"fullDesc"`
	TestCases []TestCase `json:"testCases"`
	FullCases []TestCase `json:"fullCases"`
}

type TestCase []any
