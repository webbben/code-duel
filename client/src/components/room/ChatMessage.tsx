import { Typography } from "@mui/material";
import React from "react";

interface ChatMessageProps {
    sender: string,
    content: string,
    timestamp: number,
    username?: string
    lastSender?: string,
    lastTimestamp?: number,
    serverNotif?: boolean
}

function formatTime(timestamp: number) {
    const dateObj = new Date(timestamp);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    return `(${hours}:${minutes})`;
}

// renamed to `ChatMessageElem` since interface ChatMessage was a conflict
export default function ChatMessageElem(props: ChatMessageProps) {

    // if there was no previous message, or previous sender is a different user
    const showSender = !props.lastSender || props.lastSender != props.sender;
    // if there was no previous message, or it's been longer than a certain number of minutes
    const minThreshold = 5;
    const showTimestamp = !props.lastTimestamp || (Math.abs(props.lastTimestamp - props.timestamp) > (60000 * minThreshold));

    const usernameColor = props.sender == props.username ? "#4438cf" : "#8338cf";

    if (props.serverNotif) {
        return (
            <div className="room_chatMessage">
                <span style={{ fontWeight: 'lighter' }}>{props.content}</span>
            </div>
        )
    }

    return (
        <div className="room_chatMessage" style={{ marginTop: showSender || showTimestamp ? '0.5em' : 'unset' }}>
            { showSender && <span style={{fontWeight: 'bold', whiteSpace: 'pre', color: usernameColor}}>{props.sender + "  "}</span> }
            { showTimestamp && <span style={{fontWeight: 'lighter'}}>{formatTime(props.timestamp)}</span>}
            <Typography marginTop={showSender || showTimestamp ? '0.1em' : '0'} marginLeft={'0.5em'}>{props.content}</Typography>
        </div>
    );
}