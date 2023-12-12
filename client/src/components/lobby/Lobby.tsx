import { Button, Grid, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import RoomRow from "./RoomRow";
import '../../styles/Lobby.css'
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import CreateRoomDialog from "./CreateRoomDialog";
import { getRoomList, joinRoom } from "../../dataProvider";
import { useNavigate } from "react-router-dom";
import { routes } from "../../router/router";

export interface RoomData {
    Title: string,
    Owner: string,
    Difficulty: number,
    Users: string[]
    MaxCapacity: number,
    ReqPassword: boolean,
    Password: string,
    Status: string,
    id: string
}



export default function Lobby() {

    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [selectedRoom, setSelectedRoom] = useState('');

    const loggedIn = useAppSelector((state: RootState) => state.userInfo.loggedIn);
    const username = useAppSelector((state: RootState) => state.userInfo.username);
    const idToken = useAppSelector((state: RootState) => state.userInfo.idToken);

    const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);

    const navigate = useNavigate();

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

    useEffect(() => {
        getRoomList(setRooms);
        //setRooms(exampleRooms);
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
                    <Button 
                    variant="outlined" 
                    disabled={selectedRoom === '' || !loggedIn}
                    onClick={() => handleJoinRoom()}>Join room</Button>
                    <Button 
                    variant="outlined" 
                    disabled={selectedRoom === '' || !loggedIn}>Spectate</Button>
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