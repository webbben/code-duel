import { Button, Grid, TextField, Typography } from "@mui/material";
import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { serverURL } from "../..";
import { useAppDispatch } from "../../redux/hooks";
import { setUserInfo } from "../../redux/userInfoSlice";


export default function Login() {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()

        if (email.length === 0 || password.length === 0) {
            return;
        }
        
        // attempt to login with the given credentials, and obtain an ID token from firebase
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('user logged in', user);
            return user.getIdToken();
        })
        // verify the token on our server too, as an extra security measure
        .then((token) => {
            fetch(`${serverURL}/verifyToken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error("Token verification failed.");
                }
                const json = await response.json();
                console.log('Token verification successful!');
                console.log(json);
                dispatch(setUserInfo({
                    username: json.username,
                    email: email,
                    idToken: token,
                    loggedIn: true
                }));
                navigate('/');
            })
            .catch((error) => {
                console.error('Error sending token to server', error);
                auth.signOut();
            })
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(`${errorCode}: ${errorMessage}`);
        });
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
                            id='email-input' 
                            onChange={(e) => setEmail(e.target.value)}
                            label={'Email'} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                            margin='normal' 
                            fullWidth 
                            InputProps={{ sx: { borderRadius: '20px' }}} 
                            id='password-input' 
                            onChange={(e) => setPassword(e.target.value)}
                            label={'Password'} />
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