import { createStyles, Text, UnstyledButton } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import { useSearch } from './useSearch';

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
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    },

    candidates: {
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 0',
    },

    candidate: {
        padding: '4px 16px',
        transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',

        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
    },

    candidate_active: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },

    candidate_text: {
        margin: '4px 0',
        textAlign: 'center',
        fontSize: '18px',
        color: theme.colorScheme === 'dark' ? '#fff' : '#000',
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    },
}));

export default function Search() {
    const { classes, cx } = useStyles();

    const [focused, setFocused] = useState(false);
    const ref = useClickOutside(() => setFocused(false));

    const [text, setText] = useState('');
    const [isDuringComposition, setIsDuringComposition] = useState(false);
    const { candidates, selectedCandidate, previous, next, run } = useSearch(text);
    return (
        <div className={classes.container} ref={ref}>
            <div className={classes.box}>
                <input
                    className={classes.input}
                    placeholder='Search..'
                    // rome-ignore lint/a11y/noAutofocus: <explanation>
                    autoFocus
                    onFocus={() => setFocused(true)}
                    value={selectedCandidate?.text ?? text}
                    onChange={(e) => setText(e.target.value)}
                    onCompositionStart={() => setIsDuringComposition(true)}
                    onCompositionEnd={() => setIsDuringComposition(false)}
                    onKeyDown={(e) => {
                        switch (e.key) {
                            case 'Escape': {
                                e.currentTarget.blur();
                                setFocused(false);
                                break;
                            }
                            case 'ArrowUp': {
                                previous();
                                e.preventDefault();
                                break;
                            }
                            case 'ArrowDown': {
                                next();
                                e.preventDefault();
                                break;
                            }
                            case 'Enter': {
                                if (isDuringComposition) break;
                                run();
                                break;
                            }
                        }
                    }}
                />
                {useMemo(
                    () =>
                        focused && candidates.length ? (
                            <div className={classes.candidates}>
                                {candidates.map((candidate, i) => (
                                    <UnstyledButton
                                        className={cx(classes.candidate, {
                                            [classes.candidate_active]:
                                                candidate === selectedCandidate,
                                        })}
                                        onClick={() => run(candidate)}
                                        // rome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                        key={i}
                                    >
                                        <Text className={classes.candidate_text}>
                                            {candidate.text}
                                        </Text>
                                    </UnstyledButton>
                                ))}
                            </div>
                        ) : null,
                    [candidates, selectedCandidate, focused],
                )}
            </div>
        </div>
    );
}
