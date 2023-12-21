package problem_01

import (
	"fmt"
	"testing"
)

func TestSampleSolution(t *testing.T) {
	testCases := GetProblem().TestCases
	testCases = append(testCases, GetProblem().FullCases...)

	for i, testCase := range testCases {
		t.Run(fmt.Sprintf("problem01_case_%d", i), func(t *testing.T) {
			input, expOut := testCase[0], testCase[1]
			output := sampleSolution(input)
			if output != expOut {
				t.Errorf("Sample solution output: [%s] Expected: [%s]", output, expOut)
			}
		})
	}
}
