import { Card, CardContent, IconButton, Typography } from "@mui/material";
import { codeExecResponse } from "../../../dataProvider";
import { PlayArrow, Publish } from "@mui/icons-material";

interface TestResultsProps {
    codeExecResult?: codeExecResponse;
    testCases?: any[];
    runTestsCallback: Function;
}

export default function TestResults(props: TestResultsProps) {
    const success = props.codeExecResult
        ? props.codeExecResult.passCount === props.codeExecResult.testCount
        : false;
    let color = "green";
    if (props.codeExecResult && !success) {
        color = "orange";
    }

    return (
        <div
            className="game_section"
            style={{
                flex: "0 1 auto",
                textAlign: "left",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Typography>Console</Typography>
                <div style={{ display: "flex" }}>
                    <IconButton onClick={() => props.runTestsCallback()}>
                        <PlayArrow />
                    </IconButton>
                    <IconButton onClick={() => props.runTestsCallback()}>
                        <Publish />
                    </IconButton>
                </div>
            </div>
            <Card
                style={{
                    backgroundColor: "black",
                    color: color,
                    height: "100px",
                }}
            >
                <CardContent>
                    {props.codeExecResult ? (
                        <>
                            <Typography
                                variant="body2"
                                fontFamily={"monospace"}
                                fontSize={13}
                            >
                                {"> Test results: "}
                                {props.codeExecResult.passCount}/
                                {props.codeExecResult.testCount}
                            </Typography>
                            {props.codeExecResult.errorMessage && (
                                <Typography
                                    variant="body2"
                                    fontFamily={"monospace"}
                                    fontSize={13}
                                >
                                    {"> Error: "}
                                    {props.codeExecResult.errorMessage}
                                </Typography>
                            )}
                        </>
                    ) : (
                        <Typography variant="body2">{">"}</Typography>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
