import { Circle } from "@mui/icons-material";
import { Chip, Grid, ListItem, Typography } from "@mui/material";
import React from "react";
import DiffLabel from "./DiffLabel";
import { RoomData } from "./Lobby";

interface RoomRowProps extends RoomData {
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
                <Typography fontWeight={600} noWrap>{props.Title}</Typography>
                </Grid>
                <Grid item xs={3}>
                <Typography noWrap>{props.Owner}</Typography>
                </Grid>
                <Grid item xs={1}>
                <Typography>{props.Users?.length}/{props.MaxCapacity}</Typography>
                </Grid>
                <Grid item xs={2}>
                    <DiffLabel difficulty={props.Difficulty}/>
                </Grid>
                <Grid item xs={2}>
                <Typography noWrap>{props.Status}</Typography>
                </Grid>
            </Grid>
        </div>
    );
}