import { Button, Card, Grid, List, ListItem, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import RoomRow from "./RoomRow";
import '../../styles/Lobby.css'

export default function Lobby() {

    const rooms = [
        {
            name: 'Collab room',
            owner: 'newbiecoder4',
            difficulty: 1,
            currentOccupancy: 2,
            maxOccupancy: 5,
            status: 'waiting',
            allowSpectators: true
        },
        {
            name: 'X Technical Interview',
            owner: 'elonmusk',
            difficulty: 3,
            currentOccupancy: 2,
            maxOccupancy: 2,
            status: 'in progress',
            allowSpectators: false
        },
        {
            name: 'FFA Code Race',
            owner: 'leetcoder420',
            difficulty: 2,
            currentOccupancy: 3,
            maxOccupancy: 5,
            status: 'waiting',
            allowSpectators: true
        }
    ]

    const [selectedRoom, setSelectedRoom] = useState(null);

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
                                    <RoomRow {...room} />
                                )
                            })
                        }
                    </Stack>
                    </div>
                </Grid>
                <Grid item xs={3}>
                    <Stack spacing={2} marginLeft={2}>
                    <Button variant="outlined">Join room</Button>
                    <Button variant="outlined">Spectate</Button>
                    <Button variant='outlined'>Create room</Button>
                    </Stack>
                </Grid>
            </Grid>
        </div>
    )
}