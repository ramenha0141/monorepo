import {
    AppBar,
    Box,
    CircularProgress,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Toolbar,
    Typography
} from '@mui/material';
import { Code as CodeIcon, Home as HomeIcon, Menu as MenuIcon } from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { isProcessingState, isRunningState, profilesState } from './states';
import useManageOrSetup from './useManageOrSetup';

const Layout = () => {
    const navigate = useNavigate();
    const profiles = useAtomValue(profilesState);
    const isRunning = useAtomValue(isRunningState);
    const isProcessing = useAtomValue(isProcessingState);
    const [open, setOpen] = useState(false);
    const manageOrSetup = useManageOrSetup();
    const toggleOpen = () => setOpen((open) => !open);
    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <AppBar position='static' sx={{ flexShrink: 0 }}>
                <Toolbar>
                    <IconButton size='large' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }} onClick={toggleOpen}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                        Minecraft Server Manager
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer open={open} onClose={toggleOpen}>
                <List sx={{ flexGrow: 1, width: 240 }} onClick={toggleOpen}>
                    <ListItem key='home' disablePadding>
                        <ListItemButton disabled={isRunning || isProcessing} onClick={() => navigate('/')}>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary='ホーム' />
                        </ListItemButton>
                    </ListItem>
                    <ListSubheader sx={{ backgroundColor: 'inherit' }}>プロファイル</ListSubheader>
                    {Object.entries(profiles).map(([id, { name, path }]) => (
                        <ListItem key={id} disablePadding>
                            <ListItemButton disabled={isRunning || isProcessing} onClick={() => manageOrSetup(id)}>
                                <ListItemText primary={name} secondary={path} sx={{ textOverflow: 'ellipsis' }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <Divider />
                    <ListItem key='openDevtools' disablePadding>
                        <ListItemButton onClick={() => window.api.openDevtools()}>
                            <ListItemIcon>
                                <CodeIcon />
                            </ListItemIcon>
                            <ListItemText primary='開発者ツールを開く' sx={{ textOverflow: 'ellipsis' }} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            <Box
                sx={(theme) => ({
                    flexGrow: 1,
                    backgroundColor: theme.palette.background.default,
                    display: 'flex',
                    flexDirection: 'column'
                })}
            >
                <Outlet />
            </Box>
        </Box>
    );
};
export default Layout;
