import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HelpOutline } from "@mui/icons-material";
import { useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { serverURL } from "../../dataProvider";
import { routes } from "../../router/router";

interface CreateRoomDialogProps {
    open: boolean,
    handleClose: Function,

}

export default function CreateRoomDialog(props: CreateRoomDialogProps) {

    const [diffValue, setDiffValue] = useState(2);
    const [specValue, setSpecValue] = useState(true);
    const [name, setName] = useState('');
    const [userLimit, setUserLimit] = useState(2);
    const [password, setPassword] = useState('');

    const idToken = useAppSelector((state: RootState) => state.userInfo.idToken);

    const navigate = useNavigate();

    function handleChangeDiff(_event: React.MouseEvent<HTMLElement>, newDiff: number) {
        setDiffValue(newDiff);
    }
    function handleChangeSpec(_event: React.MouseEvent<HTMLElement>, newSpec: boolean) {
        setSpecValue(newSpec);
    }

    async function handleCreateRoom() {

        try {
            // Make API call to create a room
            const response = await fetch(`${serverURL}/protected/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    title: name,
                    maxcapacity: userLimit,
                    allowspectators: specValue,
                    difficulty: diffValue,
                    reqpassword: password.length > 0,
                    password: password
                }),
            });
            if (response.ok) {
                const json = await response.json()
                console.log('Room created successfully!');
                console.log(json);
                props.handleClose();
                navigate(`${routes.room}/${json.roomID}`);
                return;
            } else {
              console.error('Failed to create room:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating room:', error);
        }
        // if it makes it here, an error occurred / creating the room failed.
        // TODO: show feedback to user
    }

    return (
        <Dialog open={props.open} onClose={() => props.handleClose()}>
            <DialogTitle>New Room Settings</DialogTitle>
            <DialogContent>
                <Grid container rowSpacing={4} columnSpacing={1}>
                    <Grid item xs={6}>
                        <TextField value={name} variant='standard' label="Room name" onChange={(e) => setName(e.target.value)} inputProps={{ maxLength: 25 }} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField value={userLimit} variant='standard' label="User limit" type='number' onChange={(e) => setUserLimit(parseInt(e.target.value))} />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography>Difficulty</Typography>
                        <ToggleButtonGroup 
                        exclusive 
                        value={diffValue} 
                        color="primary"
                        onChange={handleChangeDiff}>
                            <ToggleButton value={1}>EAS</ToggleButton>
                            <ToggleButton value={2}>MED</ToggleButton>
                            <ToggleButton value={3}>HRD</ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography>Allow spectators?</Typography>
                        <ToggleButtonGroup 
                        exclusive 
                        value={specValue} 
                        color="primary"
                        onChange={handleChangeSpec}>
                            <ToggleButton value={true}>Yes</ToggleButton>
                            <ToggleButton value={false}>No</ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                    <Grid item xs={12}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <TextField value={password} label="Passcode?" inputProps={{maxLength: 20}} onChange={(e) => setPassword(e.target.value)} />
                            <Tooltip placement='right-start' title={"Enter a passcode to restrict who can join, or leave it empty to allow free access to the room."}>
                                <HelpOutline sx={{ marginLeft: '20px'}} />
                            </Tooltip>
                        </div>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.handleClose()}>Cancel</Button>
                <Button onClick={() => handleCreateRoom()}>Create</Button>
            </DialogActions>
        </Dialog>
    )
}