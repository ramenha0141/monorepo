import { contextBridge, ipcRenderer } from 'electron';
import type { API, DiscordOptions, Profiles, VanillaVersion } from '../../src/API';

const api: API = {
    openDevtools: () => ipcRenderer.send('openDevtools'),
    getProfiles: () => ipcRenderer.invoke('getProfiles'),
    setProfiles: (profiles: Profiles) => ipcRenderer.send('setProfiles', profiles),
    openFolder: () => ipcRenderer.invoke('openFolder'),
    isInstalled: (path: string) => ipcRenderer.invoke('isInstalled', path),
    getJavaVersion: () => ipcRenderer.invoke('getJavaVersion'),
    installVanilla: (path: string, version: VanillaVersion) => ipcRenderer.send('installVanilla', path, version),
    getDownloadState: () => new Promise((resolve, reject) => ipcRenderer.once('downloadState', (_, success) => (success ? resolve() : reject()))),
    getInstallState: () => new Promise((resolve, reject) => ipcRenderer.once('installState', (_, success) => (success ? resolve() : reject()))),
    openProfile: (path: string) => ipcRenderer.invoke('openProfile', path),
    getProperties: () => ipcRenderer.invoke('getProperties'),
    setProperties: (properties: { [key: string]: string }) => ipcRenderer.send('setProperties', properties),
    getDiscordOptions: () => ipcRenderer.invoke('getDiscordOptions'),
    setDiscordOptions: (discordOptions: DiscordOptions) => ipcRenderer.send('setDiscordOptions', discordOptions),
    start: () => ipcRenderer.invoke('start'),
    stop: () => ipcRenderer.invoke('stop')
};

contextBridge.exposeInMainWorld('api', api);
