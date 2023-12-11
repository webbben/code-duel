import { Button, Divider, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Params, useLoaderData } from "react-router-dom";
import GameSettings from "./GameSettings";
import RoomMembers from "./RoomMembers";
import ChatPane from "./ChatPane";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { getRoomData, serverURL, verifyToken } from "../../dataProvider";


interface Room {
    title: string,
    curCapacity: number,
    maxCapacity: number,
    gameSettings: GameSettings,
    id: string
}

interface GameSettings {
    mode: number,
    difficulty: number,
    timeLimit: number,
    problem: string,
}

interface ChatMessage {
    sender: string,
    message: string,
    timestamp: number
}

export async function loader({ params }: { params: Params<"roomID"> }) {
    const roomID = params.roomID;
    if (!roomID) {
        console.error('no room ID found in URL params');
        return null;
    }
    const roomData = await getRoomData(roomID);
    roomData.id = roomID;
    return roomData;
}

export default function Room() {

    const roomData = useLoaderData() as Room;

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messageInput, setMessageInput] = useState('');

    const username = useAppSelector((state: RootState) => state.userInfo.username);
    const loggedIn = useAppSelector((state: RootState) => state.userInfo.loggedIn);

    function addMessage(chatMsg: ChatMessage) {
        var newMessages = [...messages];
        newMessages.push(chatMsg);
        setMessages(newMessages);
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
            room: roomData.id,
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
        if (!roomData.id) {
            console.warn('no room id; aborting websocket connection');
            return;
        }
        if (!loggedIn) {
            console.warn('user not logged in; aborting websocket connection');
            return;
        }
        console.log('connecting to websocket');

        const socket = new WebSocket(`ws://localhost:8080/ws?room=${roomData.id}`);
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
    }, [roomData.id]);

    return (
        <div style={{padding: '20px', height: '100%', display: 'flex', flexDirection: 'row'}}>
            <div className="room_pane">
                <GameSettings title={roomData.title} {...roomData.gameSettings} updateSettings={() => console.log('hi')} />
                <RoomMembers curCapacity={roomData.curCapacity} maxCapacity={roomData.maxCapacity} />
                <div style={{ height: '40px', textAlign: 'left'}}>
                    <Button variant='outlined'>Leave Room</Button>
                </div>
            </div>
            <div className="room_pane">
                <ChatPane />
            </div>
        </div>
    );
}