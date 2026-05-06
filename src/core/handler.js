import { MESSAGES } from '#message'
import * as log from '#log';

export function interaction(client, i) {
    try {
        if (i.isChatInputCommand()) {
            const c = client.commands.get(i.commandName);
            if (c?.slash) return c.slash(i);
        }

        else if (i.isAutocomplete()) {
            const c = client.commands.get(i.commandName);
            if (c?.auto) return c.auto(i, client);
        }

        else if (i.isButton()) {
            const c = client.customIds.get(i.customId);
            if (c?.button) return c.button(i, client);
        }

        else if (i.isStringSelectMenu()) {
            const c = client.customIds.get(i.customId);
            if (c?.menu) return c.menu(i, client);
        }

        else if (i.isModalSubmit()) {
            const c = client.customIds.get(i.customId);
            if (c?.modal) return c.modal(i, client);
        }
    } catch (e) {
        error(e);
    }
}

export function message(client, m) {
    try {
        if (m.content.startsWith('!')) {
            const name = m.content.slice(1)
                .trim().split(/\s+/)
                .shift().toLowerCase();
            const c = client.commands.get(name);
            if (c?.message) return c.message(m);
        }
    } catch (e) {
        error(e);
    }
}

export function error(error) {
    if (error.code === 'TokenInvalid') {
        return log.error(
            MESSAGES.LOGIN.TOKEN_INVALID);
    }

    else if (error.code === 50001) {
        return log.error(
            MESSAGES.COMMAND.MISSING_ACCESS);
    }

    else if (error.code === 50035) {
        return log.error(
            MESSAGES.ERROR.BODY_INVALID);
    }

    else if (error.code === 10002) {
        return log.error(
            MESSAGES.COMMAND.CLIENT_INVALID);
    }

    else if (error.code === 10004) {
        return log.error(
            MESSAGES.GUILD.GUILD_INVALID);
    }

    else if (error.message === 'Used disallowed intents') {
        return log.error(
            MESSAGES.LOGIN.DISALLOWED_INTENTS);
    }

    else if (error instanceof Error) {
        return log.error(error.message);
    }

    else if (error) {
        return log.error(error)
    }
}