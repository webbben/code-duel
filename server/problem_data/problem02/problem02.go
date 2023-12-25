package problem_02

import "github.com/webbben/code-duel/models"

var problem = models.Problem{
	ProblemOverview: models.ProblemOverview{
		ID:         "problem02",
		Name:       "Maximum Stock Profit",
		Difficulty: 2,
		QuickDesc:  "Given a spread of stock prices (in chronological order), return the maximum possible profit.",
	},
	FullDesc: "You're given a list of stock prices which are ordered chronologically: item at index n represents the stock price at day n. Assume you are allowed to purchase one share of the stock once, and then sell that share of the stock later. This means: If you purchase a stock on day=n, you may only sell it on day>n. Return the maximum possible profit, or 0 if no profit is possible.",
	TestCases: []models.TestCase{
		{[]int{1, 2, 3, 4, 5}, 4},
		{[]int{5, 4, 3, 2, 1}, 0},
		{[]int{6, 2, 3, 8, 1}, 7},
	},
	FullCases: []models.TestCase{
		{[]int{}, 0},
		{[]int{0, 9, 0, 9, 0, 1, 0, 20}, 20},
		{[]int{20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 9, 7, 6, 5, 4, 3, 2, 1}, 1},
		{[]int{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}, 0},
		{[]int{5, 56, 44, 85, 23, 46, 1000, 54, 24, 78, 12, 600, 900, 45}, 995},
		{[]int{1}, 0},
		{[]int{6, 4, 7, 9, 4, 3, 5, 6, 8, 6, 4, 3, 5, 6, 8, 9, 7, 5, 4, 3, 4, 6, 7, 9, 7, 5, 34, 23, 4, 5, 7, 8, 9, 7, 5, 4, 3, 24, 5, 7, 3, 2, 4, 6, 0, 90}, 90},
		{[]int{345, 567, 234, 678, 534, 654, 423, 765, 321, 654, 423, 987, 765, 543, 47, 532, 98, 12, 54, 987, 234, 567}, 975},
	},
	ProblemFunc: models.ProblemFunc{
		GetTemplate: GetProblemTemplate,
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

var pythonTemplate = `
def solution(stockPrices):
	# write your solution here

# don't change this or your code may not compile correctly!
solution(%d)
`

var goTemplate = `
package main

import "fmt"

func main() {
	// don't change this or your code may not compile correctly!
	fmt.Print(solution(%d))
}

func solution(stockPrices []int) int {
	// write your solution here
}
`

var bashTemplate = `
solution () {
	# write your solution here
	stockPrices=$1
}

# don't change this or your code may not compile correctly!
solution %d
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
