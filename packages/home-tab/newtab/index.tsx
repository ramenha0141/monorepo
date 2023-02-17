import { Box, Container, MantineProvider } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import MontereyLight from 'data-base64:~assets/Monterey Light.webp';
import MontereyDark from 'data-base64:~assets/Monterey Dark.webp';
import Search from './Search';

export default function NewTab() {
    const colorScheme = useColorScheme();
    return (
        <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme }}>
            <Box
                sx={{
                    width: '100vw',
                    height: '100vh',
                    backgroundImage: `url("${
                        colorScheme === 'dark' ? MontereyDark : MontereyLight
                    }")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                }}
            >
                <Container
                    size='lg'
                    sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
                >
                    <Box sx={{ flexGrow: 2 }} />
                    <Search />
                    <Box sx={{ flexGrow: 10 }} />
                </Container>
            </Box>
        </MantineProvider>
    );
}
