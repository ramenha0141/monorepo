/// <reference types="vite/client" />
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import windowStateKeeper from 'electron-window-state';
import { release } from 'os';
import fs from 'fs/promises';
import { join } from 'path';
import { v4 as uuid, validate } from 'uuid';
import type { Profiles, Version } from '../../src/API';
import { pipeline } from 'stream';
import { createWriteStream, existsSync } from 'fs';
import util from 'util';
import child_process from 'child_process';
import fetch from 'node-fetch';
import ServerController from './ServerController';
const streamPipeline = util.promisify(pipeline);
const exec = util.promisify(child_process.exec);

if (
    release().startsWith('6.1') ||
    import.meta.env.VITE_DISABLE_HARDWARE_ACCELERATION === 'true' ||
    existsSync(join(__dirname, 'disable_hardware_acceleration'))
)
    app.disableHardwareAcceleration();

if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

export const paths = {
    dist: join(__dirname, '../..'),
    public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
    profiles: join(app.getPath('appData'), app.getName(), 'profiles.json'),
};

migrateIfNecessary();

const versionURLs: Record<Version, string> = {
    '1.19.2':
        'https://piston-data.mojang.com/v1/objects/f69c284232d7c7580bd89a5a4931c3581eae1378/server.jar',
    'Paper1.19.2':
        'https://api.papermc.io/v2/projects/paper/versions/1.19.2/builds/206/downloads/paper-1.19.2-206.jar',
    '1.19': 'https://launcher.mojang.com/v1/objects/e00c4052dac1d59a1188b2aa9d5a87113aaf1122/server.jar',
    '1.18.2':
        'https://launcher.mojang.com/v1/objects/c8f83c5655308435b3dcf03c06d9fe8740a77469/server.jar',
    '1.17.1':
        'https://launcher.mojang.com/v1/objects/a16d67e5807f57fc4e550299cf20226194497dc2/server.jar',
    '1.16.5':
        'https://launcher.mojang.com/v1/objects/1b557e7b033b583cd9f66746b7a9ab1ec1673ced/server.jar',
    '1.15.2':
        'https://launcher.mojang.com/v1/objects/bb2b6b1aefcd70dfd1892149ac3a215f6c636b07/server.jar',
    '1.14.4':
        'https://launcher.mojang.com/v1/objects/3dc3d84a581f14691199cf6831b71ed1296a9fdf/server.jar',
    '1.13.2':
        'https://launcher.mojang.com/v1/objects/3737db93722a9e39eeada7c27e7aca28b144ffa7/server.jar',
    '1.12.2':
        'https://launcher.mojang.com/v1/objects/886945bfb2b978778c3a0288fd7fab09d315b25f/server.jar',
};

let serverController: ServerController | undefined;

const createWindow = async () => {
    const windowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 500,
    });
    const win = new BrowserWindow({
        title: 'Minecraft Server Manager',
        icon: join(paths.public, 'favicon.svg'),
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        show: false,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
        },
    });
    windowState.manage(win);
    if (app.isPackaged) {
        win.loadFile(join(paths.dist, 'index.html'));
    } else {
        win.loadURL(
            `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`,
        );
    }
    win.removeMenu();
    win.once('ready-to-show', () => win.show());
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) shell.openExternal(url);
        return { action: 'deny' };
    });
    win.on('close', async (e) => {
        if (serverController && (serverController.isRunning || serverController.isProcessing)) {
            e.preventDefault();
            dialog.showErrorBox('エラー', 'サーバーが稼働中です');
        }
    });
    app.on('second-instance', () => {
        if (win.isMinimized()) win.restore();
        win.focus();
    });

    ipcMain.on('openDevtools', () => win.webContents.openDevTools());
    ipcMain.handle('getProfiles', async () => {
        return await getProfiles();
    });
    ipcMain.on('setProfiles', (_, profiles: Profiles) => {
        fs.writeFile(paths.profiles, JSON.stringify(profiles));
    });
    ipcMain.handle('openFolder', async () => {
        const path = (await dialog.showOpenDialog(win, { properties: ['openDirectory'] }))
            .filePaths[0];
        if (!path) return;
        const isEmpty = (await fs.readdir(path)).length === 0;
        return [path, isEmpty];
    });
    ipcMain.handle(
        'isInstalled',
        async (_, id: string) =>
            await exists(join((await getProfiles())[id].path, 'server.properties')),
    );
    ipcMain.handle('getJavaVersion', async () => {
        try {
            const { stderr } = await exec('java -version');
            return parseInt(stderr.match(/(?<=version ")\d+(?=\.)/)?.[0] ?? '0');
        } catch (e) {}
        return 0;
    });
    ipcMain.on('installVanilla', async (_, path: string, version: Version) => {
        try {
            const res = await fetch(versionURLs[version]);
            await streamPipeline(res.body!, createWriteStream(join(path, 'server.jar')));
            win.webContents.send('downloadState', true);
        } catch (e) {
            win.webContents.send('downloadState', false);
            console.log(e);
            return;
        }
        try {
            await exec('java -jar server.jar', { cwd: path });
            await fs.writeFile(join(path, 'eula.txt'), 'eula=true\n');
            win.webContents.send('installState', true);
        } catch (e) {
            win.webContents.send('installState', false);
            console.log(e);
            return;
        }
    });
    ipcMain.handle('openProfile', (_, path: string) => {
        serverController?.dispose();
        serverController = new ServerController(path);
        return;
    });
    ipcMain.handle('getProperties', async () => await serverController!.getProperties());
    ipcMain.on('setProperties', (_, properties: { [key: string]: string }) =>
        serverController!.setProperties(properties),
    );
    ipcMain.handle('getDiscordOptions', async () => serverController!.getDiscordOptions());
    ipcMain.on('setDiscordOptions', (_, discordOptions) =>
        serverController!.setDiscordOptions(discordOptions),
    );
    ipcMain.handle(
        'start',
        async () => await serverController!.start((data) => win.webContents.send('console', data)),
    );
    ipcMain.handle('stop', async () => await serverController!.stop());
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});

async function migrateIfNecessary() {
    const profiles = await getProfiles();
    const key = Object.keys(profiles)[0];
    if (!key || validate(key)) return;
    const migratedProfiles: Profiles = {};
    Object.entries(profiles).map(
        ([key, { path }]) => (migratedProfiles[uuid()] = { name: key, path }),
    );
    fs.writeFile(paths.profiles, JSON.stringify(migratedProfiles));
}
async function getProfiles(): Promise<Profiles> {
    if (!(await exists(paths.profiles))) return {};
    return JSON.parse(await fs.readFile(paths.profiles, 'utf-8'));
}

export async function exists(path: string) {
    try {
        await fs.lstat(path);
        return true;
    } catch (e) {
        return false;
    }
}
