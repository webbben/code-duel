import { ArrowUpward } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";

interface ChatMessage {
    sender: string,
    message: string,
    timestamp: number
}

interface ChatPaneProps {
    roomID: string,
}

export default function ChatPane(props: ChatPaneProps) {

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messageInput, setMessageInput] = useState('');

    const username = useAppSelector((state: RootState) => state.userInfo.username);
    const loggedIn = useAppSelector((state: RootState) => state.userInfo.loggedIn);

    function addMessage(chatMsg: ChatMessage) {
        setMessages(prevMessages => [...prevMessages, {...chatMsg}]);
    }

    function sendMessage() {
        if (!socket || messageInput.trim() === '') {
            return;
        }
        if (!username) {
            return;
        }

        const timestamp = Date.now();

        const message = {
            type: "message",
            content: messageInput,
            room: props.roomID,
            sender: username,
            timestamp: timestamp
        }
        socket.send(JSON.stringify(message));
        addMessage({
            sender: username,
            message: messageInput,
            timestamp: timestamp
        });
        setMessageInput('');
    }

    useEffect(() => {
        if (!props.roomID) {
            console.warn('no room id; aborting websocket connection');
            return;
        }
        if (!loggedIn) {
            console.warn('user not logged in; aborting websocket connection');
            return;
        }
        console.log('connecting to websocket');

        const socket = new WebSocket(`ws://localhost:8080/ws?room=${props.roomID}`);
        setSocket(socket);

        // Add event listeners for WebSocket events
        socket.addEventListener('open', () => {
        console.log('WebSocket connection opened');
        });

        socket.addEventListener('message', (event) => {
            const receivedMessage = JSON.parse(event.data);
            const chatMsg: ChatMessage = {
                sender: receivedMessage.sender,
                message: receivedMessage.content,
                timestamp: receivedMessage.timestamp
            };
            console.log('Received message:', receivedMessage, chatMsg);
            addMessage(chatMsg);
        });

        socket.addEventListener('close', () => {
            console.log('WebSocket connection closed');
        });

        // Cleanup function to close the WebSocket when the component unmounts
        return () => {
            console.log('Component unmounted, closing WebSocket connection');
            socket.close();
        };
    }, [props.roomID]);

    return (
        <div className="room_paneCard" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column'}}>
            <div className="room_chatBox">
                { messages.map((msg: ChatMessage) => {
                    return (
                        <p key={msg.timestamp}>{`(${msg.sender}) ${msg.message}`}</p>
                    );
                }) }
            </div>
            <TextField
            margin='normal' 
            fullWidth 
            onChange={(e) => setMessageInput(e.target.value)}
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