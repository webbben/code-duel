package websocket

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Message struct {
	Type      string `json:"type"`
	Content   string `json:"content"`
	Room      string `json:"room"`
	Sender    string `json:"sender"`
	Timestamp int    `json:"timestamp"`
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

	defer func() {
		// Remove the client when the connection is closed
		roomClientsMutex.Lock()
		delete(roomClients[room], conn)
		roomClientsMutex.Unlock()
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

		switch receivedMessage.Type {
		case "message":
			// Broadcast the message to all connected clients in the same room
			broadcastMessage(receivedMessage, conn)
			// We don't save the message history in firebase, just to preserve storage space
		}
	}
}

func broadcastMessage(message Message, sendingConnection *websocket.Conn) {
	// Iterate over all connected clients in the same room and send the message
	roomClientsMutex.Lock()
	defer roomClientsMutex.Unlock()

	for client := range roomClients[message.Room] {
		// don't send messages back to the sending client
		if client == sendingConnection {
			continue
		}
		err := client.WriteJSON(Message{
			Type:      "message",
			Content:   message.Content,
			Room:      message.Room,
			Sender:    message.Sender,
			Timestamp: message.Timestamp,
		})
		if err != nil {
			log.Println(err)
		}
	}
}
