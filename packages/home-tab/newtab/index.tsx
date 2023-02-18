import { Box, Container, MantineProvider } from '@mantine/core';
import MontereyLight from 'data-base64:~assets/Monterey Light.webp';
import MontereyDark from 'data-base64:~assets/Monterey Dark.webp';
import Search from './Search';
import Bookmark from './Bookmark';
import { ModalsProvider } from '@mantine/modals';

export default function NewTab() {
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

    return (
        <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme }}>
            <ModalsProvider>
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
                        <Bookmark />
                        <Box sx={{ flexGrow: 1 }} />
                    </Container>
                </Box>
            </ModalsProvider>
        </MantineProvider>
    );
}
