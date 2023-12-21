package problem_01

import (
	"reflect"

	"github.com/webbben/code-duel/models"
)

var problem = models.Problem{
	ProblemOverview: models.ProblemOverview{
		ID:         "problem01",
		Name:       "Hello world!",
		Difficulty: 1,
		QuickDesc:  "First one to print the given text to stdout wins!",
	},
	FullDesc: "Seriously - it's just printing some text to the console. Don't overthink it.",
	TestCases: []models.TestCase{
		{"Hello world!", "Hello world!"},
		{"beep boop I'm a bot", "beep boop I'm a bot"},
		{"", ""},
	},
	FullCases: []models.TestCase{
		{"abcdefghijklmnopqrstuvwxyz", "abcdefghijklmnopqrstuvwxyz"},
		{"1234567890", "1234567890"},
		{"ok do we really need to write test cases for this...", "ok do we really need to write test cases for this..."},
		{true, []string{"true", "True"}}, // make the output a slice to allow for more than one valid output
		{false, []string{"false", "False"}},
	},
}

func GetOverview() models.ProblemOverview {
	return problem.ProblemOverview
}

func GetProblem() models.Problem {
	return problem
}

/*
 * ====================================================================
 * Code Templates
 * Define a code template for each of the supported languages below
 * ====================================================================
 */

func GetProblemTemplate(lang string) string {
	switch lang {
	case "go":
		return goTemplate()
	default:
		return ""
	}
}

// go template
func goTemplate() string {
	template := `
		package main

		import "fmt"

		func main() {
			// don't change this or your code may not compile correctly!
			solution(%d)
		}

		func solution(input any) {
			// write your solution here
		}
	`
	return template
}

// python template
func pythonTemplate() string {
	template := `
		def solution(input) {
			// write your solution here
		}

		// don't change this or your code may not compile correctly!
		solution(%d)
	`
	return template
}

// bash template
func bashTemplate() string {
	// TODO
	return ""
}

/*
 * ====================================================================
 * Sample Solution
 * Make a solution to the problem - to confirm its actually solvable!
 * This should be unit tested with the test cases
 * ====================================================================
 */

func sampleSolution(input any) string {
	if reflect.TypeOf(input).String() == "bool" {
		if input == true {
			return "true"
		}
		return "false"
	}
	return input.(string)
}
