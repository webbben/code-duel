import { ArrowUpward } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import React from "react";

export default function ChatPane() {
    return (
        <div className="room_paneCard" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column'}}>
            <div className="room_chatBox">

            </div>
            <TextField
            margin='normal' 
            fullWidth 
            InputProps={{ 
                sx: { borderRadius: '20px' },
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton>
                            <ArrowUpward />
                        </IconButton>
                    </InputAdornment>
                )
            }} 
            label={'Send Message'} 
            />
        </div>
    )
}