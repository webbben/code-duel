import { Stack, Typography } from "@mui/material";
import React from "react";

interface RoomMembersProps {
    users: string[]
    maxCapacity: number,
}

export default function RoomMembers(props: RoomMembersProps) {

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
                    return (
                        <Typography>{user}</Typography>
                    );
                })}
            </Stack>
        </div>
    )
}