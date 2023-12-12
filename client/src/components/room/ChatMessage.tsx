import { Typography } from "@mui/material";
import React from "react";

interface ChatMessageProps {
    sender: string,
    content: string,
    timestamp: number,
    username?: string
    lastSender?: string,
    lastTimestamp?: number
}

function formatTime(timestamp: number) {
    const dateObj = new Date(timestamp);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    return `(${hours}:${minutes})`;
}

export default function ChatMessage(props: ChatMessageProps) {

    // if there was no previous message, or previous sender is a different user
    const showSender = !props.lastSender || props.lastSender != props.sender;
    // if there was no previous message, or it's been longer than a certain number of minutes
    const minThreshold = 5;
    const showTimestamp = !props.lastTimestamp || (Math.abs(props.lastTimestamp - props.timestamp) > (60000 * minThreshold));

    const usernameColor = props.sender == props.username ? "#4438cf" : "#8338cf";

    return (
        <div className="room_chatMessage" style={{ marginTop: showSender || showTimestamp ? '0.5em' : 'unset' }}>
            { showSender && <span style={{fontWeight: 'bold', whiteSpace: 'pre', color: usernameColor}}>{props.sender + "  "}</span> }
            { showTimestamp && <span style={{fontWeight: 'lighter'}}>{formatTime(props.timestamp)}</span>}
            <Typography marginTop={showSender || showTimestamp ? '0.1em' : '0'} marginLeft={'0.5em'}>{props.content}</Typography>
        </div>
    );
}