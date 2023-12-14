import React, { useEffect, useState } from "react";
import GameSettings from "./GameSettings";
import RoomMembers from "./RoomMembers";
import ChatPane from "./ChatPane";
import { Alert, Snackbar } from "@mui/material";
import { RoomData } from "../lobby/Lobby";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { RoomMessage, RoomUpdateTypes, useWebSocket } from "../WebSocketContext";
import { Link } from "react-router-dom";
import { routes } from "../../router/router";

interface RoomContentProps {
    roomData: RoomData
}

export default function RoomContent(props: RoomContentProps) {

    const roomData = props.roomData;
    const username = useAppSelector((state: RootState) => state.userInfo.username);
    const loggedIn = useAppSelector((state: RootState) => state.userInfo.loggedIn);
    const idToken = useAppSelector((state: RootState) => state.userInfo.idToken);

    const [updateTimestamp, setUpdateTimestamp] = useState('');

    const { sendRoomMessage, handleRoomMessage } = useWebSocket();

    function updateRoomInfo(roomMsg: RoomMessage) {
        if (!roomData) {
            return;
        }

        const timestamp = new Date(roomMsg.timestamp).toLocaleTimeString();

        const roomUpdate = roomMsg.roomupdate;
        const type = roomUpdate.type;

        switch (type) {
            case RoomUpdateTypes.changeRoomName:
                roomData.Title = roomUpdate.data.value;
                console.log(`room name set to ${roomUpdate.data.value}.`);
                // TODO - keep this or discard? not sure if we will allow renaming existing rooms
                break;
            case RoomUpdateTypes.changeDifficulty:
                roomData.Difficulty = roomUpdate.data.value;
                console.log(`room difficulty set to ${roomUpdate.data.value}.`);
                break;
            case RoomUpdateTypes.userJoin:
                if (roomData.Users.includes(roomUpdate.data.value)) break;
                roomData.Users.push(roomUpdate.data.value);
                console.log(`user ${roomUpdate.data.value} has joined the room.`);
                break;
            case RoomUpdateTypes.userLeave:
                if (!roomData.Users.includes(roomUpdate.data.value)) break;
                roomData.Users = roomData.Users.filter((user) => user != roomUpdate.data.value);
                console.log(`user ${roomUpdate.data.value} has left the room.`);
                break;
            case RoomUpdateTypes.setUserReady:
                console.log(`user is now ready`);
                // TODO
                break;
        }
        setUpdateTimestamp(timestamp);
    }
    
    useEffect(() => {
        const unsubRoomMessages = handleRoomMessage((incomingMessage: RoomMessage) => {
            console.log("received room update");
            console.log(incomingMessage);
            updateRoomInfo(incomingMessage);
        });

        return () => {
            unsubRoomMessages();
        };
    }, []);

    console.log(`last update: ${updateTimestamp}`);

    return (
        <div style={{padding: '20px', height: '100%', display: 'flex', flexDirection: 'row'}}>
            <div className="room_pane">
                <GameSettings 
                title={roomData.Title}
                difficulty={roomData.Difficulty}
                updateSettings={() => console.log('hi')} />
                <RoomMembers
                roomID={roomData.id}
                idToken={idToken}
                users={roomData.Users}
                owner={roomData.Owner}
                maxCapacity={roomData.MaxCapacity} />
            </div>
            <div className="room_pane">
                <ChatPane username={username} />
            </div>
            <Snackbar open={!loggedIn} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert variant='filled' severity="warning">You're currently not logged in, so you won't be able to participate in this room. <Link to={routes.login}>Login here :)</Link></Alert>
            </Snackbar>
        </div>
    )
}