// general utility functions that can be used in various places
package general

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
)

// writes values to an HTTP response
//
// pass a success boolean for if the response is a success or not, and optionally provide
// other values to pass in the response map (or pass it as nil if not needed)
//
// you can also pass an httpStatus if you'd like to customize - if more than one is passed, only the first one is used.
func WriteResponse(w http.ResponseWriter, success bool, response map[string]interface{}, httpStatus ...int) {
	// use a default status code, or the provided code if present
	responseStatus := http.StatusOK
	if !success {
		responseStatus = http.StatusBadRequest
	}
	if len(httpStatus) > 0 {
		responseStatus = httpStatus[0]
	}
	// set the success property of the response body
	if response == nil {
		response = map[string]interface{}{}
	}
	if success {
		response["success"] = true
	} else {
		response["success"] = false
	}
	responseJSON, err := json.Marshal(response)
	if err != nil {
		log.Printf("Error marshalling response: %s", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// return response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(responseStatus)
	w.Write(responseJSON)
}

// returns the mutex that is mapped to the given key;
// basically just a wrapper to add the correct class to the mutex so you don't have to assert the type every time
func GetMappedMutex(key string, mutexMap *sync.Map) *sync.Mutex {
	mutex, _ := mutexMap.LoadOrStore(key, &sync.Mutex{})
	return mutex.(*sync.Mutex)
}

func RemoveElementFromArray(element string, array []string) []string {
	for index, value := range array {
		if value == element {
			return append(array[:index], array[index+1:]...)
		}
	}
	return array
}
