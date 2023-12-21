import { Button, Grid, IconButton, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import RoomRow from "./RoomRow";
import '../../styles/Lobby.css';
import '../../styles/general.css';
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import CreateRoomDialog from "./CreateRoomDialog";
import { getRoomList, joinRoom } from "../../dataProvider";
import { useLoaderData, useNavigate, useRevalidator } from "react-router-dom";
import { routes } from "../../router/router";
import { Refresh } from "@mui/icons-material";

export interface RoomData {
    Title: string,
    Owner: string,
    Difficulty: number,
    Mode: number,
    Users: string[]
    MaxCapacity: number,
    ReqPassword: boolean,
    Password: string,
    Status: string,
    InGame: boolean,
    id: string
}

export async function loader() {
    const roomList = await getRoomList();
    return roomList;
}



export default function Lobby() {

    const rooms = useLoaderData() as RoomData[];
    const [selectedRoom, setSelectedRoom] = useState('');

    const loggedIn = useAppSelector((state: RootState) => state.userInfo.loggedIn);
    const username = useAppSelector((state: RootState) => state.userInfo.username);
    const idToken = useAppSelector((state: RootState) => state.userInfo.idToken);

    const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);

    const navigate = useNavigate();
    const revalidator = useRevalidator();

    function toggleSelectRoom(roomID: string) {
        if (selectedRoom === roomID) {
            setSelectedRoom('');
        }
        else {
            setSelectedRoom(roomID);
        }
    }

    async function handleJoinRoom() {
        if (selectedRoom === '') {
            return;
        }
        if (!username || !idToken) {
            return;
        }
        const success = await joinRoom(selectedRoom, idToken);
        if (!success) {
            // TODO show feedback to user that joining failed
            return;
        }
        // TODO: add password entry workflow
        navigate(`${routes.room}/${selectedRoom}`);
    }

    function startCreateRoomDialog() {
        // start create room workflow - pop up form
        setCreateRoomDialogOpen(true);
        // the pop up UI component will take it from there as far as making the API request
    }

    return (
        <div className="lobby_main">
            <Grid container>
                <Grid item xs={9}>
                    <div className="rooms_card">
                    <div className="toolbar">
                        <Typography variant="h6" gutterBottom>Rooms</Typography>
                        <IconButton onClick={() => revalidator.revalidate()}>
                            <Refresh />
                        </IconButton>
                    </div>
                    <Stack spacing={1}>
                        {
                            rooms?.map((room) => {
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
                    <Button 
                    variant="outlined" 
                    disabled={selectedRoom === '' || !loggedIn}
                    onClick={() => handleJoinRoom()}>Join room</Button>
                    <Button 
                    variant='outlined' 
                    disabled={!loggedIn}
                    onClick={() => startCreateRoomDialog()}>Create room</Button>
                    </Stack>
                </Grid>
            </Grid>
            <CreateRoomDialog open={createRoomDialogOpen} handleClose={() => setCreateRoomDialogOpen(false)} />
        </div>
    )
}