package problem_02

import (
	"math"

	"github.com/webbben/code-duel/models"
)

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
		{[]int{6, 2, 3, 8, 1}, 6},
	},
	FullCases: []models.TestCase{
		{[]int{}, 0},
		{[]int{1}, 0},
		{[]int{7, 1, 5, 3, 6, 4}, 5},
		{[]int{1, 2, 3, 4, 5}, 4},
		{[]int{7, 6, 4, 3, 1}, 0},
		{[]int{3, 3, 3, 3, 3, 3, 3, 3, 3, 3}, 0},
		{[]int{2, 1, 4, 6, 2, 3}, 5},
		{[]int{7, 1, 5, 3, 6, 4, 9, 8}, 8},
		{[]int{1, 7, 8, 3, 6, 4, 9, 8}, 8},
		{[]int{10, 9, 8, 7, 6, 5, 4, 3, 2, 1}, 0},
		{[]int{1, 2, 3, 2, 3, 4, 3, 4, 5}, 4},
		{[]int{3, 2, 1, 4, 5, 6, 7, 8}, 7},
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
def solution(stockPrices):
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

func solution(stockPrices []int) int {
	// write your solution here
}
`

var bashTemplate = `
solution () {
	# write your solution here
	stockPrices=$1
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

func sampleSolution(prices []int) int {
	if len(prices) < 2 {
		// Not enough days to make a profit
		return 0
	}

	minPrice := math.MaxInt64
	maxProfit := 0

	for _, price := range prices {
		// Update the minimum stock price if a lower price is encountered
		minPrice = min(minPrice, price)

		// Update the maximum profit if a better selling opportunity is found
		maxProfit = max(maxProfit, price-minPrice)
	}

	return maxProfit
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
