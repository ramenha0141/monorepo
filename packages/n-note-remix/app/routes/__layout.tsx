import {
    Affix,
    AppShell,
    Avatar,
    Button,
    Container,
    createStyles,
    Group,
    Header,
    Menu,
    Text,
    Transition,
    UnstyledButton,
} from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import {
    Link,
    Outlet,
    useCatch,
    useLocation,
    useNavigate,
    useOutletContext,
} from '@remix-run/react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import {
    IconArrowUp,
    IconChevronDown,
    IconLogin,
    IconLogout,
    IconNote,
    IconPlus,
} from '@tabler/icons';
import { useState } from 'react';

const links: { link: string; label: string }[] = [
    {
        link: '/',
        label: 'ホーム',
    },
    {
        link: '/library',
        label: 'ライブラリ',
    },
];

const useStyles = createStyles((theme) => ({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
        userSelect: 'none',
        '--webkit-user-drag': 'none',
    },

    brandText: {
        [theme.fn.smallerThan('xs')]: {
            display: 'none',
        },
    },

    link: {
        display: 'block',
        lineHeight: 1,
        padding: '8px 12px',
        borderRadius: theme.radius.sm,
        textDecoration: 'none',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
        fontSize: theme.fontSizes.sm,
        fontWeight: 500,
    },

    linkActive: {
        '&, &:hover': {
            backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
                .background,
            color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
        },
    },

    createNote: {
        [theme.fn.smallerThan('xs')]: {
            display: 'none',
        },
    },

    user: {
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
        padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
        borderRadius: theme.radius.sm,
        transition: 'background-color 100ms ease',

        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
        },
    },

    userActive: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
    },

    userName: {
        [theme.fn.smallerThan('xs')]: {
            display: 'none',
        },
    },
}));

export default function Layout() {
    const { supabase, session, locale } = useOutletContext<{
        supabase: SupabaseClient;
        session: Session;
        locale: string;
    }>();
    const user = session?.user;

    const { classes, cx } = useStyles();

    const { pathname } = useLocation();
    const navigate = useNavigate();

    const items = links.map((link) => (
        <Link
            key={link.label}
            to={link.link}
            className={cx(classes.link, { [classes.linkActive]: pathname === link.link })}
        >
            {link.label}
        </Link>
    ));

    const [userMenuOpened, setUserMenuOpened] = useState(false);

    const [scroll, scrollTo] = useWindowScroll();

    return (
        <AppShell
            header={
                <Header height={60}>
                    <Container size='xl' className={classes.header}>
                        <Group spacing={4}>
                            <IconNote size={32} />
                            <Text size={22} weight='bold' className={classes.brandText}>
                                N Note
                            </Text>
                        </Group>
                        <Group spacing={5}>{items}</Group>
                        <Group>
                            {user ? (
                                <>
                                    <Button
                                        radius='md'
                                        leftIcon={<IconPlus />}
                                        className={classes.createNote}
                                        onClick={() => navigate('/note/create')}
                                    >
                                        ノートを作成
                                    </Button>
                                    <Menu
                                        position='bottom-end'
                                        transition='pop-top-right'
                                        onClose={() => setUserMenuOpened(false)}
                                        onOpen={() => setUserMenuOpened(true)}
                                    >
                                        <Menu.Target>
                                            <UnstyledButton
                                                className={cx(classes.user, {
                                                    [classes.userActive]: userMenuOpened,
                                                })}
                                            >
                                                <Group spacing={6}>
                                                    <Avatar
                                                        radius='xl'
                                                        size={32}
                                                        src={user.user_metadata.avatar_url}
                                                    />
                                                    <Text
                                                        weight={500}
                                                        size='sm'
                                                        sx={{ lineHeight: 1 }}
                                                        mr={3}
                                                        className={classes.userName}
                                                    >
                                                        {user.user_metadata.name}
                                                    </Text>
                                                    <IconChevronDown size={12} stroke={1.5} />
                                                </Group>
                                            </UnstyledButton>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item
                                                color='blue'
                                                icon={<IconPlus />}
                                                onClick={() => navigate('/note/create')}
                                            >
                                                ノートを作成
                                            </Menu.Item>
                                            <Menu.Divider />
                                            <Menu.Item
                                                color='red'
                                                icon={<IconLogout />}
                                                onClick={() => supabase.auth.signOut()}
                                            >
                                                ログアウト
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </>
                            ) : (
                                <Button
                                    leftIcon={<IconLogin />}
                                    onClick={() =>
                                        supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: { redirectTo: location.href },
                                        })
                                    }
                                >
                                    ログイン
                                </Button>
                            )}
                        </Group>
                    </Container>
                </Header>
            }
        >
            <Container size='md' h='100%'>
                <Outlet context={{ supabase, session, locale }} />
            </Container>
            <Affix position={{ bottom: 20, right: 20 }}>
                <Transition transition='slide-up' mounted={scroll.y > 0}>
                    {(transitionStyles) => (
                        <Button
                            leftIcon={<IconArrowUp size={16} />}
                            style={transitionStyles}
                            onClick={() => scrollTo({ y: 0 })}
                        >
                            トップに戻る
                        </Button>
                    )}
                </Transition>
            </Affix>
        </AppShell>
    );
}

export const CatchBoundary = () => {
    const caught = useCatch();

    return (
        <Text size='xl'>
            {caught.status} {caught.statusText}
        </Text>
    );
};
