package problem_04

import (
	"strings"
	"unicode"

	"github.com/webbben/code-duel/models"
)

var problem = models.Problem{
	ProblemOverview: models.ProblemOverview{
		ID:         "problem04",
		Name:       "Palindrome",
		Difficulty: 1,
		QuickDesc:  "Given a string, determine if it is a palindrome.",
	},
	FullDesc: "Given a string, determine if it is a palindrome. A palindrome is a string that is written the same both frontwards and backwards.\nInput strings may contain punctuation, spaces, etc, but we only want to consider the alphanumeric characters in the given string, and should ignore letter cases.",
	TestCases: []models.TestCase{
		{"racecar", true},
		{"Race, Car.", true},
		{"Race 2 car", false},
		{"a", true},
	},
	FullCases: []models.TestCase{
		{"A man, a plan, a canal, Panama!", true},
		{"Madam, in Eden, I'm Adam.", true},
		{"A Santa lived as a devil at NASA.", true},
		{"Able was I ere I saw Elba.", true},
		{"Was it a car or a cat I saw?", true},
		{"Was it a cat or a car I saw?", false},
		{"What the heck is a palindrome?", false},
		{"A man, a plan, a cat, a ham, a yak, a yam, a hat, a canal - Panama!", true},
		{"A ham, a yam, a cat with a hat, a yak with a bat in Omaha!", false},
		{"1234567890987654321", true},
		{"1.2345 = 54.321", true},
	},
	ProblemFunc: models.ProblemFunc{
		GetTemplate: GetProblemTemplate,
	},
}

func GetOverview() models.ProblemOverview {
	return problem.ProblemOverview
}

func GetProblem() models.Problem {
	problem.CaseCount = len(problem.TestCases) + len(problem.FullCases)
	return problem
}

/*
 * ====================================================================
 * Code Templates
 * Define a code template for each of the supported languages below
 * ====================================================================
 */

var pythonTemplate = `
def solution(s: str):
	# write your solution here

# don't change this or your code may not run correctly!
print(solution(%s))
`

var goTemplate = `
package main

import "fmt"

func main() {
	// don't change this or your code may not run correctly!
	fmt.Print(solution(%s))
}

func solution(s string) bool {
	// write your solution here
}
`

var bashTemplate = `
solution () {
	# write your solution here
	s=$1
}

# don't change this or your code may not run correctly!
output=solution %s
echo $output
`

func GetProblemTemplate(lang string) string {
	switch lang {
	case "go":
		return goTemplate
	case "py":
		return pythonTemplate
	case "sh":
		return bashTemplate
	default:
		return ""
	}
}

/*
 * ====================================================================
 * Sample Solution
 * Make a solution to the problem - to confirm its actually solvable!
 * This should be unit tested with the test cases
 * ====================================================================
 */

func sampleSolution(s string) bool {
	// first, clean the string
	var builder strings.Builder
	for _, char := range s {
		if unicode.IsLetter(char) || unicode.IsDigit(char) {
			// Add letters and numbers to the cleaned string
			builder.WriteRune(unicode.ToLower(char))
		}
	}

	cleanStr := builder.String()

	// now compare it to its reverse
	var reversedBuilder strings.Builder
	for i := len(cleanStr) - 1; i >= 0; i-- {
		// Add characters in reverse order
		reversedBuilder.WriteByte(cleanStr[i])
	}

	return cleanStr == reversedBuilder.String()
}
