import type { Status } from 'pidusage';

export interface Profile {
    name: string;
    path: string;
}

export interface Profiles {
    [id: string]: Profile;
}

export type Version =
    | '1.19.2'
    | '1.19'
    | '1.18.2'
    | '1.17.1'
    | '1.16.5'
    | '1.15.2'
    | '1.14.4'
    | '1.13.2'
    | '1.12.2'
    | 'Paper1.19.2';

export interface DiscordOptions {
    enabled: boolean;
    webhookURL: string;
    startTemplate: string;
    stopTemplate: string;
}

export interface API {
    openDevtools: () => void;
    getProfiles: () => Promise<Profiles>;
    setProfiles: (profiles: Profiles) => void;
    openFolder: () => Promise<[string, boolean] | undefined>;
    isInstalled: (path: string) => Promise<boolean>;
    getJavaVersion: () => Promise<number>;
    installVanilla: (path: string, version: Version) => void;
    getDownloadState: () => Promise<void>;
    getInstallState: () => Promise<void>;
    openProfile: (path: string) => Promise<void>;
    getProperties: () => Promise<{ [key: string]: string }>;
    setProperties: (properties: { [key: string]: string }) => void;
    getDiscordOptions: () => Promise<DiscordOptions>;
    setDiscordOptions: (discordOptions: DiscordOptions) => void;
    start: () => Promise<boolean>;
    stop: () => Promise<boolean>;
}

declare global {
    interface Window {
        api: API;
    }
}
