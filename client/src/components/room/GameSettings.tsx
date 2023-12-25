import { Autocomplete, Button, Slider, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import "../../styles/Room.css";
import { getProblemList } from "../../dataProvider";

interface GameSettingsProps {
    title: string,
    difficulty: number,
    timeLimit?: number,
    problem?: string,
    updateSettings: Function,
    isOwner: boolean,
    launchGameCallback: Function
}

interface ProblemOverview {
    name: string
    id: string
    difficulty: number
    quickDesc: string
}

const diffMap = ["Easy", "Med", "Hard"];

export default function GameSettings(props: GameSettingsProps) {
    const [diff, setDiff] = useState<number>(props.difficulty);
    const [randomProblem, setRandomProblem] = useState<boolean>(true);
    const [problem, setProblem] = useState<ProblemOverview | null>(null);
    const [problemList, setProblemList] = useState<ProblemOverview[]>([]);
    const [timeLimit, setTimeLimit] = useState<number>(30);

    // load problems
    useEffect(() => {
        const loadProblems = async () => {
            const loadedProblems = await getProblemList();
            setProblemList(loadedProblems);
        }
        loadProblems();
    }, []);

    // if difficulty is changed and it doesn't match the problem, unset the problem
    useEffect(() => {
        if (problem?.difficulty !== diff) {
            setProblem(null);
        }
    }, [diff]);

    return (
        <div className="room_paneCard" style={{ flex: '1 1 auto' }}>
            <Typography gutterBottom variant="h6">{props.title || "loading"}</Typography>
            <div style={{ textAlign: 'left' }}>
                <Stack spacing={2}>
                    <div className="_flexRow">
                        <Typography marginRight={1}>Difficulty: </Typography>
                        <ToggleButtonGroup
                            color="primary"
                            value={diff}
                            exclusive
                            onChange={(_e, v) => setDiff(v)}>
                                <ToggleButton color='success' value={1}>Easy</ToggleButton>
                                <ToggleButton color='warning' value={2}>Med</ToggleButton>
                                <ToggleButton color='error' value={3}>Hard</ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                    <div className="_flexRow">
                        <Typography marginRight={1}>Time Limit: {props.timeLimit}</Typography>
                        <Typography sx={{ minWidth: '50px' }}>{`${timeLimit} min`}</Typography>
                        <Slider
                        sx={{ maxWidth: '200px', marginLeft: '20px'}}
                        value={timeLimit}
                        onChange={(_e, v) => setTimeLimit(Array.isArray(v) ? v[0] : v)}
                        min={5}
                        max={60}
                        step={1}
                        valueLabelDisplay="auto" />
                    </div>
                    <div className="_flexRow">
                        <Typography marginRight={1}>Problem: {props.problem}</Typography>
                        <ToggleButtonGroup
                            color="primary"
                            value={randomProblem}
                            exclusive
                            onChange={(_e, v) => setRandomProblem(v)}>
                                <ToggleButton value={true}>Random</ToggleButton>
                                <ToggleButton value={false}>Choose...</ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                    { !randomProblem && 
                    <div>
                    <Autocomplete
                    groupBy={(option) => diffMap[option.difficulty - 1]}
                    getOptionLabel={(option) => {
                        return option.name;
                    }}
                    options={problemList.filter((prob) => prob.difficulty === diff)}
                    renderInput={(params) => <TextField {...params} label="Choose a problem" />}
                    sx={{
                        m: 1
                    }}
                    onChange={(e, v) => setProblem(v)}
                    value={problem}
                    />
                    <Typography>{problem?.quickDesc}</Typography>
                    </div>
                    }
                    { props.isOwner &&
                    <div>
                        <Button disabled={!problem && !randomProblem} variant="outlined" onClick={() => props.launchGameCallback(problem?.id || "")}>Launch Game</Button>
                    </div>
                    }
                </Stack>
            </div>
        </div>
    )
}