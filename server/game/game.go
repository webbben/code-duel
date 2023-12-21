// package that handles game state management
package game

import (
	"time"
)

// anytime an update is received from a connected client, this is called to broadcast game state updates
// to all connected clients.
func broadcastGameUpdate(roomID string) {

}

func startGameLoop(roomID string) {
	ticker := time.NewTicker(time.Minute)

	for {
		select {
		case <-ticker.C:
			// send out updates to the game room every minute, just as an extra measure of synchronization safety
			// we shouldn't need constant general updates, since we are mostly only needing an update
			// whenever a user makes progress, i.e. submits code to be tested.
			broadcastGameUpdate(roomID)
		}
	}
}
