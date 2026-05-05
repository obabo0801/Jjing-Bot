import { config } from 'dotenv';
import readline from 'readline';
import { JjingBot } from '#client';
import { MESSAGES } from '#message';
import * as log from '#log';

const rl = readline.createInterface({
    prompt: '> ',
    input: process.stdin,
    output: process.stdout,
});

let client;

function waitForReady() {
    setTimeout(() => {

        if (client?.isDeploy) {
            rl.resume();
            rl.prompt();
            return;
        }

        waitForReady();
    }, 2000);
}

async function start() {
    rl.pause();

    if (client?.isReady()) {
        await client.start();
        return;
    }

    client = new JjingBot();

    client.config({
        name: 'Jjing-Bot 🐕',
        path: 'src/commands',

        token: process.env.DISCORD_TOKEN,
        status: process.env.DISCORD_STATUS,
        
        clientId: process.env.CLIENT_ID,
        guildId: process.env.GUILD_ID,
    });

    await client.start();

    waitForReady();
}

async function  stop() {
    await client.stop();
}

(async () => {
    config({ quiet: true });

    await start();
})();

rl.on('line', async (input) => {
    const cmd = input.trim();

    rl.pause();

    switch (cmd) {
        case 'start':
            log.cmd(
                MESSAGES.LOGIN.ATTEMPT);
            await start();
            break;
        case 'stop':
            log.cmd(
                MESSAGES.LOGOUT.ATTEMPT);
            await stop();
            break;
        case 'refresh':
            try {
                log.cmd(
                    MESSAGES.REFRESH.ATTEMPT);
                await client.reloadScripts();
                log.load(
                    MESSAGES.REFRESH.SUCCESS);
            } catch (e) {
                log.error(
                    MESSAGES.REFRESH.FAIL);
            }
            break;

        case 'exit':
            log.cmd(
                MESSAGES.SYSTEM.QUIT);
            process.exit(0);
            break;
            
        default:
            log.warn(`❓ '${cmd}' `
                + MESSAGES.SYSTEM.UNKNOWN);
    }

    rl.prompt();
});

process.on('SIGINT', () => {
    log.cmd(
        MESSAGES.SYSTEM.QUIT);
    process.exit(0);
});