package code

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"slices"

	"github.com/webbben/code-duel/handlers/general"
	"github.com/webbben/code-duel/models"
	problemData "github.com/webbben/code-duel/problem_data"
)

// languages we know our code execution service supports
var supportedLangs []string = []string{"python", "go", "bash"}

var codeExecURL = "http://localhost:8081/"

type CodeSubmitRequest struct {
	ProblemID string `json:"problemID"`
	Lang      string `json:"lang"`
	Code      string `json:"code"`
}

type ExecCodeRequest struct {
	Lang string `json:"lang"`
	Code string `json:"code"`
}

func HandleTestCode(w http.ResponseWriter, r *http.Request) {
	// get code, language, and problemID out of body of request
	var req CodeSubmitRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Failed to get data from request body", http.StatusBadRequest)
		return
	}
	if req.ProblemID == "" || req.Lang == "" || req.Code == "" {
		http.Error(w, "Request missing required information", http.StatusBadRequest)
		return
	}
	if !slices.Contains(supportedLangs, req.Lang) {
		http.Error(w, fmt.Sprintf("Language %s not supported", req.Lang), http.StatusBadRequest)
		return
	}
	// get test cases for given problemID
	problem := problemData.GetProblemByID(req.ProblemID)
	if problem == nil {
		http.Error(w, fmt.Sprintf("Testing code: problem %s not found", req.ProblemID), http.StatusBadRequest)
		return
	}
	passCount, testCount, errorMessage := runTests(req.Code, req.Lang, problem.TestCases)
	response := map[string]interface{}{
		"passCount":    passCount,
		"testCount":    testCount,
		"errorMessage": errorMessage,
	}
	general.WriteResponse(w, true, response)
}

func runTests(code string, lang string, testCases []models.TestCase) (passCount int, testCount int, errorMessage string) {
	testCount = len(testCases)
	passCount = 0
	errorMessage = ""

	for _, testCase := range testCases {
		input, expOut := testCase[0], testCase[1]

		result, err := runTestCase(code, lang, input.(string), expOut.(string))
		if err != nil {
			errorMessage = fmt.Sprintf("Error during execution: %s", err.Error())
			break
		}
		if result != expOut {
			errorMessage = fmt.Sprintf("Failed test case [%s]: Result [%s] Expected [%s]", input, result, expOut)
			break
		}
		passCount++
	}
	return
}

func runTestCase(code string, lang string, input string, expOut string) (string, error) {
	codeWithInput := fmt.Sprintf(code, input)
	reqBody := map[string]interface{}{
		"lang": lang,
		"code": codeWithInput,
	}
	// make request to code execution service
	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", errors.New("Internal server error: failed to marshal request json")
	}
	response, err := http.Post(codeExecURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", errors.New("Internal server error: failed to communicate with code execution service")
	}
	// read response
	defer response.Body.Close()
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return "", errors.New("Internal server error: failed to read executed code response body")
	}
	return string(body), nil
}

func HandleGetCodeTemplate(w http.ResponseWriter, r *http.Request) {
	// get problem ID and language from URL query params
	problemID := r.URL.Query().Get("problemID")
	if problemID == "" {
		http.Error(w, "No problemID found in request URL params", http.StatusBadRequest)
		return
	}
	lang := r.URL.Query().Get("lang")
	if lang == "" {
		http.Error(w, "No lang found in request URL params", http.StatusBadRequest)
		return
	}
	template, err := getCodeTemplate(problemID, lang)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	general.WriteResponse(w, true, map[string]interface{}{
		"template": template,
	})
}

func getCodeTemplate(problemID string, lang string) (string, error) {
	problem := problemData.GetProblemByID(problemID)
	if problem == nil {
		return "", errors.New(fmt.Sprintf("Failed to get code template: Problem %s not found", problemID))
	}
	template := problem.GetTemplate(lang)
	if template == "" {
		return "", errors.New(fmt.Sprintf("Failed to get code template: %s template for problem %s not found", lang, problemID))
	}
	return template, nil
}
