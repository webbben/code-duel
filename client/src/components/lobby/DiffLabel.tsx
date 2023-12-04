import { Typography } from "@mui/material";
import React from "react";

interface DiffLabelProps {
    difficulty: number
}

export default function DiffLabel(props: DiffLabelProps) {
    const color = props.difficulty == 1 ? 'green' : props.difficulty == 2 ? 'orange' : 'red';
    const label = props.difficulty == 1 ? 'EAS' : props.difficulty == 2 ? 'MED' : 'HRD';

    return (
        <div className="diff_label" style={{ backgroundColor: color}}>
            <Typography fontWeight={600}>{label}</Typography>
        </div>
    )
}