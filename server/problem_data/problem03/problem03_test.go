package problem_03

import (
	"fmt"
	"testing"
)

func TestSampleSolution(t *testing.T) {
	testCases := GetProblem().TestCases
	testCases = append(testCases, GetProblem().FullCases...)

	for i, testCase := range testCases {
		t.Run(fmt.Sprintf("problem03_case_%d", i), func(t *testing.T) {
			input, expOut := testCase[0], testCase[1]
			output := sampleSolution(input.([]int))
			if output != expOut.(int) {
				t.Errorf("Sample solution output: [%v] Expected: [%v]", output, expOut)
			}
		})
	}
}
