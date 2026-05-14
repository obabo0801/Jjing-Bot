import { config } from 'dotenv';

import * as discord from '#discord';
import * as google from '#google';

import * as cli from '#cli';
import { parseEnv } from '#env';
import * as log from '#log';

(async () => {
    log.title(`
   ▄▄▄    ▄▄▄  ▄▄▄▄▄  ▄▄   ▄   ▄▄▄ 
     █      █    █    █▀▄  █ ▄▀   ▀
     █      █    █    █ █▄ █ █   ▄▄
     █      █    █    █  █ █ █    █
 ▀▄▄▄▀  ▀▄▄▄▀  ▄▄█▄▄  █   ██  ▀▄▄▄▀ 🐕`);
    config({ quiet: true });
    parseEnv('.env', false);
    await cli.start([{ name: 'ALL' }, { name: 'DISCORD', ref: discord }, { name: 'GOOGLE', ref: google }]);

})();