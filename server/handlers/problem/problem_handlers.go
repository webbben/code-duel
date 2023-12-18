package problem_handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/webbben/code-duel/handlers/general"
)

type ProblemOverview struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Difficulty int    `json:"difficulty"`
	QuickDesc  string `json:"quickDesc"`
}

type Problem struct {
	ProblemOverview
	FullDesc  string `json:"fullDesc"`
	TestCases []any  `json:"testCases"`
	FullCases []any  `json:"fullCases"`
}

func GetProblemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	problemID := vars["id"]
	if problemID == "" {
		http.Error(w, "problem ID not found in URL", http.StatusBadRequest)
		return
	}
	jsonData, err := os.ReadFile(fmt.Sprintf("./problem_data/%s.json", problemID))
	if err != nil {
		http.Error(w, "Error reading problem JSON.", http.StatusBadRequest)
		return
	}
	var problem Problem
	err = json.Unmarshal(jsonData, &problem)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	general.WriteResponse(w, true, map[string]interface{}{
		"problem": problem,
	})
}

func GetProblemListHandler(w http.ResponseWriter, r *http.Request) {
	files, err := os.ReadDir("./problem_data")
	if err != nil {
		http.Error(w, "Error reading problems directory", http.StatusInternalServerError)
		return
	}
	var overviews []ProblemOverview
	for _, file := range files {
		filename := file.Name()
		jsonData, err := os.ReadFile(fmt.Sprintf("./problem_data/%s", filename))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var problemOverview ProblemOverview
		if err = json.Unmarshal(jsonData, &problemOverview); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		problemOverview.ID = strings.Split(filename, ".")[0] // remove the .json part
		overviews = append(overviews, problemOverview)
	}

	general.WriteResponse(w, true, map[string]interface{}{
		"problems": overviews,
	})
}
