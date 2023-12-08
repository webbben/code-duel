import { Circle } from "@mui/icons-material";
import { Chip, Grid, ListItem, Typography } from "@mui/material";
import React from "react";
import DiffLabel from "./DiffLabel";

interface RoomRowProps {
    title: string,
    difficulty: number,
    curcapacity: number,
    maxcapacity: number,
    status: string,
    allowSpectators: boolean,
    owner: string,
    selectRoom: Function,
    isSelected: boolean,
    id: string
}

export default function RoomRow(props: RoomRowProps) {

    var classes = "room_row";

    if (props.isSelected) {
        classes += " selected_row";
    }
    
    return (
        <div className={classes} onClick={() => props.selectRoom(props.id)}>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                <Typography fontWeight={600} noWrap>{props.title}</Typography>
                </Grid>
                <Grid item xs={3}>
                <Typography noWrap>{props.owner}</Typography>
                </Grid>
                <Grid item xs={1}>
                <Typography>{props.curcapacity}/{props.maxcapacity}</Typography>
                </Grid>
                <Grid item xs={2}>
                    <DiffLabel difficulty={props.difficulty}/>
                </Grid>
                <Grid item xs={2}>
                <Typography noWrap>{props.status}</Typography>
                </Grid>
            </Grid>
        </div>
    );
}