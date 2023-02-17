import { Box, CircularProgress, Tab, Tabs } from '@mui/material';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Config from './Config';
import Controls from './Controls';
import DiscordConfig from './DiscordConfig';
import { profilesState } from './states';

const TabPanel = (props: { children: JSX.Element; value: number; index: number }) => (
    <Box
        sx={{
            flexGrow: 1,
            flexDirection: 'column',
            display: props.value === props.index ? 'flex' : 'none',
        }}
    >
        {props.value === props.index && props.children}
    </Box>
);

const Manage = () => {
    const { id } = useParams();
    const profiles = useAtomValue(profilesState);
    const [tabIndex, setTabIndex] = useState(0);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        window.api.openProfile(profiles[id!].path).then(() => setLoaded(true));
    }, []);
    if (!id) return null;
    if (!loaded)
        return (
            <CircularProgress
                color='inherit'
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            />
        );
    return (
        <Box
            sx={{
                flexGrow: 1,
                flexBasis: 0,
                mx: 8,
                mb: 4,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Controls />
            <Box sx={{ mb: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabIndex} onChange={(_, tabIndex) => setTabIndex(tabIndex)}>
                    <Tab label='サーバー設定' />
                    <Tab label='バックアップ' />
                    <Tab label='Discord連携' />
                </Tabs>
            </Box>
            <TabPanel value={tabIndex} index={0}>
                <Config />
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
                <div>Not implemented</div>
            </TabPanel>
            <TabPanel value={tabIndex} index={2}>
                <DiscordConfig />
            </TabPanel>
        </Box>
    );
};
export default Manage;
