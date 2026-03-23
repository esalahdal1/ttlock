import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Typography, Paper, Grid, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField } from '@mui/material';

function LockDetails({ user, accessToken }) {
    const { lockId } = useParams();
    const [lock, setLock] = useState(null);
    const [passcodes, setPasscodes] = useState([]);
    const [ekeys, setEkeys] = useState([]);
    const [records, setRecords] = useState([]);
    const [error, setError] = useState(null);

    const [newPasscode, setNewPasscode] = useState('');
    const [newPasscodeStartDate, setNewPasscodeStartDate] = useState('');
    const [newPasscodeEndDate, setNewPasscodeEndDate] = useState('');

    const [newEkeyAccount, setNewEkeyAccount] = useState('');
    const [newEkeyStartDate, setNewEkeyStartDate] = useState('');
    const [newEkeyEndDate, setNewEkeyEndDate] = useState('');
    const [newEkeyRemarks, setNewEkeyRemarks] = useState('');

    const fetchLockData = () => {
        if (accessToken && lockId) {
            // Fetch lock details
            axios.get(`/api/ttlock/lock`, { params: { accessToken, lockId } })
                .then(response => setLock(response.data))
                .catch(err => {
                    console.error('Error fetching lock details:', err);
                    setError('Failed to fetch lock details.');
                });

            // Fetch passcodes
            axios.get(`/api/ttlock/passcodes`, { params: { accessToken, lockId } })
                .then(response => setPasscodes(response.data.list || []))
                .catch(err => console.error('Error fetching passcodes:', err));

            // Fetch ekeys
            axios.get(`/api/ttlock/ekeys`, { params: { accessToken, lockId } })
                .then(response => setEkeys(response.data.list || []))
                .catch(err => console.error('Error fetching ekeys:', err));

            // Fetch records
            axios.get(`/api/ttlock/records`, { params: { accessToken, lockId } })
                .then(response => setRecords(response.data.list || []))
                .catch(err => console.error('Error fetching records:', err));
        }
    };

    useEffect(fetchLockData, [accessToken, lockId]);

    const handleAddPasscode = () => {
        axios.post('/api/ttlock/passcode', {
            accessToken,
            lockId,
            passcode: newPasscode,
            startDate: new Date(newPasscodeStartDate).getTime(),
            endDate: new Date(newPasscodeEndDate).getTime(),
        })
        .then(() => {
            setNewPasscode('');
            setNewPasscodeStartDate('');
            setNewPasscodeEndDate('');
            fetchLockData(); // Refetch all data
        })
        .catch(err => {
            console.error('Error adding passcode:', err);
            alert('Failed to add passcode.');
        });
    };

    const handleDeletePasscode = (passcodeId) => {
        axios.post('/api/ttlock/passcode/delete', { accessToken, lockId, passcodeId })
            .then(() => fetchLockData()) // Refetch all data
            .catch(err => {
                console.error('Error deleting passcode:', err);
                alert('Failed to delete passcode.');
            });
    };

    const handleSendEkey = () => {
        axios.post('/api/ttlock/ekey/send', {
            accessToken,
            lockId,
            receiverAccount: newEkeyAccount,
            startDate: new Date(newEkeyStartDate).getTime(),
            endDate: new Date(newEkeyEndDate).getTime(),
            remarks: newEkeyRemarks,
        })
        .then(() => {
            setNewEkeyAccount('');
            setNewEkeyStartDate('');
            setNewEkeyEndDate('');
            setNewEkeyRemarks('');
            fetchLockData();
        })
        .catch(err => {
            console.error('Error sending ekey:', err);
            alert('Failed to send ekey.');
        });
    };

    const handleFreezeEkey = (keyId) => {
        axios.post('/api/ttlock/ekey/freeze', { accessToken, keyId })
            .then(() => fetchLockData())
            .catch(err => {
                console.error('Error freezing ekey:', err);
                alert('Failed to freeze ekey.');
            });
    };

    const handleUnfreezeEkey = (keyId) => {
        axios.post('/api/ttlock/ekey/unfreeze', { accessToken, keyId })
            .then(() => fetchLockData())
            .catch(err => {
                console.error('Error unfreezing ekey:', err);
                alert('Failed to unfreeze ekey.');
            });
    };

    const handleDeleteEkey = (keyId) => {
        axios.post('/api/ttlock/ekey/delete', { accessToken, keyId })
            .then(() => fetchLockData())
            .catch(err => {
                console.error('Error deleting ekey:', err);
                alert('Failed to delete ekey.');
            });
    };

    if (error) return <Typography color="error">{error}</Typography>;
    if (!lock) return <Typography>Loading lock details...</Typography>;

    return (
        <Grid container spacing={3}>
            {/* Lock Details */}
            <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h5" gutterBottom>{lock.lockName}</Typography>
                    <Typography><strong>Lock ID:</strong> {lock.lockId}</Typography>
                    <Typography><strong>Battery:</strong> {lock.electricQuantity}%</Typography>
                    <Typography><strong>Firmware Version:</strong> {lock.firmwareRevision}</Typography>
                </Paper>
            </Grid>

            {/* Passcodes */}
            <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Passcodes</Typography>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Passcode</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {passcodes.map(p => (
                                <TableRow key={p.passcodeId}>
                                    <TableCell>{p.passcode}</TableCell>
                                    <TableCell>{p.type}</TableCell>
                                    <TableCell>
                                        <Button size="small" variant="outlined" color="error" onClick={() => handleDeletePasscode(p.passcodeId)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box component={Paper} sx={{ p: 2, mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Add New Passcode</Typography>
                    <TextField label="Passcode" value={newPasscode} onChange={e => setNewPasscode(e.target.value)} fullWidth margin="dense" />
                    <TextField type="datetime-local" value={newPasscodeStartDate} onChange={e => setNewPasscodeStartDate(e.target.value)} fullWidth margin="dense" InputLabelProps={{ shrink: true, }} label="Start Date" />
                    <TextField type="datetime-local" value={newPasscodeEndDate} onChange={e => setNewPasscodeEndDate(e.target.value)} fullWidth margin="dense" InputLabelProps={{ shrink: true, }} label="End Date" />
                    <Button variant="contained" onClick={handleAddPasscode} sx={{ mt: 1 }}>Add</Button>
                </Box>
            </Grid>

            {/* Ekeys */}
            <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Ekeys</Typography>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Account</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ekeys.map(k => (
                                <TableRow key={k.keyId}>
                                    <TableCell>{k.username}</TableCell>
                                    <TableCell>{k.keyStatus === '110401' ? 'Normal' : (k.keyStatus === '110402' ? 'Frozen' : 'Deleted')}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {k.keyStatus === '110401' ? (
                                                <Button size="small" variant="outlined" color="warning" onClick={() => handleFreezeEkey(k.keyId)}>Freeze</Button>
                                            ) : (
                                                <Button size="small" variant="outlined" color="success" onClick={() => handleUnfreezeEkey(k.keyId)}>Unfreeze</Button>
                                            )}
                                            <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteEkey(k.keyId)}>Delete</Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box component={Paper} sx={{ p: 2, mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Send New Ekey</Typography>
                    <TextField label="Receiver Account (Phone/Email)" value={newEkeyAccount} onChange={e => setNewEkeyAccount(e.target.value)} fullWidth margin="dense" />
                    <TextField type="datetime-local" value={newEkeyStartDate} onChange={e => setNewEkeyStartDate(e.target.value)} fullWidth margin="dense" InputLabelProps={{ shrink: true, }} label="Start Date" />
                    <TextField type="datetime-local" value={newEkeyEndDate} onChange={e => setNewEkeyEndDate(e.target.value)} fullWidth margin="dense" InputLabelProps={{ shrink: true, }} label="End Date" />
                    <TextField label="Remarks" value={newEkeyRemarks} onChange={e => setNewEkeyRemarks(e.target.value)} fullWidth margin="dense" />
                    <Button variant="contained" onClick={handleSendEkey} sx={{ mt: 1 }}>Send</Button>
                </Box>
            </Grid>

            {/* Audit Records */}
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Audit Records</Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Username</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {records.map(r => (
                                <TableRow key={r.recordId}>
                                    <TableCell>{r.recordType}</TableCell>
                                    <TableCell>{new Date(r.lockDate).toLocaleString()}</TableCell>
                                    <TableCell>{r.username}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
}

export default LockDetails;