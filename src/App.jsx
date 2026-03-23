import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';
import LockDetails from './components/LockDetails';

import Layout from './components/Layout';

function App() {
    const [user, setUser] = React.useState(null); // To store local user info (role, username)
    const [accessToken, setAccessToken] = React.useState(null);

    const handleLocalLogin = (userInfo) => {
        setUser(userInfo);
    };

    const handleAuthentication = (token) => {
        setAccessToken(token);
    };

    // If the local user is logged in, but we don't have a TTlock token yet, 
    // and the user is an admin, we should prompt them to connect to TTlock.
    // For now, we will handle this logic inside the dashboard.

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!user ? <LoginPage onLogin={handleLocalLogin} /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={user ? <Dashboard user={user} accessToken={accessToken} /> : <Navigate to="/login" />} />
                <Route path="/lock/:lockId" element={user ? <LockDetails user={user} accessToken={accessToken} /> : <Navigate to="/login" />} />
                <Route path="/auth/ttlock/callback" element={<AuthCallback onAuthentication={handleAuthentication} />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;