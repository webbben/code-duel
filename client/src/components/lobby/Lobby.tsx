import { Button, Grid, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import RoomRow from "./RoomRow";
import '../../styles/Lobby.css'
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import CreateRoomDialog from "./CreateRoomDialog";
import { getRoomList } from "../../dataProvider";
import { useNavigate } from "react-router-dom";
import { routes } from "../../router/router";

interface room {
    title: string,
    owner: string,
    difficulty: number,
    curcapacity: number,
    maxcapacity: number,
    status: string,
    allowSpectators: boolean,
    id: string
}

const exampleRooms: room[] = [
    {
        title: 'Collab room',
        owner: 'newbiecoder4',
        difficulty: 1,
        curcapacity: 2,
        maxcapacity: 5,
        status: 'waiting',
        allowSpectators: true,
        id: 'room1'
    },
    {
        title: 'X Technical Interview',
        owner: 'elonmusk',
        difficulty: 3,
        curcapacity: 2,
        maxcapacity: 2,
        status: 'in progress',
        allowSpectators: false,
        id: 'room2'
    },
    {
        title: 'FFA Code Race',
        owner: 'leetcoder420',
        difficulty: 2,
        curcapacity: 3,
        maxcapacity: 5,
        status: 'waiting',
        allowSpectators: true,
        id: 'room3'
    }
];



export default function Lobby() {

    const [rooms, setRooms] = useState<room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const loggedIn = useAppSelector((state: RootState) => state.userInfo.loggedIn);
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

    function handleJoinRoom() {
        if (selectedRoom === '') {
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