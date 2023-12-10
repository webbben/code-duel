import { Typography } from "@mui/material";
import React from "react";
import "../../styles/Room.css";

interface GameSettingsProps {
    title: string,
    mode: number,
    difficulty: number,
    timeLimit: number,
    problem: string,
    updateSettings: Function
}

export default function GameSettings(props: GameSettingsProps) {

    return (
        <div className="room_paneCard" style={{ flex: '1 1 auto' }}>
            <Typography gutterBottom variant="h6">{props.title || "loading"}</Typography>
            <div style={{ textAlign: 'left' }}>
            <Typography>mode: {props.mode}</Typography>
            <Typography>difficulty: {props.difficulty} </Typography>
            <Typography>time limit: {props.timeLimit}</Typography>
            <Typography>problem: {props.problem}</Typography>
            </div>
        </div>
    )
}