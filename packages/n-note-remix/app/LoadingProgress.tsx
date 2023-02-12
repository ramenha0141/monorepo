import {
    completeNavigationProgress,
    NavigationProgress,
    startNavigationProgress,
} from '@mantine/nprogress';
import { useTransition } from '@remix-run/react';
import { useEffect } from 'react';

export default function LoadingProgress() {
    const { state } = useTransition();
    const active = state !== 'idle';

    useEffect(() => {
        if (active) {
            startNavigationProgress();
        } else {
            completeNavigationProgress();
        }
    }, [active]);

    return <NavigationProgress autoReset />;
}
