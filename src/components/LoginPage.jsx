import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box } from '@mui/material';

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        let userRole = null;
        if (username === 'admin' && password === '1423') {
            userRole = 'admin';
        } else if (username === 'gadmin' && password === '1234') {
            userRole = 'employee';
        } else if (username === '2334939119' && password === '0564402324') {
            userRole = 'guest';
        }

        if (userRole) {
            onLogin({ username, role: userRole });
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
            <Card sx={{ minWidth: 275, maxWidth: 400 }}>
                <CardContent>
                    <Typography variant="h5" component="div" sx={{ mb: 2 }}>
                        Login
                    </Typography>
                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button fullWidth variant="contained" onClick={handleLogin}>Login</Button>
                </CardContent>
            </Card>
        </Box>
    );
}

export default LoginPage;