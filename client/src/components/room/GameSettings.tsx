import {
    Autocomplete,
    Button,
    Slider,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import "../../styles/Room.css";
import { RoomUpdateTypes } from "../WebSocketContext";
import { ProblemOverview } from "./RoomContent";

interface GameSettingsProps {
    title: string;
    difficulty: number;
    updateSetting: Function;
    timeLimit?: number;
    problem?: ProblemOverview;
    setProblem: Function;
    randomProblem: boolean;
    problemList: ProblemOverview[];
    isOwner: boolean;
    launchGameCallback: Function;
    sendRoomUpdate: Function;
}

const diffMap = ["Easy", "Med", "Hard"];

export default function GameSettings(props: GameSettingsProps) {
    const [timeLimitDisp, setTimeLimitDisp] = useState<number>(
        props.timeLimit || 0
    );

    const problem = props.problem;
    const setProblem = props.setProblem;
    const problemList = props.problemList;
    const diff = props.difficulty;
    const setDiff = (newValue: number) => {
        props.updateSetting("difficulty", newValue);
        props.sendRoomUpdate(RoomUpdateTypes.changeDifficulty, newValue);
    };
    const setTimeLimit = (newValue: number) => {
        setTimeLimitDisp(newValue);
    };
    const updateTimeLimit = () => {
        props.sendRoomUpdate(RoomUpdateTypes.changeTimeLimit, timeLimitDisp);
        props.updateSetting("timeLimit", timeLimitDisp);
    };
    const randomProblem = props.randomProblem;
    const setRandomProblem = (newValue: boolean) => {
        props.updateSetting("randomProblem", newValue);
        props.sendRoomUpdate(RoomUpdateTypes.randomProblem, newValue);
    };

    useEffect(() => {
        if (props.timeLimit) {
            setTimeLimitDisp(props.timeLimit);
        }
    }, [props.timeLimit]);

    // if difficulty is changed and it doesn't match the problem, unset the problem
    useEffect(() => {
        if (problem?.difficulty !== diff) {
            setProblem(null);
        }
    }, [problem?.difficulty, diff]);

    function handleSetProblem(problem: ProblemOverview | null) {
        setProblem(problem);
        // inform other clients of the current problem
        props.sendRoomUpdate(RoomUpdateTypes.changeProblem, problem);
    }

    return (
        <div className="room_paneCard" style={{ flex: "1 1 auto" }}>
            <Typography gutterBottom variant="h6">
                {props.title || "loading"}
            </Typography>
            <div style={{ textAlign: "left" }}>
                <Stack spacing={2}>
                    <div className="_flexRow">
                        <Typography marginRight={1}>Difficulty: </Typography>
                        <ToggleButtonGroup
                            disabled={!props.isOwner}
                            color="primary"
                            value={diff}
                            exclusive
                            onChange={(_e, v) => setDiff(v)}
                        >
                            <ToggleButton color="success" value={1}>
                                Easy
                            </ToggleButton>
                            <ToggleButton color="warning" value={2}>
                                Med
                            </ToggleButton>
                            <ToggleButton color="error" value={3}>
                                Hard
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                    <div className="_flexRow">
                        <Typography marginRight={1}>Time Limit: </Typography>
                        <Typography
                            sx={{ minWidth: "50px" }}
                        >{`${timeLimitDisp} min`}</Typography>
                        <Slider
                            sx={{ maxWidth: "200px", marginLeft: "20px" }}
                            value={timeLimitDisp}
                            onChange={(_e, v) =>
                                setTimeLimit(Array.isArray(v) ? v[0] : v)
                            }
                            onChangeCommitted={() => updateTimeLimit()}
                            min={5}
                            max={60}
                            step={1}
                            valueLabelDisplay="auto"
                            disabled={!props.isOwner}
                        />
                    </div>
                    <div className="_flexRow">
                        {props.isOwner ? (
                            <>
                                <Typography marginRight={1}>
                                    Problem:{" "}
                                </Typography>
                                <ToggleButtonGroup
                                    color="primary"
                                    value={randomProblem}
                                    exclusive
                                    onChange={(_e, v) => setRandomProblem(v)}
                                >
                                    <ToggleButton value={true}>
                                        Random
                                    </ToggleButton>
                                    <ToggleButton value={false}>
                                        Choose...
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </>
                        ) : (
                            <div>
                                <Typography marginRight={1}>
                                    Problem:{" "}
                                    {problem?.name ||
                                        (randomProblem
                                            ? "Random!"
                                            : "None selected")}
                                </Typography>
                                <br />
                                <Typography marginRight={1}>
                                    {problem?.quickDesc}
                                </Typography>
                            </div>
                        )}
                    </div>
                    {props.isOwner && !randomProblem && (
                        <div>
                            <Autocomplete
                                groupBy={(option) =>
                                    diffMap[option.difficulty - 1]
                                }
                                getOptionLabel={(option) => {
                                    return option.name;
                                }}
                                options={problemList.filter(
                                    (prob) => prob.difficulty === diff
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Choose a problem"
                                    />
                                )}
                                sx={{
                                    m: 1,
                                }}
                                onChange={(_e, v) => handleSetProblem(v)}
                                value={problem || null}
                            />
                            <Typography>{problem?.quickDesc}</Typography>
                        </div>
                    )}
                    {props.isOwner && (
                        <div>
                            <Button
                                disabled={!problem && !randomProblem}
                                variant="outlined"
                                onClick={() =>
                                    props.launchGameCallback(problem?.id || "")
                                }
                            >
                                Launch Game
                            </Button>
                        </div>
                    )}
                </Stack>
            </div>
        </div>
    );
}
