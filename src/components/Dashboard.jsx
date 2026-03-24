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
                    // Filter by alias or name for guest
                    filteredLocks = filteredLocks.filter(lock => 
                        lock.lockAlias === '102' || lock.lockName === '102'
                    );
                }

                // Sort locks numerically by alias/name
                filteredLocks.sort((a, b) => {
                    const nameA = a.lockAlias || a.lockName || '';
                    const nameB = b.lockAlias || b.lockName || '';
                    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
                });

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

    // Group locks by floor
    const groupedLocks = locks.reduce((acc, lock) => {
        const name = lock.lockAlias || lock.lockName || '';
        const floorMatch = name.match(/^(\d)/);
        const floor = floorMatch ? `Floor ${floorMatch[1]}` : 'Other';
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(lock);
        return acc;
    }, {});

    return (
        <div>
            <Typography variant="h4" gutterBottom>{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard</Typography>
            {error && <Typography color="error">{error}</Typography>}
            
            {Object.keys(groupedLocks).map(floor => (
                <Box key={floor} sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.light', pb: 1 }}>
                        {floor === 'Floor 1' ? 'الدور الأول (100)' : 
                         floor === 'Floor 2' ? 'الدور الثاني (200)' : 
                         floor === 'Floor 3' ? 'الدور الثالث (300)' : 
                         floor === 'Floor 4' ? 'الدور الرابع (400)' : 
                         floor === 'Floor 5' ? 'الدور الخامس (500)' : 'أخرى'}
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Lock Name (الغرفة)</TableCell>
                                    <TableCell>Lock ID</TableCell>
                                    <TableCell>Battery</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {groupedLocks[floor].map(lock => (
                                    <TableRow key={lock.lockId}>
                                        <TableCell component="th" scope="row">
                                            {lock.lockAlias || lock.lockName}
                                        </TableCell>
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
                </Box>
            ))}
        </div>
    );
}

export default Dashboard;