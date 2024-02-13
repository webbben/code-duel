package problem_07

import (
	"github.com/webbben/code-duel/models"
)

var problem = models.Problem{
	ProblemOverview: models.ProblemOverview{
		ID:         "problem07",
		Name:       "Trapping Rainwater",
		Difficulty: 3,
		QuickDesc:  "Calculate how much rainwater can be captured by a series of reservoirs.",
	},
	FullDesc: "given an array representing the height of bars along an elevation, calculate how much rainwater can be trapped between the bars.\nIn order for water to be trapped, there should exist bars on both sides that keep it from flowing out, and there may be pockets of water captured at various points in the array of bars.",
	TestCases: []models.TestCase{
		{[]int{0, 1, 0}, 0},
		{[]int{2, 0, 2}, 2},
		{[]int{2, 0, 1}, 1},
		{[]int{2, 0, 1, 2}, 3},
	},
	FullCases: []models.TestCase{
		{[]int{0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1}, 6},
		{[]int{4, 2, 0, 3, 2, 5}, 9},
		{[]int{3, 0, 1, 3, 0, 5}, 8},
		{[]int{1, 2, 3, 4, 5}, 0},
		{[]int{5, 4, 3, 2, 1}, 0},
		{[]int{10, 0, 8, 6, 0, 2, 10, 7, 3}, 34},
		{[]int{100, 90, 80, 70, 60, 50, 40, 30, 20, 10}, 0},
		{[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1}, 0},
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

func sampleSolution(height []int) int {
	n := len(height)
	if n <= 2 {
		return 0
	}

	leftMax := make([]int, n)
	rightMax := make([]int, n)

	leftMax[0] = height[0]
	for i := 1; i < n; i++ {
		leftMax[i] = max(leftMax[i-1], height[i])
	}

	rightMax[n-1] = height[n-1]
	for i := n - 2; i >= 0; i-- {
		rightMax[i] = max(rightMax[i+1], height[i])
	}

	trappedWater := 0
	for i := 0; i < n; i++ {
		minHeight := min(leftMax[i], rightMax[i])
		if minHeight > height[i] {
			trappedWater += minHeight - height[i]
		}
	}

	return trappedWater
}
