import { Autocomplete, MenuItem, Select, Slider, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import "../../styles/Room.css";

interface GameSettingsProps {
    title: string,
    mode: number,
    difficulty: number,
    timeLimit?: number,
    problem?: string,
    updateSettings: Function
}

interface Problem {
    Title: string;
    Difficulty: number;
    QuickDesc: string;
    FullDesc: string;
    ExampleIO: any[];
}

const exampleProblems: Problem[] = [
    {
        Title: "Hello World!",
        Difficulty: 1,
        QuickDesc: "First one to print 'Hello World' to the console wins!",
        FullDesc: "no really, it's that simple - just use the stdout command for your programming language lol.",
        ExampleIO: [
            [null, "Hello World"]
        ],
    },
    {
        Title: "Sum of a list of numbers",
        Difficulty: 1,
        QuickDesc: "You do the math - really, it's just simple addition.",
        FullDesc: "this plus that, you get the picture.",
        ExampleIO: [
            [[1,2,3], 6],
            [[-1,1], 0]
        ],
    },
    {
        Title: "Search Binary Tree for Golden Apple",
        Difficulty: 2,
        QuickDesc: "Given a Binary Tree, traverse the tree and return true or false if a golden apple exists.",
        FullDesc: "(longer explanation)",
        ExampleIO: [
            ["(tree object)", true],
            ["(another tree)", false]
        ],
    },
    {
        Title: "Maximum profit for stock trade",
        Difficulty: 3,
        QuickDesc: "given an array of stock values, find the maximum profit you can obtain if you buy on a certain day and sell on another.",
        FullDesc: "the given array represents stock prices for a security in order by day; you can choose to buy once, and sell once, and the goal is to get the maximum value.",
        ExampleIO: [
            [[1,2,3,4,5], 4],
            [[1,2,4,3,2], 3],
            [[5,4,3,2,1], 0],
            [[1,2,1,2,1], 1]
        ],
    }
];

const diffMap = ["Easy", "Med", "Hard"];

export default function GameSettings(props: GameSettingsProps) {

    const [mode, setMode] = useState<number>(props.mode);
    const [diff, setDiff] = useState<number>(props.difficulty);
    const [randomProblem, setRandomProblem] = useState<boolean>(true);
    const [problem, setProblem] = useState<Problem | null>(exampleProblems[0]);
    const [timeLimit, setTimeLimit] = useState<number>(30);

    useEffect(() => {
        if (problem?.Difficulty !== diff) {
            setProblem(null);
        }
    }, [diff])
    

    return (
        <div className="room_paneCard" style={{ flex: '1 1 auto' }}>
            <Typography gutterBottom variant="h6">{props.title || "loading"}</Typography>
            <div style={{ textAlign: 'left' }}>
                <Stack spacing={2}>
                    <div className="_flexRow">
                        <Typography marginRight={1}>Game Mode: </Typography>
                        <ToggleButtonGroup
                        color="primary"
                        value={mode}
                        exclusive
                        onChange={(_e, v) => setMode(v)}>
                            <ToggleButton value={1}>Vs</ToggleButton>
                            <ToggleButton value={2}>Co-op</ToggleButton>
                        </ToggleButtonGroup>
                    </div>
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
                    groupBy={(option) => diffMap[option.Difficulty - 1]}
                    getOptionLabel={(option) => {
                        return option.Title;
                    }}
                    options={exampleProblems.filter((prob) => prob.Difficulty === diff)}
                    renderInput={(params) => <TextField {...params} label="Choose a problem" />}
                    sx={{
                        m: 1
                    }}
                    onChange={(e, v) => setProblem(v)}
                    value={problem}
                    />
                    <Typography>{problem?.QuickDesc}</Typography>
                    </div>
                    }
                </Stack>
            </div>
        </div>
    )
}