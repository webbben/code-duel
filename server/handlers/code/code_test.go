package code

import (
	"fmt"
	"testing"
)

type FormatInputTestCase struct {
	Input    any
	Lang     string
	Expected string
}

func TestFormatInputPython(t *testing.T) {
	var testCases = []FormatInputTestCase{
		{Input: []int{1, 2, 3, 4, 5}, Lang: "python", Expected: "[1,2,3,4,5]"},
		{Input: []float64{1.1, 2.2, 3.3, 4.4, 5.5}, Lang: "python", Expected: "[1.1,2.2,3.3,4.4,5.5]"},
		{Input: []string{"hi", "bye", "yes", "no"}, Lang: "python", Expected: "[\"hi\",\"bye\",\"yes\",\"no\"]"},
		{Input: true, Lang: "python", Expected: "True"},
		{Input: false, Lang: "python", Expected: "False"},
		{Input: []bool{true, false}, Lang: "python", Expected: "[True,False]"},
		{Input: [][]bool{{true, true}, {true, false}}, Lang: "python", Expected: "[[True,True],[True,False]]"},
	}
	runTestsFormatInput(testCases, t)
}

func TestFormatInputGo(t *testing.T) {
	var testCases = []FormatInputTestCase{
		{Input: []int{1, 2, 3, 4, 5}, Lang: "go", Expected: "[]int{1, 2, 3, 4, 5}"},
		{Input: []float64{1.1, 2.2, 3.3, 4.4, 5.5}, Lang: "go", Expected: "[]float64{1.1, 2.2, 3.3, 4.4, 5.5}"},
		{Input: []string{"hi", "bye", "yes", "no"}, Lang: "go", Expected: "[]string{\"hi\", \"bye\", \"yes\", \"no\"}"},
		{Input: true, Lang: "go", Expected: "true"},
		{Input: false, Lang: "go", Expected: "false"},
		{Input: []bool{true, false}, Lang: "go", Expected: "[]bool{true, false}"},
		{Input: [][]bool{{true, true}, {true, false}}, Lang: "go", Expected: "[][]bool{[]bool{true, true}, []bool{true, false}}"},
	}
	runTestsFormatInput(testCases, t)
}

func TestFormatInputBash(t *testing.T) {
	var testCases = []FormatInputTestCase{
		{Input: []int{1, 2, 3, 4, 5}, Lang: "bash", Expected: "[1 2 3 4 5]"},
		{Input: []float64{1.1, 2.2, 3.3, 4.4, 5.5}, Lang: "bash", Expected: "[1.1 2.2 3.3 4.4 5.5]"},
		{Input: []string{"hi", "bye", "yes", "no"}, Lang: "bash", Expected: "[\"hi\" \"bye\" \"yes\" \"no\"]"},
		{Input: true, Lang: "bash", Expected: "true"},
		{Input: false, Lang: "bash", Expected: "false"},
		{Input: []bool{true, false}, Lang: "bash", Expected: "[true false]"},
		// apparently bash doesn't really support 2d arrays? anyway, lets try not to define problems with 2d array inputs.
		{Input: [][]bool{{true, true}, {true, false}}, Lang: "bash", Expected: "[[true true] [true false]]"},
	}
	runTestsFormatInput(testCases, t)
}

func runTestsFormatInput(testCases []FormatInputTestCase, t *testing.T) {
	for i, testCase := range testCases {
		testName := fmt.Sprintf("FormatInput test %v", i)
		t.Run(testName, func(t *testing.T) {
			inputFmt := formatInput(testCase.Lang, testCase.Input, false)
			if inputFmt != testCase.Expected {
				t.Errorf("Result: [%s] Expected: [%s]", inputFmt, testCase.Expected)
			}
		})
	}
}
