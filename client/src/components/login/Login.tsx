import { Button, FormControl, Input, InputLabel, TextField } from "@mui/material";
import React, { FormEvent, useState } from "react";



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
                    Email: email
                }),
            });
      
            console.log(response)
            // Check if the request was successful (status code 2xx)
            if (response.ok) {
              console.log('User created successfully!');
              // You might want to redirect or update state after a successful user creation
            } else {
              console.error('Failed to create user:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <TextField id='username-input' onChange={(e) => setUsername(e.target.value)} />
                <TextField id='email-input' onChange={(e) => setEmail(e.target.value)} />
                <Button type="submit">Submit</Button>
            </form>
        </div>
    )
}