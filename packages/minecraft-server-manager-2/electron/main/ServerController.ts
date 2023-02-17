import fs from 'fs/promises';
import fsSync from 'fs';
import { join } from 'path';
import { parse, stringify } from './properties';
import type { DiscordOptions } from '../../src/API';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import fetch from 'node-fetch';

class ServerController {
    private discordOptions: DiscordOptions;
    private process?: ChildProcessWithoutNullStreams;
    public isRunning = false;
    public isProcessing = false;
    constructor(private readonly path: string) {
        const optionsPath = join(path, 'discord.json');
        if (fsSync.existsSync(optionsPath)) {
            this.discordOptions = JSON.parse(fsSync.readFileSync(optionsPath, 'utf-8'));
        } else {
            const defaultOptions = {
                enabled: false,
                webhookURL: '',
                startTemplate: 'サーバーが開始しました。',
                stopTemplate: 'サーバーが停止しました。',
            };
            fs.writeFile(optionsPath, JSON.stringify(defaultOptions));
            this.discordOptions = defaultOptions;
        }
    }
    async getProperties() {
        return parse(await fs.readFile(join(this.path, 'server.properties'), 'utf-8'));
    }
    setProperties(properties: { [key: string]: string }) {
        fs.writeFile(join(this.path, 'server.properties'), stringify(properties));
    }
    getDiscordOptions() {
        return this.discordOptions;
    }
    setDiscordOptions(discordOptions: DiscordOptions) {
        fs.writeFile(
            join(this.path, 'discord.json'),
            JSON.stringify((this.discordOptions = discordOptions)),
        );
    }
    async start(callback: (data: string) => void): Promise<boolean> {
        this.isProcessing = true;
        this.process = spawn(
            'java',
            [
                '-Xms2G -Xmx2G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -Dusing.aikars.flags=https://mcflags.emc.gs/ -Daikars.new.flags=true',
                '-jar',
                'server.jar',
                '-nogui',
            ],
            { cwd: this.path },
        );
        this.process.stdout.pipe(process.stdout);
        this.process.stdout.on('data', (data: Buffer) => {
            const str = data.toString();
            callback(str);
        });
        const success = await waitForStartup(this.process);
        if (success && this.discordOptions.enabled) {
            this.notifyDiscord('start');
        }
        this.isRunning = success;
        this.isProcessing = false;
        return success;
    }
    async stop(): Promise<boolean> {
        if (!this.process) return false;
        this.isProcessing = true;
        this.process.stdin.write('stop\n');
        await waitForStop(this.process);
        this.notifyDiscord('stop');
        this.isRunning = false;
        this.isProcessing = false;
        return true;
    }
    notifyDiscord(type: 'start' | 'stop') {
        if (!this.discordOptions.enabled) return;
        fetch(this.discordOptions.webhookURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'MinecraftServerManager',
                content:
                    type === 'start'
                        ? this.discordOptions.startTemplate
                        : this.discordOptions.stopTemplate,
            }),
        });
    }
    dispose() {
        this.process?.kill();
    }
}
export default ServerController;

const waitForStartup = (process: ChildProcessWithoutNullStreams) => {
    const promise = new Promise<boolean>((resolve) => {
        process.stdout.on('data', (data: string) => {
            if (/Done \(.+?\)! For help, type "help"/.test(data)) {
                resolve(true);
            }
        });
        process.on('close', () => resolve(false));
    });
    return promise;
};
const waitForStop = (process: ChildProcessWithoutNullStreams) => {
    const promise = new Promise<void>((resolve) => {
        process.on('close', () => resolve());
    });
    return promise;
};
