package problem_handlers

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/webbben/code-duel/handlers/general"
	problemData "github.com/webbben/code-duel/problem_data"
)

func GetProblemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	problemID := vars["id"]
	if problemID == "" {
		http.Error(w, "problem ID not found in URL", http.StatusBadRequest)
		return
	}
	problem := problemData.GetProblemByID(problemID)
	if problem == nil {
		http.Error(w, fmt.Sprintf("Problem %s wasn't found", problemID), http.StatusBadRequest)
		return
	}
	general.WriteResponse(w, true, map[string]interface{}{
		"problem": problem,
	})
}

func GetProblemListHandler(w http.ResponseWriter, r *http.Request) {
	overviews := problemData.GetProblemOverviews()
	general.WriteResponse(w, true, map[string]interface{}{
		"problems": overviews,
	})
}
