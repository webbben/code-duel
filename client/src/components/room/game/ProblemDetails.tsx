import { Typography } from "@mui/material";
import { Problem } from "../../../dataModels";
import Timer from "./Timer";

interface ProblemDetailsProps {
    problem: Problem | null;
    timeLimit: number;
}

export default function ProblemDetails(props: ProblemDetailsProps) {
    if (!props.problem) {
        return (
            <div
                className="game_section"
                style={{ flex: "1 1 auto" }}
            >
                <Typography>No problem data...</Typography>
            </div>
        );
    }

    return (
        <div
            className="game_section"
            style={{ flex: "1 1 auto", textAlign: "left" }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Typography gutterBottom variant="h5">
                    {props.problem.name}
                </Typography>
                <Timer initialMinutes={props.timeLimit} active />
            </div>
            <Typography gutterBottom variant="body1" sx={{ whiteSpace: 'pre-wrap'}}>
                {props.problem.fullDesc}
            </Typography>
            <Typography gutterBottom variant="h6">
                Examples
            </Typography>
            {props.problem.testCases?.map((testCase, i) => {
                return (
                    <Typography
                        key={`testcase${i}`}
                    >{`${testCase[0]}  =>  ${testCase[1]}`}</Typography>
                );
            })}
        </div>
    );
}
