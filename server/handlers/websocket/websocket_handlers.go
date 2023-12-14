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
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

type DataPayload struct {
	Type  string `json:"type"`
	Value any    `json:"value"`
}

var (
	ctx      context.Context
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return r.Header.Get("Origin") == "http://localhost:3000"
		},
	}
	// connected clients for each chatroom
	roomClients = make(map[string]map[*websocket.Conn]bool)
	// Mutex to lock roomClients to enable synchronization between threads
	roomClientsMutex sync.Mutex
)

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
		roomClientsMutex.Lock()
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

	log.Println(fmt.Sprintf("new websocket connection for room %s", room))

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

		log.Printf("received message from client: %s", receivedMessage.Type)

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
			log.Printf("(room %s) chat message from %s: %s", receivedMessage.Room, receivedMessage.Sender, receivedMessage.Content)
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
			log.Printf("(room %s) room update: %s", receivedMessage.Room, receivedMessage.RoomUpdate.Type)
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

func broadcastMessage(message Message, sendingConnection *websocket.Conn) {
	// Iterate over all connected clients in the same room and send the message
	roomClientsMutex.Lock()
	defer roomClientsMutex.Unlock()

	log.Printf("broadcasting to room %s: %s", message.Room, message.Type)
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
	log.Printf("broadcast to %v clients", counter)
	if counter > 2 {
		fmt.Println(roomClients[message.Room])
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
			Data: DataPayload{
				Value: username,
			},
		},
	}
	broadcastMessage(messageToSend, nil)
}
