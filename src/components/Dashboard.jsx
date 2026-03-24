import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box } from '@mui/material';

function Dashboard({ user, accessToken }) {
    const [locks, setLocks] = useState([]);
    const [error, setError] = useState(null);

    const handleConnect = () => {
        const clientId = '9b89ac680b7f4a3990c721a27f5941d8'; // This is public anyway, but good to be consistent
        const redirectUri = encodeURIComponent(`${window.location.origin}/auth/ttlock/callback`);
        const authUrl = `https://open.ttlock.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
        window.location.href = authUrl;
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
                <Button variant="contained" onClick={handleConnect}>Connect to TTlock</Button>
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