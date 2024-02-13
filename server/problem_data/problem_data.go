package problemData

import (
	"github.com/webbben/code-duel/models"
	problem_01 "github.com/webbben/code-duel/problem_data/problem01"
	problem_02 "github.com/webbben/code-duel/problem_data/problem02"
	problem_03 "github.com/webbben/code-duel/problem_data/problem03"
	problem_04 "github.com/webbben/code-duel/problem_data/problem04"
	problem_06 "github.com/webbben/code-duel/problem_data/problem06"
	problem_07 "github.com/webbben/code-duel/problem_data/problem07"
)

// map of problems to their problem IDs
//
// new problems should be mapped here so they are exposed to the rest of the codebase
var problemMap map[string]models.Problem = map[string]models.Problem{
	"problem01": problem_01.GetProblem(),
	"problem02": problem_02.GetProblem(),
	"problem03": problem_03.GetProblem(),
	"problem04": problem_04.GetProblem(),
	"problem06": problem_06.GetProblem(),
	"problem07": problem_07.GetProblem(),
}

// Get problem object by its ID
func GetProblemByID(problemID string) *models.Problem {
	problem := problemMap[problemID]
	return &problem
}

// get the overviews of all problems
//
// used for listing all problems when choosing a problem for a room
func GetProblemOverviews() []models.ProblemOverview {
	problemOverviews := make([]models.ProblemOverview, len(problemMap))
	i := 0
	for _, prob := range problemMap {
		problemOverviews[i] = prob.ProblemOverview
		i++
	}
	return problemOverviews
}
