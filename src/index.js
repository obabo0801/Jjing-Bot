import { config } from 'dotenv';
import * as cli from '#core/cli';
import * as discord
from '#services/discord/index';
import * as google
from '#services/google/index';
config({ quiet: true });

(async () => {
    await cli.start([
        { name: 'DISCORD', ref: discord },
        { name: 'GOOGLE', ref: google }
    ]);
})();