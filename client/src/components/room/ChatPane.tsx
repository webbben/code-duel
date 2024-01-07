import { ArrowUpward } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import ChatMessageElem from "./ChatMessage";
import { ChatMessage, RoomMessage, RoomUpdateTypes, useWebSocket } from "../WebSocketContext";

interface ChatPaneProps {
    username?: string,
}

export default function ChatPane(props: ChatPaneProps) {

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const { sendChatMessage, handleChatMessage, handleRoomMessage, connectionOpen } = useWebSocket();

    function addMessage(chatMsg: ChatMessage) {
        setMessages(prevMessages => [...prevMessages, {...chatMsg}]);
    }

    function sendMessage() {
        if (messageInput.trim() === '') {
            return;
        }
        if (!props.username) {
            return;
        }
        // broadcast over websocket
        sendChatMessage(messageInput, props.username);

        // handle local state for messages
        const timestamp = Date.now();
        addMessage({
            type: "chat_message",
            sender: props.username,
            content: messageInput,
            timestamp: timestamp
        });
        setMessageInput('');
    }

    useEffect(() => {
        if (!connectionOpen) return;
        const unsubChatMessages = handleChatMessage((chatMsg: ChatMessage) => {
            console.log(`received message from ${chatMsg.sender}`);
            if (chatMsg.sender === props.username) return;
            addMessage(chatMsg);
        });

        const unsubRoomMessages = handleRoomMessage((roomMsg: RoomMessage) => {
            const type = roomMsg.roomupdate.type;
            if (type === RoomUpdateTypes.userJoin) {
                addMessage({
                    type: "server_notify",
                    sender: "server_notify",
                    content: `${roomMsg.roomupdate.data.value} has joined the room`,
                    timestamp: roomMsg.timestamp
                });
            }
            if (type === RoomUpdateTypes.userLeave) {
                addMessage({
                    type: "server_notify",
                    sender: "server_notify",
                    content: `${roomMsg.roomupdate.data.value} has left the room`,
                    timestamp: roomMsg.timestamp
                });
            }
        });

        return () => {
            unsubChatMessages();
            unsubRoomMessages();
        }
    }, [connectionOpen]);

    return (
        <div className="room_paneCard" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column'}}>
            <div className="room_chatBox">
                { messages.map((msg: ChatMessage, i) => {
                    var lastSender = undefined;
                    var lastTimestamp = undefined;
                    if (i > 0) {
                        lastSender = messages[i-1].sender;
                        lastTimestamp = messages[i-1].timestamp;
                    }
                    return (
                        <ChatMessageElem
                        serverNotif={msg.type === "server_notify"}
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
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    sendMessage();
                    e.preventDefault();
                }
            }}
            InputProps={{ 
                sx: { borderRadius: '20px' },
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={() => sendMessage()}>
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