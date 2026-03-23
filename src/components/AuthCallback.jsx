import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AuthCallback({ onAuthentication }) {
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');

        if (code) {
            const redirectUri = `${window.location.origin}/auth/ttlock/callback`;
            console.log('Exchanging code with redirectUri:', redirectUri);
            axios.post('/api/ttlock/token', { code, redirectUri })
                .then(response => {
                    const { access_token } = response.data;
                    // We will store the access token more securely later
                    console.log('Access Token:', access_token);
                    onAuthentication(access_token);
                    navigate('/dashboard');
                })
                .catch(err => {
                    console.error('Error getting access token:', err);
                    setError('Failed to get access token. Please try again.');
                });
        } else {
            setError('Authorization code not found. Please try again.');
        }
    }, [location, navigate, onAuthentication]);

    return <div>{error ? error : 'Loading...'}</div>;
}

export default AuthCallback;