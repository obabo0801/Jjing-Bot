import { config } from 'dotenv';
import readline from 'readline';
import { JjingBot } from '#client';
import * as log from '#log';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let client;

(async () => {
    config({ quiet: true });

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
})();

rl.on('line', async (input) => {
    const cmd = input.trim();

    switch (cmd) {
        case 'refresh':
            if (!client) {
                log.warn('client 아직 초기화 안됨');
                return;
            }

            try {
                await client.reloadScripts();
                log.info('refresh 성공');
            } catch (e) {
                log.error('refresh 실패');
            }
            break;

        case 'exit':
            process.exit(0);
            break;
            
        default:
            log.warn(cmd, '는 없는 명령어 입니다.')
    }
});