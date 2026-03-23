import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';

function Layout({ children, user, onLogout }) {
    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        TTlock Management
                    </Typography>
                    {user && <Button color="inherit" onClick={onLogout}>Logout</Button>}
                </Toolbar>
            </AppBar>
            <Container sx={{ mt: 4 }}>
                {children}
            </Container>
        </div>
    );
}

export default Layout;