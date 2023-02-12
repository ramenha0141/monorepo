import { atom } from 'jotai';
import type { Profiles } from './API';

const profilesStateBase = atom<Profiles>({});
export const profilesState = atom<Profiles, Profiles>(
    (get) => get(profilesStateBase),
    (_, set, value) => {
        set(profilesStateBase, value);
        window.api.setProfiles(value);
    }
);

export const isRunningState = atom(false);
export const isProcessingState = atom(false);
