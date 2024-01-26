package problem_03

import "github.com/webbben/code-duel/models"

var problem = models.Problem{
	ProblemOverview: models.ProblemOverview{
		ID:         "problem03",
		Name:       "Majority Element",
		Difficulty: 1,
		QuickDesc:  "Given an array of numbers, return the majority element.",
	},
	FullDesc: "The majority element is the element that appears more than ⌊n / 2⌋ times. You may assume that the majority element always exists in the array.",
	TestCases: []models.TestCase{
		{[]int{1, 2, 1}, 1},
		{[]int{1, 1, 2, 2, 2, 2, 1}, 2},
	},
	FullCases: []models.TestCase{
		{[]int{0}, 0},
		{[]int{7, 7, 7, 7, 7, 7, 8, 9, 10}, 7},
		{[]int{1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4}, 4},
		{[]int{9, 8, 7, 8, 8, 9, 9, 8, 8, 9}, 8},
		{[]int{5, 5, 5, 5, 5, 5, 5, 6, 7, 8, 9}, 5},
		{[]int{1, 2, 1, 2, 3, 3, 3, 1, 3, 2, 1, 2, 3, 3, 3, 3, 3}, 3},
		{[]int{4, 4, 4, 4, 4, 4, 4, 4, 1, 2, 3}, 4},
		{[]int{2, 1, 1, 1, 1, 2, 2, 2, 2}, 2},
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
def solution(nums):
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

func solution(nums []int) int {
	// write your solution here
}
`

var bashTemplate = `
solution () {
	# write your solution here
	nums=$1
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

func sampleSolution(nums []int) int {
	candidate := nums[0]
	count := 1

	for _, num := range nums[1:] {
		if count == 0 {
			candidate = num
			count = 1
		} else if num == candidate {
			count++
		} else {
			count--
		}
	}

	return candidate
}
