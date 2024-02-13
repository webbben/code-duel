package problem_06

import (
	"github.com/webbben/code-duel/models"
)

var problem = models.Problem{
	ProblemOverview: models.ProblemOverview{
		ID:         "problem06",
		Name:       "Roman Numerals",
		Difficulty: 2,
		QuickDesc:  "Given an integer, convert it to its Roman numeral representation.",
	},
	FullDesc: "Given an integer, convert it to its Roman numeral representation.\nRoman numerals are represented by combinations of letters of the set {I, V, X, L, C, D, M}, where each letter corresponds to a specific numeric value:\nI: 1\nV: 5\nX: 10\nL: 50\nC: 100\nD: 500\nM: 1000\n\nTo represent numbers, certain rules apply. For example, the numeral for 4 is IV, which is 5 - 1. The numeral for 9 is IX, which is 10 - 1. When smaller numbers appear before larger numbers, you subtract (e.g., IV for 4). When smaller numbers appear after larger numbers, you add (e.g., VIII for 8).",
	TestCases: []models.TestCase{
		{4, "IV"},
		{6, "VI"},
		{7, "VII"},
		{8, "VIII"},
		{12, "XII"},
	},
	FullCases: []models.TestCase{
		{1, "I"},
		{5, "V"},
		{10, "X"},
		{20, "XX"},
		{50, "L"},
		{100, "C"},
		{500, "D"},
		{399, "CCCXCIX"},
		{846, "DCCCXLVI"},
		{1998, "MCMXCVIII"},
		{2022, "MMXXII"},
		{3492, "MMMCDXCII"},
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
def solution(num: int):
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

func solution(num int) int {
	// write your solution here
}
`

var bashTemplate = `
solution () {
	# write your solution here
	num=$1
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

func sampleSolution(num int) string {
	values := []int{1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1}
	symbols := []string{"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"}

	result := ""
	for i := 0; num > 0; i++ {
		for num >= values[i] {
			num -= values[i]
			result += symbols[i]
		}
	}

	return result
}
