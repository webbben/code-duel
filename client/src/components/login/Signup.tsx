import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Button, FormControl, FormLabel, Grid, IconButton, Input, InputAdornment, InputLabel, TextField, Typography, styled } from "@mui/material";
import React, { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

interface validationError {
    username: number | null,
    password: number | null,
}

export default function Signup() {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<validationError>({ username: null, password: null });
    const [showPassword, setShowPassword] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()

        if (error.username || error.password) {
            return;
        }
    
        try {
            // Make API call to create a user
            const response = await fetch('http://localhost:8080/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Username: username,
                    Email: email,
                    Password: password
                }),
            });
            if (response.ok) {
                const json = await response.json()
                console.log('User created successfully!');
                console.log(json);
            } else {
              console.error('Failed to create user:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    }

    function onChangeUsername(user: string) {
        setUsername(user);

        // validate username
        if (user.length < 5 || user.length > 10) {
            const err = {...error};
            err.username = 1;
            setError(err);
            return;
        }
        if (user.match(`[^a-zA-Z0-9]`)) {
            const err = {...error};
            err.username = 2;
            setError(err);
            return;
        }
        const err = {...error};
        err.username = null;
        setError(err);
    }

    function onChangePassword(pass: string) {
        setPassword(pass);

        // validate username
        if (pass.length < 5 || pass.length > 15) {
            const err = {...error};
            err.password = 1;
            setError(err);
            return;
        }
        if (!pass.match(`[^a-zA-Z]`)) {
            const err = {...error};
            err.password = 2;
            setError(err);
            return;
        }
        const err = {...error};
        err.password = null;
        setError(err);
    }

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center'}}>        
            <div style={{ width: '80vw', margin: 'auto', minWidth: '300px'}}>
                <Typography variant='h4'>Create account</Typography>
                <br />
                <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: 'auto'}}>
                    <Grid container>
                        <Grid item xs={12}>
                            <TextField
                            error={!!error.username}
                            margin='normal'
                            fullWidth 
                            InputProps={{ sx: { borderRadius: '20px' }}} 
                            id='username-input' 
                            onChange={(e) => onChangeUsername(e.target.value)}
                            label={'Username'} />
                            <Typography 
                            variant='body2' 
                            textAlign={'right'}>
                                <span style={{ color: error.username == 1 ? 'red' : 'unset'}}>5 to 10 characters</span>
                                <span style={{ color: error.username == 2 ? 'red' : 'unset'}}>, alphanumeric</span></Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                            margin='normal' 
                            fullWidth 
                            InputProps={{ sx: { borderRadius: '20px' }}} 
                            id='email-input' 
                            onChange={(e) => setEmail(e.target.value)}
                            label={'Email'} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                            error={!!error.password}
                            type={showPassword ? 'text' : 'password'}
                            margin='normal' 
                            fullWidth 
                            InputProps={{ 
                                sx: { borderRadius: '20px' },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                                            { showPassword ? <Visibility /> : <VisibilityOff /> }
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }} 
                            id='email-input' 
                            onChange={(e) => onChangePassword(e.target.value)}
                            label={'Password'} 
                            />
                            <Typography 
                            variant='body2' 
                            textAlign={'right'}>
                                <span style={{ color: error.password == 1 ? 'red' : 'unset'}}>5 to 15 characters</span>
                                , with <span style={{ color: error.password == 2 ? 'red' : 'unset'}}>at least one number or special character</span></Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <div style={{ display: 'flex', justifyContent:'space-between', alignItems: 'center', marginTop: '20px' }}>
                                <Button sx={{ textAlign: 'left'}} variant='outlined' type="submit">Submit</Button>
                                <span>New user? <Link to='/signup'>Create account</Link></span>
                            </div>
                        </Grid>
                    </Grid>
                    
                </form>
            </div>
        </div>
    )
}