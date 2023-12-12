import { ArrowUpward } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import { Message, useWebSocket } from "../WebSocketContext";

interface ChatPaneProps {
    username?: string,
}

export default function ChatPane(props: ChatPaneProps) {

    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const { sendMessage, handleMessage } = useWebSocket();

    function addMessage(chatMsg: Message) {
        setMessages(prevMessages => [...prevMessages, {...chatMsg}]);
    }

    function sendChatMessage() {
        if (messageInput.trim() === '') {
            return;
        }
        if (!props.username) {
            return;
        }
        // broadcast over websocket
        sendMessage(messageInput, props.username);

        // handle local state for messages
        const timestamp = Date.now();
        addMessage({
            sender: props.username,
            content: messageInput,
            timestamp: timestamp
        });
        setMessageInput('');
    }

    useEffect(() => {
        const unsubscribe = handleMessage((chatMsg: Message) => {
            console.log(`received message from ${chatMsg.sender}`);
            addMessage(chatMsg);
        });

        return () => {
            unsubscribe();
        }
    }, []);

    return (
        <div className="room_paneCard" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column'}}>
            <div className="room_chatBox">
                { messages.map((msg: Message, i) => {
                    var lastSender = undefined;
                    var lastTimestamp = undefined;
                    if (i > 0) {
                        lastSender = messages[i-1].sender;
                        lastTimestamp = messages[i-1].timestamp;
                    }
                    return (
                        <ChatMessage
                        key={msg.timestamp}
                        {...msg}
                        lastSender={lastSender}
                        lastTimestamp={lastTimestamp}
                        username={props.username} />
                    );
                }) }
            </div>
            <TextField
            margin='normal'
            value={messageInput}
            fullWidth 
            onChange={(e) => setMessageInput(e.target.value)}
            InputProps={{ 
                sx: { borderRadius: '20px' },
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={() => sendChatMessage()}>
                            <ArrowUpward />
                        </IconButton>
                    </InputAdornment>
                )
            }} 
            label={'Send Message'} 
            />
        </div>
    )
}