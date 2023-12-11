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
                <ChatPane roomID={roomData.id} />
            </div>
        </div>
    );
}