import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function Dashboard({ user, accessToken, onAuthentication }) {
    const [locks, setLocks] = useState([]);
    const [error, setError] = useState(null);
    const [openLogin, setOpenLogin] = useState(false);
    const [ttlockUser, setTtlockUser] = useState('');
    const [ttlockPass, setTtlockPass] = useState('');

    const handleConnectDirect = () => {
        axios.post('/api/ttlock/token-direct', { username: ttlockUser, password: ttlockPass })
            .then(response => {
                onAuthentication(response.data.access_token);
                setOpenLogin(false);
            })
            .catch(err => {
                console.error('Error connecting to TTLock:', err);
                setError('Failed to connect. Please check your TTLock username and password.');
            });
    };

    useEffect(() => {
        if (accessToken) {
            axios.get('/api/ttlock/locks', { params: { accessToken } })
            .then(response => {
                let filteredLocks = response.data.list || [];
                if (user.role === 'guest') {
                    filteredLocks = filteredLocks.filter(lock => lock.lockName === '102');
                }
                setLocks(filteredLocks);
            })
            .catch(err => {
                console.error('Error fetching locks:', err);
                setError('Failed to fetch locks. If you are an admin, please connect to TTlock.');
            });
        }
    }, [accessToken, user.role]);

    if (!accessToken && user.role === 'admin') {
        return (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Typography variant="h5">Admin Dashboard</Typography>
                <Typography sx={{ mb: 2 }}>Please connect your TTlock account to manage locks.</Typography>
                <Button variant="contained" onClick={() => setOpenLogin(true)}>Connect to TTlock</Button>

                <Dialog open={openLogin} onClose={() => setOpenLogin(false)}>
                    <DialogTitle>Login to TTLock</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ mb: 2 }}>Enter your TTLock App credentials (Phone or Email).</Typography>
                        <TextField autoFocus margin="dense" label="Username (Phone/Email)" type="text" fullWidth variant="outlined" value={ttlockUser} onChange={(e) => setTtlockUser(e.target.value)} />
                        <TextField margin="dense" label="Password" type="password" fullWidth variant="outlined" value={ttlockPass} onChange={(e) => setTtlockPass(e.target.value)} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenLogin(false)}>Cancel</Button>
                        <Button onClick={handleConnectDirect} variant="contained">Login</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }

    return (
        <div>
            <Typography variant="h4" gutterBottom>{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard</Typography>
            {error && <Typography color="error">{error}</Typography>}
            <Typography variant="h5" gutterBottom>Your Locks:</Typography>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Lock Name</TableCell>
                            <TableCell>Lock ID</TableCell>
                            <TableCell>Battery</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {locks.map(lock => (
                            <TableRow key={lock.lockId}>
                                <TableCell component="th" scope="row">{lock.lockName}</TableCell>
                                <TableCell>{lock.lockId}</TableCell>
                                <TableCell>{lock.electricQuantity}%</TableCell>
                                <TableCell>
                                    <Link to={`/lock/${lock.lockId}`} style={{ textDecoration: 'none' }}>
                                        <Button variant="outlined">Details</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default Dashboard;