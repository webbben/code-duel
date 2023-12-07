import { Button, Grid, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import RoomRow from "./RoomRow";
import '../../styles/Lobby.css'

interface room {
    name: string,
    owner: string,
    difficulty: number,
    currentOccupancy: number,
    maxOccupancy: number,
    status: string,
    allowSpectators: boolean,
    id: string
}

const exampleRooms: room[] = [
    {
        name: 'Collab room',
        owner: 'newbiecoder4',
        difficulty: 1,
        currentOccupancy: 2,
        maxOccupancy: 5,
        status: 'waiting',
        allowSpectators: true,
        id: 'room1'
    },
    {
        name: 'X Technical Interview',
        owner: 'elonmusk',
        difficulty: 3,
        currentOccupancy: 2,
        maxOccupancy: 2,
        status: 'in progress',
        allowSpectators: false,
        id: 'room2'
    },
    {
        name: 'FFA Code Race',
        owner: 'leetcoder420',
        difficulty: 2,
        currentOccupancy: 3,
        maxOccupancy: 5,
        status: 'waiting',
        allowSpectators: true,
        id: 'room3'
    }
]

export default function Lobby() {

    const [rooms, setRooms] = useState<room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState('');

    function toggleSelectRoom(roomID: string) {
        if (selectedRoom === roomID) {
            setSelectedRoom('');
        }
        else {
            setSelectedRoom(roomID);
        }
    }

    useEffect(() => {
        setRooms(exampleRooms);
    }, []);

    return (
        <div className="lobby_main">
            <Grid container>
                <Grid item xs={9}>
                    <div className="rooms_card">
                    <Typography variant="h6" gutterBottom>Rooms</Typography>
                    <Stack spacing={1}>
                        {
                            rooms.map((room) => {
                                return (
                                    <RoomRow 
                                    {...room} 
                                    key={room.id} 
                                    id={room.id} 
                                    selectRoom={toggleSelectRoom} 
                                    isSelected={selectedRoom === room.id} />
                                )
                            })
                        }
                    </Stack>
                    </div>
                </Grid>
                <Grid item xs={3}>
                    <Stack spacing={2} marginLeft={2}>
                    <Button variant="outlined" disabled={selectedRoom === ''}>Join room</Button>
                    <Button variant="outlined" disabled={selectedRoom === ''}>Spectate</Button>
                    <Button variant='outlined'>Create room</Button>
                    </Stack>
                </Grid>
            </Grid>
        </div>
    )
}