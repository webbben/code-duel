import { Alert, Button, Snackbar } from "@mui/material";
import React from "react";
import { Link, Params, useLoaderData } from "react-router-dom";
import GameSettings from "./GameSettings";
import RoomMembers from "./RoomMembers";
import ChatPane from "./ChatPane";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { getRoomData } from "../../dataProvider";
import { WebSocketProvider } from "../WebSocketContext";
import { routes } from "../../router/router";
import { RoomData } from "../lobby/Lobby";


interface GameSettings {
    mode: number,
    difficulty: number,
    timeLimit: number,
    problem: string,
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

    const roomData = useLoaderData() as RoomData;
    const username = useAppSelector((state: RootState) => state.userInfo.username);
    const loggedIn = useAppSelector((state: RootState) => state.userInfo.loggedIn);
    
    return (
        <WebSocketProvider roomID={roomData.id}>
            <div style={{padding: '20px', height: '100%', display: 'flex', flexDirection: 'row'}}>
                <div className="room_pane">
                    <GameSettings 
                    title={roomData.Title}
                    difficulty={roomData.Difficulty}
                    updateSettings={() => console.log('hi')} />
                    <RoomMembers 
                    users={roomData.Users} 
                    maxCapacity={roomData.MaxCapacity} />
                    <div style={{ height: '40px', textAlign: 'left'}}>
                        <Button variant='outlined'>Leave Room</Button>
                    </div>
                </div>
                <div className="room_pane">
                    <ChatPane username={username} />
                </div>
                <Snackbar open={!loggedIn} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert variant='filled' severity="warning">You're currently not logged in, so you won't be able to participate in this room. <Link to={routes.login}>Login here :)</Link></Alert>
                </Snackbar>
            </div>
        </WebSocketProvider>
    );
}