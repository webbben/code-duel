package problem_handlers

import (
	"fmt"
	"log"
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

type GetProblemTemplateRequest struct {
	Lang string `json:"lang"`
}

func GetProblemTemplate(w http.ResponseWriter, r *http.Request) {
	log.Println("getting code template")
	vars := mux.Vars(r)
	problemID := vars["id"]
	if problemID == "" {
		http.Error(w, "problem ID not found in URL", http.StatusBadRequest)
		return
	}
	lang := vars["lang"]
	if lang == "" {
		http.Error(w, "language not found in URL", http.StatusBadRequest)
		return
	}
	problem := problemData.GetProblemByID(problemID)
	if problem == nil {
		http.Error(w, "Failed to get problem for given problem ID", http.StatusBadRequest)
		return
	}
	// get template
	template := problem.GetTemplate(lang)
	if template == "" {
		http.Error(w, fmt.Sprintf("Failed to get %s template for %s", lang, problemID), http.StatusBadRequest)
		return
	}
	general.WriteResponse(w, true, map[string]interface{}{
		"template": template,
	})
}
