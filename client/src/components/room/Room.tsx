import { Button, Divider, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import GameSettings from "./GameSettings";
import RoomMembers from "./RoomMembers";
import ChatPane from "./ChatPane";


interface Room {
    title: string,
    curCapacity: number,
    maxCapacity: number,
    gameSettings: GameSettings
}

interface GameSettings {
    mode: number,
    difficulty: number,
    timeLimit: number,
    problem: string,
}

export function loader() {
    const roomData: Room = { 
        title: "test room", 
        curCapacity: 1, 
        maxCapacity: 2,
        gameSettings: {
            mode: 1,
            difficulty: 1,
            timeLimit: 150,
            problem: 'hamusort algorithm'
        }
    };
    return roomData;
}

export default function Room() {

    const data = useLoaderData() as Room;

    return (
        <div style={{padding: '20px', height: '100%', display: 'flex', flexDirection: 'row'}}>
            <div className="room_pane">
                <GameSettings title={data.title} {...data.gameSettings} updateSettings={() => console.log('hi')} />
                <RoomMembers curCapacity={data.curCapacity} maxCapacity={data.maxCapacity} />
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