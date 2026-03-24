require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

console.log('--- Server Config ---');
console.log('PORT:', port);
console.log('CLIENT_ID loaded:', CLIENT_ID ? 'Yes' : 'No');
console.log('CLIENT_SECRET loaded:', CLIENT_SECRET ? 'Yes' : 'No');
console.log('---------------------');

app.use(express.json());

// API Routes
const crypto = require('crypto');

app.post('/api/ttlock/token-direct', async (req, res) => {
    console.log('--- Incoming Login Request ---');
    const { username, password } = req.body;
    console.log('Username:', username);

    if (!username || !password) {
        console.warn('Missing username or password');
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // Diagnostic check for Environment Variables
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error('CRITICAL ERROR: CLIENT_ID or CLIENT_SECRET is missing in environment variables!');
        return res.status(500).json({ error: 'Server configuration error: Missing API credentials in Render settings.' });
    }
    console.log('CLIENT_ID found:', CLIENT_ID.substring(0, 5) + '...');

    try {
        const md5Password = crypto.createHash('md5').update(password).digest('hex');

        const params = new URLSearchParams();
        params.append('client_id', CLIENT_ID);
        params.append('client_secret', CLIENT_SECRET);
        params.append('username', username);
        params.append('password', md5Password);
        params.append('date', Date.now());

        console.log(`Attempting TTLock login via global api.ttlock.com...`);

        // OAuth operations (token) are usually on the global API endpoint
        const response = await axios.post('https://api.ttlock.com/oauth2/token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 15000 
        });

        console.log('TTLock Response errcode:', response.data.errcode);
        
        if (response.data.errcode && response.data.errcode !== 0) {
            console.error('TTLock Error Data:', response.data);
            return res.status(400).json({ 
                error: `TTLock Error (${response.data.errcode}): ${response.data.description || response.data.errmsg}` 
            });
        }

        if (!response.data.access_token) {
            console.error('No access token in response');
            return res.status(400).json({ error: 'TTLock did not return an access token. Please check your credentials.' });
        }

        console.log('Login successful, token received');
        res.json(response.data);
    } catch (error) {
        console.error('Detailed Connection Error:', error.message);
        if (error.response) {
            console.error('Error Response Status:', error.response.status);
            console.error('Error Response Data:', error.response.data);
            const msg = error.response.data.description || error.response.data.errmsg || error.message;
            res.status(error.response.status || 500).json({ error: `TTLock Server Error: ${msg}` });
        } else if (error.request) {
            console.error('No response received from TTLock server');
            res.status(504).json({ error: 'TTLock server did not respond. Please try again in a moment.' });
        } else {
            res.status(500).json({ error: `Request Error: ${error.message}` });
        }
    }
});

app.get('/api/ttlock/locks', async (req, res) => {
    const { accessToken } = req.query;
    console.log('--- Fetching Locks ---');
    console.log('Using Access Token:', accessToken ? 'Yes (provided)' : 'No');

    if (!accessToken) {
        return res.status(400).json({ error: 'Access token is missing' });
    }

    try {
        const response = await axios.get('https://euopen.ttlock.com/v3/lock/list', {
            params: {
                clientId: CLIENT_ID,
                accessToken: accessToken,
                pageNo: 1,
                pageSize: 100, // Increased to get more locks
                date: Date.now()
            }
        });

        console.log('TTLock Locks Response errcode:', response.data.errcode);
        
        if (response.data.errcode && response.data.errcode !== 0) {
            console.error('TTLock Locks Error:', response.data);
            return res.status(400).json({ error: response.data.description || response.data.errmsg });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching locks:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch locks from TTLock server.' });
    }
});

app.get('/api/ttlock/lock', async (req, res) => {
    const { accessToken, lockId } = req.query;

    if (!accessToken || !lockId) {
        return res.status(400).json({ error: 'Access token or lock ID is missing' });
    }

    try {
        const response = await axios.get('https://euopen.ttlock.com/v3/lock/detail', {
            params: {
                clientId: CLIENT_ID,
                accessToken: accessToken,
                lockId: lockId,
                date: Date.now()
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching lock details:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch lock details' });
    }
});

app.get('/api/ttlock/passcodes', async (req, res) => {
    const { accessToken, lockId } = req.query;

    if (!accessToken || !lockId) {
        return res.status(400).json({ error: 'Access token or lock ID is missing' });
    }

    try {
        const response = await axios.get('https://euopen.ttlock.com/v3/passcode/list', {
            params: {
                clientId: CLIENT_ID,
                accessToken: accessToken,
                lockId: lockId,
                pageNo: 1,
                pageSize: 20,
                date: Date.now()
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching passcodes:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch passcodes' });
    }
});

app.post('/api/ttlock/passcode', async (req, res) => {
    const { accessToken, lockId, passcode, startDate, endDate } = req.body;

    if (!accessToken || !lockId || !passcode || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const params = new URLSearchParams();
        params.append('clientId', CLIENT_ID);
        params.append('accessToken', accessToken);
        params.append('lockId', lockId);
        params.append('passcode', passcode);
        params.append('passcodeAlias', 'Generated by App');
        params.append('startDate', startDate);
        params.append('endDate', endDate);
        params.append('date', Date.now());

        const response = await axios.post('https://euopen.ttlock.com/v3/passcode/add', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error adding passcode:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to add passcode' });
    }
});

app.post('/api/ttlock/passcode/delete', async (req, res) => {
    const { accessToken, lockId, passcodeId } = req.body;

    if (!accessToken || !lockId || !passcodeId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const params = new URLSearchParams();
        params.append('clientId', CLIENT_ID);
        params.append('accessToken', accessToken);
        params.append('lockId', lockId);
        params.append('passcodeId', passcodeId);
        params.append('date', Date.now());

        const response = await axios.post('https://euopen.ttlock.com/v3/passcode/delete', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error deleting passcode:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to delete passcode' });
    }
});

app.get('/api/ttlock/records', async (req, res) => {
    const { accessToken, lockId } = req.query;

    if (!accessToken || !lockId) {
        return res.status(400).json({ error: 'Access token or lock ID is missing' });
    }

    try {
        const response = await axios.get('https://euopen.ttlock.com/v3/lock/record/list', {
            params: {
                clientId: CLIENT_ID,
                accessToken: accessToken,
                lockId: lockId,
                pageNo: 1,
                pageSize: 50, // Get more records
                date: Date.now()
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching records:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});

// Ekey Endpoints
app.get('/api/ttlock/ekeys', async (req, res) => {
    const { accessToken, lockId } = req.query;

    if (!accessToken || !lockId) {
        return res.status(400).json({ error: 'Access token or lock ID is missing' });
    }

    try {
        const response = await axios.get('https://euopen.ttlock.com/v3/lock/listKey', {
            params: {
                clientId: CLIENT_ID,
                accessToken: accessToken,
                lockId: lockId,
                pageNo: 1,
                pageSize: 100,
                date: Date.now()
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching ekeys:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch ekeys' });
    }
});

app.post('/api/ttlock/ekey/send', async (req, res) => {
    const { accessToken, lockId, receiverAccount, startDate, endDate, remarks } = req.body;

    if (!accessToken || !lockId || !receiverAccount || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const params = new URLSearchParams();
        params.append('clientId', CLIENT_ID);
        params.append('accessToken', accessToken);
        params.append('lockId', lockId);
        params.append('receiverAccount', receiverAccount);
        params.append('startDate', startDate);
        params.append('endDate', endDate);
        params.append('remarks', remarks || '');
        params.append('date', Date.now());

        const response = await axios.post('https://euopen.ttlock.com/v3/key/send', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error sending ekey:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to send ekey' });
    }
});

app.post('/api/ttlock/ekey/freeze', async (req, res) => {
    const { accessToken, keyId } = req.body;

    if (!accessToken || !keyId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const params = new URLSearchParams();
        params.append('clientId', CLIENT_ID);
        params.append('accessToken', accessToken);
        params.append('keyId', keyId);
        params.append('date', Date.now());

        const response = await axios.post('https://euopen.ttlock.com/v3/key/freeze', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error freezing ekey:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to freeze ekey' });
    }
});

app.post('/api/ttlock/ekey/unfreeze', async (req, res) => {
    const { accessToken, keyId } = req.body;

    if (!accessToken || !keyId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const params = new URLSearchParams();
        params.append('clientId', CLIENT_ID);
        params.append('accessToken', accessToken);
        params.append('keyId', keyId);
        params.append('date', Date.now());

        const response = await axios.post('https://euopen.ttlock.com/v3/key/unfreeze', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error unfreezing ekey:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to unfreeze ekey' });
    }
});

app.post('/api/ttlock/ekey/delete', async (req, res) => {
    const { accessToken, keyId } = req.body;

    if (!accessToken || !keyId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const params = new URLSearchParams();
        params.append('clientId', CLIENT_ID);
        params.append('accessToken', accessToken);
        params.append('keyId', keyId);
        params.append('date', Date.now());

        const response = await axios.post('https://euopen.ttlock.com/v3/key/delete', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error deleting ekey:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to delete ekey' });
    }
});

// Handle TTLock callback (GET and POST)
app.all('/auth/ttlock/callback', (req, res) => {
    // If it's a browser request (likely GET), send index.html
    // If it's a validation request, index.html is also fine as it returns 200 OK
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});

module.exports = app;
