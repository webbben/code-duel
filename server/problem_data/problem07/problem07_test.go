package problem_07

import (
	"fmt"
	"testing"
)

func TestSampleSolution(t *testing.T) {
	testCases := GetProblem().TestCases
	testCases = append(testCases, GetProblem().FullCases...)

	for i, testCase := range testCases {
		t.Run(fmt.Sprintf("problem07_case_%d", i), func(t *testing.T) {
			input, expOut := testCase[0], testCase[1]
			output := sampleSolution(input.([]int))
			if output != expOut {
				t.Errorf("Input: [%v] Sample solution output: [%v] Expected: [%v]", input, output, expOut)
			}
		})
	}
}
