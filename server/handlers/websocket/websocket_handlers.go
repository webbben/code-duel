package websocket

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/webbben/code-duel/firebase/rooms"
	authHandlers "github.com/webbben/code-duel/handlers/auth"
	"github.com/webbben/code-duel/models"
	problemData "github.com/webbben/code-duel/problem_data"
)

// general message struct, including all possible fields in a message. fields will vary depending on type
type Message struct {
	Type       string     `json:"type"`       // type of message: "chat_message", "room_message", etc.
	Room       string     `json:"room"`       // (all messages) room ID
	Timestamp  int        `json:"timestamp"`  // (all messages) timestamp
	Content    string     `json:"content"`    // (chat_message) chat message content
	Sender     string     `json:"sender"`     // (chat_message) chat message sender
	RoomUpdate RoomUpdate `json:"roomupdate"` // (room_update) update made to the room
}

type RoomUpdate struct {
	Type string                 `json:"type"`
	Data map[string]interface{} `json:"data"` // should have at least a "value" field, but potentially others too
}

var (
	ctx      context.Context
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	// connected clients for each chatroom
	roomClients = make(map[string]map[*websocket.Conn]bool)
	// Mutex to lock roomClients to enable synchronization between threads
	roomClientsMutex sync.Mutex
	// map of rooms to gamestates
	gameStateMap = make(map[string]GameState)
	// Mutex to lock gameStateMap to synchronize access
	gameStateMapMutex sync.Mutex
)

// checks if a given room has any client connections
func RoomHasClients(roomID string) bool {
	connMap := roomClients[roomID]
	if connMap == nil {
		return false
	}
	return len(connMap) != 0
}

func HandleWebSocketConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	room := r.URL.Query().Get("room")
	if room == "" || room == "undefined" {
		log.Println("Room parameter is missing from websocket request.")
		return
	}

	// wait until an auth message comes over websocket before allowing regular communication
	authorized := false
	username := ""

	defer func() {
		// Remove the client when the connection is closed
		log.Printf("Connection closed for %s (%p) in room %s\n", username, conn, room)
		roomClientsMutex.Lock()
		if roomClients[room][conn] == false {
			log.Println("error: connection doesn't exist in room clients map!")
		}
		delete(roomClients[room], conn)
		roomClientsMutex.Unlock()
		// try to remove the user from room as well, just in case they didn't leave properly
		if username != "" {
			rooms.AddOrRemoveUser(username, room, false)
			BroadcastUserJoinLeave(username, room, false)
		}
		conn.Close()
	}()

	// Add the new client to the roomClients map
	roomClientsMutex.Lock()
	if roomClients[room] == nil {
		roomClients[room] = make(map[*websocket.Conn]bool)
	}
	roomClients[room][conn] = true
	roomClientsMutex.Unlock()

	log.Println(fmt.Sprintf("new websocket connection %p for room %s", conn, room))

	// Handle incoming messages
	for {
		_, p, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}

		var receivedMessage Message
		err = json.Unmarshal(p, &receivedMessage)
		if err != nil {
			log.Println(err)
			return
		}

		// we'll handle each message type explicitly to ensure correct info is sent
		switch receivedMessage.Type {
		case "authorization":
			// authorization message required before regular communication is allowed
			if authorized {
				break
			}
			authToken := receivedMessage.Content
			claimsMap, err := authHandlers.VerifyTokenAndGetClaims(authToken)
			if err != nil {
				http.Error(w, "Websocket: Failed to validate auth token", http.StatusUnauthorized)
				break
			}
			claims, err := authHandlers.ExtractTokenClaims(claimsMap)
			if err != nil {
				http.Error(w, "Websocket: Failed to extract claims from token", http.StatusUnauthorized)
				break
			}
			// authorize and record user info for this connection
			authorized = true
			username = claims.DisplayName
			BroadcastUserJoinLeave(username, room, true)
		case "chat_message":
			// chat messages
			if !authorized {
				break
			}
			messageToSend := Message{
				Type:      "chat_message",
				Room:      receivedMessage.Room,
				Timestamp: receivedMessage.Timestamp,
				Content:   receivedMessage.Content,
				Sender:    receivedMessage.Sender,
			}
			broadcastMessage(messageToSend, conn)
			// We don't save the message history in firebase, just to preserve storage space
		case "room_message":
			// messages for updating room settings, users, etc.
			if !authorized {
				break
			}
			// update room in firestore if applicable
			go updateRoom(receivedMessage, room)

			messageToSend := Message{
				Type:       "room_message",
				Room:       receivedMessage.Room,
				Timestamp:  receivedMessage.Timestamp,
				RoomUpdate: receivedMessage.RoomUpdate,
			}
			broadcastMessage(messageToSend, conn)
		}
	}
}

// check for updates in room messages that we want to forward to firestore
func updateRoom(receivedMessage Message, roomID string) {
	var update map[string]interface{}
	switch receivedMessage.RoomUpdate.Type {
	case "CHANGE_DIFFICULTY":
		update = map[string]interface{}{
			"Difficulty": receivedMessage.RoomUpdate.Data["value"],
		}
	case "CHANGE_TIME_LIMIT":
		update = map[string]interface{}{
			"TimeLimit": receivedMessage.RoomUpdate.Data["value"],
		}
	case "CHANGE_PROBLEM":
		dataValue, ok := receivedMessage.RoomUpdate.Data["value"].(map[string]interface{})
		if !ok {
			// client sent unexpected data
			log.Printf("Error while updating room problem: data received from client socket is of unexpected format.")
			return
		}
		update = map[string]interface{}{
			"Problem": dataValue["id"],
		}
	case "RANDOM_PROBLEM":
		update = map[string]interface{}{
			"RandomProblem": receivedMessage.RoomUpdate.Data["value"],
			"Problem":       "",
		}
	}
	if update != nil {
		err := rooms.UpdateRoom(roomID, update)
		if err != nil {
			log.Printf("Error while sending room update: %s", err)
		}
	}
}

func broadcastMessage(message Message, sendingConnection *websocket.Conn) {
	// Iterate over all connected clients in the same room and send the message
	roomClientsMutex.Lock()
	defer roomClientsMutex.Unlock()

	counter := 0

	for client := range roomClients[message.Room] {
		// don't send messages back to the sending client, if applicable
		if client == sendingConnection {
			continue
		}
		err := client.WriteJSON(Message{
			Type:       message.Type,
			Timestamp:  message.Timestamp,
			Room:       message.Room,
			Content:    message.Content,
			Sender:     message.Sender,
			RoomUpdate: message.RoomUpdate,
		})
		if err != nil {
			log.Println(err)
		}
		counter += 1
	}
}

// broadcasts when a user joins or leaves a room
func BroadcastUserJoinLeave(username string, roomID string, join bool) {
	var updateType string
	if join {
		updateType = "USER_JOIN"
	} else {
		updateType = "USER_LEAVE"
	}
	messageToSend := Message{
		Type:      "room_message",
		Room:      roomID,
		Timestamp: int(time.Now().UnixMilli()),
		RoomUpdate: RoomUpdate{
			Type: updateType,
			Data: map[string]interface{}{
				"value": username,
			},
		},
	}
	broadcastMessage(messageToSend, nil)
}

type GameState struct {
	UserProgress map[string]int // maps user (by username) to their current progress (number of tests passed)
	TotalCases   int            // total number of test cases (incl submission tests) for this game/problem
	GameOver     bool           // whether this game has ended
	TimeLimit    int            // time limit for this game, in minutes
	TimeElapsed  int            // current time elapsed, in minutes
	Winner       string         // username of user who is currently winning - used to designate winner when game over
	WinnerScore  int            // number of tests the current winner has passed
}

// Notify users that game has started
func broadcastLaunchGame(roomID string) {
	messageToSend := Message{
		Type:      "room_message",
		Room:      roomID,
		Timestamp: int(time.Now().UnixMilli()),
		RoomUpdate: RoomUpdate{
			Type: "LAUNCH_GAME",
		},
	}
	broadcastMessage(messageToSend, nil)
}

func broadcastGameOver(roomID string, winner string) {
	messageToSend := Message{
		Type:      "game_message",
		Room:      roomID,
		Timestamp: int(time.Now().UnixMilli()),
		RoomUpdate: RoomUpdate{
			Type: "GAME_OVER",
			Data: map[string]interface{}{
				"value": winner,
			},
		},
	}
	broadcastMessage(messageToSend, nil)
}

// handle ending the game
//
// Note: make sure to UNLOCK gameStateMap before calling this!
// failure to do so will cause deadlock
func handleGameOver(roomID string, winner string) {
	log.Printf("Game over for room %s\n", roomID)
	// broadcast game over to clients
	broadcastGameOver(roomID, winner)

	gameStateMapMutex.Lock()
	// TODO record winner information to leaderboard
	// delete game state
	delete(gameStateMap, roomID)
	gameStateMapMutex.Unlock()
}

// when a user submits code, update game state with the results and check for a winner
func UpdateGameState(username string, roomID string, updateType string, updateData map[string]interface{}) {
	gameStateMapMutex.Lock()
	gameState, exists := gameStateMap[roomID]
	if !exists {
		log.Printf("Failed to get gamestate for room %s", roomID)
		gameStateMapMutex.Unlock()
		return
	}

	messageToSend := Message{
		Type:      "game_message",
		Room:      roomID,
		Timestamp: int(time.Now().UnixMilli()),
	}

	switch updateType {
	// update a users test case results
	case "CODE_SUBMIT_RESULT":
		log.Println("code submit result", updateData)
		passCount := updateData["passCount"]
		if passCount == nil {
			log.Println("Error updating game state: failed to receive passCount from updateData", updateData)
			break
		}
		gameState.UserProgress[username] = passCount.(int)
		messageToSend.RoomUpdate = RoomUpdate{
			Type: updateType,
			Data: map[string]interface{}{
				"value": passCount,
				"user":  username,
			},
		}
	}

	// update who the current winner should be
	currentWinner := gameState.Winner
	currentWinnerScore := gameState.WinnerScore
	for user, progress := range gameState.UserProgress {
		if progress > currentWinnerScore {
			currentWinner = user
			currentWinnerScore = progress
		}
	}
	gameState.Winner = currentWinner
	gameState.WinnerScore = currentWinnerScore

	gameStateMap[roomID] = gameState
	gameStateMapMutex.Unlock()

	// send update to clients
	broadcastMessage(messageToSend, nil)

	// check for win condition
	if currentWinnerScore == gameState.TotalCases {
		gameState.GameOver = true
		handleGameOver(roomID, currentWinner)
	}
}

// check for time expiration and end the game if so
//
// returns true if game is over, or false if the game continues
func onGameTick(roomID string) bool {
	gameState, exists := gameStateMap[roomID]
	// if game ended previously, gamestate may be deleted
	if !exists {
		return true
	}
	if gameState.GameOver {
		return true
	}

	// check if any users are in the room still - if not, delete the game
	if rooms.GetUserCount(roomID) == 0 {
		log.Println("No users in game; ending game...")
		handleGameOver(roomID, "")
		return true
	}

	// increment time elapsed
	gameStateMapMutex.Lock()
	gameState.TimeElapsed++
	gameStateMap[roomID] = gameState
	gameStateMapMutex.Unlock()

	log.Printf("Tick... Time elapsed: %v/%v\n", gameState.TimeElapsed, gameState.TimeLimit)

	if gameState.TimeElapsed >= gameState.TimeLimit {
		// time expired! game over
		handleGameOver(roomID, gameState.Winner)
		gameState.GameOver = true
		return true
	}
	return false
}

// starts a room's game, and starts the timer to keep track of the time limit
// and end the game if the time expires
func StartGame(roomID string, roomData models.Room) {
	// verify expected values exist
	if &roomData == nil || roomData.Problem == "" {
		log.Printf("Error starting game: StartGame request for room %s lacking required information\n", roomID)
		return
	}
	// make sure there isn't an existing game for this room
	// if there is, this room has probably already run a game before and cleanup hasn't happened yet for some reason
	gameStateMapMutex.Lock()
	if _, exists := gameStateMap[roomID]; exists {
		log.Printf("Warning: a game state for room %s already exists; ending that game to start a new one.\n", roomID)
		gameStateMapMutex.Unlock()
		// end the existing game so we can start a new one
		handleGameOver(roomID, gameStateMap[roomID].Winner)
	}

	// start a ticker to keep track of time limit
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	// initialize gamestate
	userProgressMap := map[string]int{}
	for _, user := range roomData.Users {
		userProgressMap[user] = 0
	}
	// TODO make a function to get the list of test cases (or count) so we don't have to hold this in memory?
	problem := problemData.GetProblemByID(roomData.Problem)
	gameStateMap[roomID] = GameState{
		UserProgress: userProgressMap,
		GameOver:     false,
		TimeLimit:    roomData.TimeLimit,
		TimeElapsed:  0,
		Winner:       "",
		TotalCases:   len(problem.TestCases) + len(problem.FullCases),
	}
	gameStateMapMutex.Unlock()

	// notify other members of the room that the game is starting
	broadcastLaunchGame(roomID)
	log.Printf("Game started for room %s\n", roomID)

	gameOver := false

	// loop until game is over, checking game state on each tick
	for !gameOver {
		select {
		case <-ticker.C:
			// check if game has expired every minute, as time limits are defined by minutes
			// also broadcast generalized game information, including current time, just to make sure
			// clients don't ever get too out of sync
			gameOver = onGameTick(roomID)
		}
	}
}
