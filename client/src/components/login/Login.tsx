import { Button, FormControl, FormLabel, Grid, Input, InputLabel, TextField, Typography, styled } from "@mui/material";
import React, { FormEvent, useState } from "react";
import { Link } from "react-router-dom";


export default function Login() {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
    
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
                    Password: 'testpassword'
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

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center'}}>        
            <div style={{ width: '80vw', margin: 'auto', minWidth: '300px'}}>
                <Typography variant='h4'>Login</Typography>
                <br />
                <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: 'auto'}}>
                    
                    <Grid container>
                        <Grid item xs={12}>
                            <TextField 
                            margin='normal' 
                            fullWidth 
                            InputProps={{ sx: { borderRadius: '20px' }}} 
                            id='username-input' 
                            onChange={(e) => setUsername(e.target.value)}
                            label={'Username'} />
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