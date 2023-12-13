import { Button, Stack, Typography } from "@mui/material";
import React from "react";
import { leaveRoom } from "../../dataProvider";
import { useNavigate } from "react-router-dom";
import { routes } from "../../router/router";
import { Circle } from "@mui/icons-material";

interface RoomMembersProps {
    users: string[]
    maxCapacity: number,
    roomID: string,
    idToken?: string,
    owner: string,
}

export default function RoomMembers(props: RoomMembersProps) {

    const navigate = useNavigate();

    async function handleLeaveRoom() {
        if (!props.roomID || !props.idToken) {
            console.error("left room without updating server!", "insufficient info");
            navigate(routes.root);
            return;
        }
        const success = await leaveRoom(props.roomID, props.idToken);
        if (success) {
            console.log("successfully left room");
        }
        else {
            console.log("failed to leave room due to an error or refusal on the server.");
            // TODO show visual feedback
        }
        navigate(routes.root);
    }

    if (!props.users || props.users.length == 0) {
        return (
            <div className="room_paneCard">
                <Typography variant="h6">No members...</Typography>
            </div>
        )
    }

    return (
        <div className="room_paneCard" style={{ flex: '0 1 auto' }}>
            <Typography gutterBottom variant="h6">{`Members (${props.users.length}/${props.maxCapacity})`}</Typography>
            <Stack spacing={1} textAlign={'left'}>
                { props.users.map((user) => {
                    const isOwner = user === props.owner;
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'pre'}} key={user}>
                            <Circle sx={{ fontSize: '15px', marginRight: '10px'}} />
                            <Typography>{user}</Typography>
                            { isOwner && <Typography variant="body2" sx={{ color: "gold", fontWeight: '600'}}> (Owner)</Typography> }
                            <Typography variant='body2'>  -  Status</Typography>
                        </div>
                    );
                })}
                <div style={{ marginTop: '20px'}}>
                <Button variant='outlined' onClick={() => handleLeaveRoom()}>Leave Room</Button>
                </div>
            </Stack>
        </div>
    )
}