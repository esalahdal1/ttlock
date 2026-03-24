import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function Dashboard({ user, accessToken, onAuthentication }) {
    const [locks, setLocks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleConnectFixed = () => {
        setLoading(true);
        setError(null);
        axios.post('/api/ttlock/token-direct', {}) // Sending empty body to use fixed server credentials
            .then(response => {
                if (response.data.access_token) {
                    onAuthentication(response.data.access_token);
                } else {
                    setError('Failed to get access token from fixed account.');
                }
            })
            .catch(err => {
                console.error('Error connecting to TTLock:', err);
                setError(err.response?.data?.error || 'Failed to connect to TTLock fixed account.');
            })
            .finally(() => {
                setLoading(false);
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
                <Typography sx={{ mb: 2 }}>Click below to connect to the fixed TTLock account.</Typography>
                <Button 
                    variant="contained" 
                    onClick={handleConnectFixed} 
                    disabled={loading}
                >
                    {loading ? 'Connecting...' : 'Connect to TTlock'}
                </Button>
                {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
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