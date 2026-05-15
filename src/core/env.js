import { parse } from 'dotenv';
import * as file from '#file';
import * as log from '#log';
import { decode } from '#base64';
import { setLanguage, MESSAGES } from '#i18n';
import * as handler from '#handler';

export function parseEnv(name, show = true) {
    try {
        const path = file.find(name);
        if (!path) return;

        const env = file.read(path);
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

        setLanguage(process.env.LANGUAGE);

        if (show) {
            log.load(MESSAGES.ENV.SUCCESS);
        }
    } catch (e) {
        if (show) {
            log.error(MESSAGES.ENV.FAIL);
            handler.error(e);
        }
    }
}