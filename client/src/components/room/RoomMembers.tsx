import { Stack, Typography } from "@mui/material";
import React from "react";

interface RoomMembersProps {
    curCapacity: number,
    maxCapacity: number,
}

export default function RoomMembers(props: RoomMembersProps) {
    return (
        <div className="room_paneCard" style={{ flex: '0 1 auto' }}>
            <Typography gutterBottom variant="h6">{`Members (${props.curCapacity}/${props.maxCapacity})`}</Typography>
            <Stack spacing={1} textAlign={'left'}>
                <div>user1</div>
                <div>(empty)</div>
            </Stack>
        </div>
    )
}