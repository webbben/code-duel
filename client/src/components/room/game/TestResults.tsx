import { IconButton, Typography } from "@mui/material";
import { codeExecResponse } from "../../../dataProvider";
import { PlayArrow } from "@mui/icons-material";

interface TestResultsProps {
    codeExecResult?: codeExecResponse
    testCases?: any[]
    runTestsCallback: Function
}

export default function TestResults(props: TestResultsProps) {

    return (
        <div className="game_section" style={{ flex: '0 1 auto', textAlign: 'left'}}>
            <Typography>Console</Typography>
            <IconButton onClick={() => props.runTestsCallback()}>
                <PlayArrow />
            </IconButton>
        </div>
    );
}