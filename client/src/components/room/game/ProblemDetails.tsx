import { Typography } from "@mui/material";
import { Problem } from "../../../dataModels";

interface ProblemDetailsProps {
    problem: Problem | null
}

export default function ProblemDetails(props: ProblemDetailsProps) {

    if (!props.problem) {
        return (
            <div className="game_section" style={{ flex: '1 1 auto', minHeight: '60%'}}>
                <Typography>No problem data...</Typography>
            </div>
        );
    }

    return (
        <div className="game_section" style={{ flex: '1 1 auto', minHeight: '60%', textAlign: 'left'}}>
            <Typography gutterBottom variant='h5'>{props.problem.name}</Typography>
            <Typography gutterBottom variant='body1'>{props.problem.fullDesc}</Typography>
            <Typography gutterBottom variant='h6'>Examples</Typography>
            { props.problem.testCases?.map((testCase, i) => {
                return (
                    <Typography key={`testcase${i}`}>{`${testCase[0]}  =>  ${testCase[1]}`}</Typography>
                )
            })}
        </div>
    );
}