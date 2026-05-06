import { config, parse } from 'dotenv';
import readline from 'readline';

import { MESSAGES } from '#message';
import { JjingBot } from '#client';

import * as file from '#file';
import * as log from '#log';
import { decode } from '#base64';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '',
});

let clients = new Map();

(async () => {
    config({ quiet: true });
    await setupClients()
})();

function parseEnv(name, show = true) {
    try {
        const env = file.read(name);
        if (!env) return;

        const parsed = parse(decode(env));

        process.env = {
            ...process.env,
            ...parsed
        }

        for (const k in parsed) {
            if (process.env[k]) {
                process.env[k] = 
                decode(process.env[k]);
            }
        }

        if (show) {
            log.load(
                MESSAGES.ENV.SUCCESS);
        }
    } catch (e) {
        if (show) {
            log.error(
                MESSAGES.ENV.FAIL);
        }
    }
}

rl.on('line', async (input) => {
    const cmd = input.trim();
    log.input(cmd); rl.pause();
    await handler(cmd);
});

function initialize() {
    log.clear();
    log.prompt('────────────────────────')
    log.prompt('　Jjing Bot Manager 🐕')
    render(false);

    log.prompt(' restart | refresh | exit');

    rl.prompt();
}

async function setupClients() {
    parseEnv('.env', false);

    configClients('config.json');

    const s = process.env.START;

    if (s === '0') {
        await startAll();
        return;
    }

    const id = Number(s);
    const client = clients.get(id);

    if (!isNaN(id) && client) {
        await start(client);
        ready(client); return;
    }

    initialize();
}

function configClients(name) {
    const config = file.json(name);

    if (!config) return;
    clients.clear();

    Object.entries(config)
        .forEach(([key, value]) => {
        const id = Number(key);

        clients.set(id, new JjingBot());
        clients.get(id).config(value);
    });
}

async function initClients(id) {
    const old = clients.get(id);
    if (old.isReady()) return;
    const client = new JjingBot();
    client.config(old.jjing);
    clients.set(id, client);
}

async function handler(input) {
    const [cmd, arg] = input.split(' ');
    switch (cmd) {
    case 'start': {
        const i = arg 
            ? parseInt(arg) : await select();
        if (i === null) break;
        log.cmd(
            MESSAGES.LOGIN.ATTEMPT);
        try {
            if (i === 0) {
                await startAll();
            } else {
                await start(
                    clients.get(i));
                ready(clients.get(i));
            }
        } catch (e) {
            log.error(e.message);
            rl.prompt();
        }
        break;
    }
    case 'restart': {
        await stopAll();
        await setupClients();
        break;
    }
    case 'stop': {
        const i = arg 
            ? parseInt(arg) : await select();
        if (i === null) break;
        log.cmd(
            MESSAGES.LOGOUT.ATTEMPT);
        try {
            if (i === 0) {
                await stopAll();
            } else {
                await stop(
                    clients.get(i));
                ready(clients.get(i));
                initClients(i); 
            }
        } catch (e) {
            log.error(e.message);
            rl.prompt();
        }
        break;
    }
    case 'refresh': {
        const i = arg 
            ? parseInt(arg) : await select();
        if (i === null) break;
        log.cmd(
            MESSAGES.REFRESH.ATTEMPT);
        try {
            if (i === 0) {
                await refreshAll();
            } else {
                await refresh(
                    clients.get(i));
                ready(clients.get(i));
            }
        } catch (e) {
            log.error(e.message);
            rl.prompt();
        }
        break;
    }
    case 'exit': {
        log.cmd(
            MESSAGES.SYSTEM.QUIT);
        rl.prompt();
        process.exit(0);
        break;
    }
    default:
        log.warn(`❓ '${cmd}' `
            + MESSAGES.SYSTEM.UNKNOWN);
        rl.prompt();
    }
}

function render(show = false) {
    log.prompt('────────────────────────\n')

    if (show) {
        log.prompt('0. Everything')
    }

    for (const [k, v] of clients) {
        const index = show
            ? `${k}. ` : '';
        
        const status = v.getStarts?.();
        
        log.prompt(`${index}`
            + `${v.jjing?.name} `
            + `${status}`);
    }

    log.prompt('\n────────────────────────')
}

function select() {
    return new Promise((resolve) => {
    
    render(true);

    rl.question('', (i) => {
        const num = parseInt(i);
        log.input(num);

        if (isNaN(num) || (num !== 0
            && !clients.get(num))) {
            initialize(); rl.prompt();
            return resolve(null);
        }
            
        resolve(num);
    });

    });
}

async function ready(client) {
    if (await delay(client)) {
        initialize(); rl.prompt();
    }
}

async function delay(client) {
    return new Promise((resolve) => {
    
    const check = () => {
        if (client.isDeploy()) {
            resolve(true);
            return;
        }

        setTimeout(check, 1000);
    }

    setTimeout(check, 1000);

    });
}

async function start(client) {
    rl.pause();
    await client.start();
    await delay(client);
}

async function  stop(client) {
    rl.pause();
    await client.stop();
}

async function  refresh(client) {
    rl.pause();
    await client.reloadScripts();
}

async function startAll() {
    for (const [id, client] of clients) {
        await start(client);
    }
    const client = [...clients
        .values()].at(-1);
    ready(client);
}

async function stopAll() {
    for (const [id, client] of clients) {
        await stop(client);
        initClients(id); 
    }
    const client = [...clients
        .values()].at(-1);
    ready(client);
}

async function refreshAll() {
    for (const [id, client] of clients) {
        await refresh(client);
    }
    const client = [...clients
        .values()].at(-1);
    ready(client);
}

process.on('SIGINT', () => {
    log.cmd(
        MESSAGES.SYSTEM.QUIT);
    process.exit(0);
});