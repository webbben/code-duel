package general

import (
	"encoding/json"
	"net/http"
	"sync"
)

// writes values to an HTTP response
func WriteResponse(w http.ResponseWriter, response map[string]interface{}) {
	responseJSON, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(responseJSON)
}

// returns the mutex that is mapped to the given key;
// basically just a wrapper to add the correct class to the mutex so you don't have to assert the type every time
func GetMappedMutex(key string, mutexMap *sync.Map) *sync.Mutex {
	mutex, _ := mutexMap.LoadOrStore(key, &sync.Mutex{})
	return mutex.(*sync.Mutex)
}
