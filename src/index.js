import * as cli from '#cli';

import * as discord from '#discord';
import * as google from '#google';

import * as log from '#log';

(async () => {
    await cli.start([
        { name: 'DISCORD', ref: discord },
        { name: 'GOOGLE', ref: google }]);
})();