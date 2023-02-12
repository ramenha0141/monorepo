import { Box, CircularProgress, FormControlLabel, Switch, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { DiscordOptions } from './API';

const DiscordConfig = () => {
    const [discordOptions, setDiscordOptions] = useState<DiscordOptions>();
    useEffect(() => {
        window.api.getDiscordOptions().then((discordOptions) => setDiscordOptions(discordOptions));
    }, []);
    const handleChange = (key: string, value: boolean | string) => {
        const newDiscordOptions = { ...discordOptions, [key]: value } as DiscordOptions;
        setDiscordOptions(newDiscordOptions);
        window.api.setDiscordOptions(newDiscordOptions);
    };
    if (!discordOptions)
        return (
            <CircularProgress
                color='inherit'
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}
            />
        );
    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <FormControlLabel
                control={<Switch />}
                label='Discord連携を有効にする'
                checked={discordOptions.enabled}
                onChange={(_, checked) => handleChange('enabled', checked)}
            />
            <TextField
                variant='standard'
                label='WebHookURL'
                sx={{ width: 400 }}
                value={discordOptions.webhookURL}
                onChange={(e) => handleChange('webhookURL', e.target.value)}
            />
            <TextField
                variant='standard'
                label='開始テンプレート'
                multiline
                sx={{ width: 400 }}
                value={discordOptions.startTemplate}
                onChange={(e) => handleChange('startTemplate', e.target.value)}
            />
            <TextField
                variant='standard'
                label='停止テンプレート'
                multiline
                sx={{ width: 400 }}
                value={discordOptions.stopTemplate}
                onChange={(e) => handleChange('stopTemplate', e.target.value)}
            />
        </Box>
    );
};
export default DiscordConfig;
