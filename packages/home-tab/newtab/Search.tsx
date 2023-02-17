import { createStyles } from '@mantine/core';

const useStyles = createStyles((theme) => ({
    container: {
        position: 'relative',
        width: '100%',
        height: 60,
        margin: '64px 0',
    },
    box: {
        position: 'absolute',
        zIndex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 12,
        backgroundColor: theme.colorScheme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(40px)',
        boxShadow: '0 10px 15px rgb(0 0 0 / 20%)',
    },
    input: {
        width: '100%',
        height: 60,
        fontSize: 22,
        textAlign: 'center',
        color: theme.colorScheme === 'dark' ? '#fff' : '#000',
        padding: '0 24px',
        background: 'none',
        border: 'none',
        outline: 'none',
    },
}));

export default function Search() {
    const { classes, cx } = useStyles();
    return (
        <div className={classes.container}>
            <div className={classes.box}>
                {/* rome-ignore lint/a11y/noAutofocus: <explanation> */}
                <input className={classes.input} placeholder='Search..' autoFocus />
            </div>
        </div>
    );
}
