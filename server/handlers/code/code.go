package code

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"reflect"
	"slices"

	authHandlers "github.com/webbben/code-duel/handlers/auth"
	"github.com/webbben/code-duel/handlers/general"
	"github.com/webbben/code-duel/handlers/websocket"
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
	RoomID    string `json:"roomID"`
}

type ExecCodeRequest struct {
	Lang string `json:"lang"`
	Code string `json:"code"`
}

type ExecCodeResponse struct {
	Output string `json:"output"`
	Error  bool   `json:"error"`
}

// Handles a code test
func HandleTestCode(w http.ResponseWriter, r *http.Request) {
	codeSubmission(w, r, false)
}

// Handles a full code submission
func HandleSubmitCode(w http.ResponseWriter, r *http.Request) {
	codeSubmission(w, r, true)
}

// Handles a code submission request. If a full test, will run against all tests for a problem, not just the basic cases.
func codeSubmission(w http.ResponseWriter, r *http.Request, fullTest bool) {
	// get the user who is sending this request
	claims, err := authHandlers.GetUserClaimsFromContext(r)
	if err != nil || claims.DisplayName == "" {
		http.Error(w, fmt.Sprintf("Unauthorized: %s", err.Error()), http.StatusUnauthorized)
		return
	}
	// get code, language, problemID, and roomID out of body of request
	var req CodeSubmitRequest
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Failed to get data from request body", http.StatusBadRequest)
		return
	}
	if req.ProblemID == "" || req.Lang == "" || req.Code == "" || req.RoomID == "" {
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
	testCases := problem.TestCases
	if fullTest {
		testCases = append(testCases, problem.FullCases...)
	}
	// run the tests and report the outcome
	passCount, testCount, errorMessage := runTests(req.Code, req.Lang, testCases)
	response := map[string]interface{}{
		"passCount":    passCount,
		"testCount":    testCount,
		"errorMessage": errorMessage,
	}
	websocket.UpdateGameState(claims.DisplayName, req.RoomID, "CODE_SUBMIT_RESULT", map[string]interface{}{
		"passCount": passCount,
	})
	general.WriteResponse(w, true, response)
}

func runTests(code string, lang string, testCases []models.TestCase) (passCount int, testCount int, errorMessage string) {
	testCount = len(testCases)
	passCount = 0
	errorMessage = ""

	for _, testCase := range testCases {
		input, expOut := testCase[0], testCase[1]

		result, err := runTestCase(code, lang, input)
		if err != nil {
			errorMessage = fmt.Sprintf("Error during execution: %s", err.Error())
			break
		}
		log.Printf("Output: [%s] Expected: [%s]\n", result, expOut)
		if result != expOut {
			errorMessage = fmt.Sprintf("Failed test case [%s]: Result [%s] Expected [%s]", input, result, expOut)
			break
		}
		passCount++
	}
	return
}

func runTestCase(code string, lang string, input any) (string, error) {
	inputFmt := formatInput(lang, input)
	codeWithInput := fmt.Sprintf(code, inputFmt)
	reqBody := map[string]interface{}{
		"lang": lang,
		"code": codeWithInput,
	}
	log.Printf("Running test for %s code...", lang)
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
	var execCodeResponse ExecCodeResponse
	err = json.NewDecoder(response.Body).Decode(&execCodeResponse)
	if err != nil {
		return "", errors.New("Internal server error: failed to read executed code response body")
	}
	if execCodeResponse.Error {
		return "", errors.New(execCodeResponse.Output)
	}
	log.Printf("... result: %s", execCodeResponse.Output)
	return execCodeResponse.Output, nil
}

// formats the input value to the correct format for the given language
func formatInput(lang string, input any) string {
	switch lang {
	case "go":
		// go has built in support for this!
		return fmt.Sprintf("%#v", input)
	case "python":
		return formatPython(input)
	case "bash":
		return formatBash(input)
	default:
		// default to putting it in quotes like a string
		return fmt.Sprintf("\"%s\"", input)
	}
}

func formatPython(input any) string {
	inputType := reflect.TypeOf(input)
	inputValue := reflect.ValueOf(input)
	kind := inputType.Kind()

	// input is array/slice, so format its individual elements
	if kind == reflect.Array || kind == reflect.Slice {
		inputFmt := "["
		for i := 0; i < inputValue.Len(); i++ {
			element := inputValue.Index(i).Interface()
			inputFmt += formatPython(element)
			if i < inputValue.Len()-1 {
				inputFmt += ","
			}
		}
		inputFmt += "]"
		return inputFmt
	}
	// input is string
	if kind == reflect.String {
		return fmt.Sprintf("\"%s\"", input)
	}
	// input is boolean
	if kind == reflect.Bool {
		boolVal := inputValue.Bool()
		if boolVal {
			return "True"
		}
		return "False"
	}
	// input is number
	if kind == reflect.Int || kind == reflect.Int64 || kind == reflect.Float64 {
		return fmt.Sprintf("%v", input)
	}
	return fmt.Sprintf("%s", input)
}

func formatBash(input any) string {
	inputType := reflect.TypeOf(input)
	inputValue := reflect.ValueOf(input)
	kind := inputType.Kind()

	// input is array/slice, so format its individual elements
	if kind == reflect.Array || kind == reflect.Slice {
		inputFmt := "["
		for i := 0; i < inputValue.Len(); i++ {
			element := inputValue.Index(i).Interface()
			inputFmt += formatBash(element)
			if i < inputValue.Len()-1 {
				inputFmt += " "
			}
		}
		inputFmt += "]"
		return inputFmt
	}
	// input is string
	if kind == reflect.String {
		return fmt.Sprintf("\"%s\"", input)
	}
	// input is boolean
	if kind == reflect.Bool {
		boolVal := inputValue.Bool()
		if boolVal {
			return "true"
		}
		return "false"
	}
	// input is number
	if kind == reflect.Int || kind == reflect.Int64 || kind == reflect.Float64 {
		return fmt.Sprintf("%v", input)
	}
	return fmt.Sprintf("%s", input)
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
