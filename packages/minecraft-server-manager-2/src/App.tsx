import { useEffect, useMemo } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import Layout from './Layout';
import Home from './Home';
import Manage from './Manage';
import Setup from './Setup';
import { useSetAtom } from 'jotai';
import { profilesState } from './states';

const App = () => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? 'dark' : 'light'
                }
            }),
        [prefersDarkMode]
    );
    const setProfiles = useSetAtom(profilesState);
    useEffect(() => {
        window.api.getProfiles().then((profiles) => setProfiles(profiles));
    }, []);
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <HashRouter>
                <Routes>
                    <Route path='/' element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path='/manage/:id' element={<Manage />} />
                        <Route path='/setup/:id' element={<Setup />} />
                    </Route>
                </Routes>
            </HashRouter>
        </ThemeProvider>
    );
};

export default App;
