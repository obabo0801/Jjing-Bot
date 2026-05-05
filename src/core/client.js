import {
    Client, GatewayIntentBits, REST, Routes
} from 'discord.js';

import { MESSAGES } from '#message'
import * as handler from '#handler';

import * as file from '#file';
import * as log from '#log';

const STATUS = Object.freeze({
    online: MESSAGES.STATUS.ONLINE,
    idle: MESSAGES.STATUS.IDLE,
    dnd: MESSAGES.STATUS.DND,
    invisible: MESSAGES.STATUS.INVISIBLE,
    unknown: MESSAGES.STATUS.UNKNOWN,
});

export class JjingBot extends Client {

    constructor() { super({ intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds]});
    
        this.jjing = {
            name: '',
            path: 'src/commands',

            delay: 5,
            count: 3,
        }

        this.commands = new Map();
        this.customIds = new Map();
        this.messages = new Map();

        this.#initialize();
    }

    #initialize() {
        this.once('clientReady', async () => {
            await this.ready();
        });

        this.on('interactionCreate', (i) => {
            handler.interaction(this, i);
        });

        this.on('messageCreate', (m) => {
            handler.message(this, m);
        });
    }

    #register(inst) {
        inst.commands?.forEach(cmd => {
            this.commands.set(cmd.name, inst);
        });

        inst.customId?.forEach(id => {
            this.customIds.set(id, inst);
        });

        if (inst.message) {
            this.messages.set(inst.name, inst);
        }
    }

    async loadScripts(path = '') {
        try {
            if (!path) {
                path = this.jjing?.path;
            }

            const js = file.dir(path)
                .filter(file =>
                file.endsWith('.js'));
            
            await this.#read(js, path);
        } catch (e) {
            log.error('✖', String(path),
                MESSAGES.LOAD.NOT_FOUND);
            handler.error(e);
        }
    }

    async reloadScripts(path = '') {
        await this.loadScripts(path);
        await this.deployCommands();
    }

    async #read(files, path) {
        try {
            for (const name of files) {
                const url = file.url(path, name);

                const mod = await import(
                    `${url}?v=${Date.now()}`);

                if (!mod.default) continue;
                    
                this.#register(mod.default);

                log.load('✔',
                    file.join(path, name),
                    MESSAGES.LOAD.SUCCESS);
            }
        } catch (e) {
            log.error('✖', name,
                MESSAGES.LOAD.FAIL);
            handler.error(e);
        }
    }

    async deployCommands() {
        try {
            if (!this.jjing?.clientId) {
                this.#undefinedClient();
            }

            if (!this.jjing?.guildId) {
                this.#undefinedGuild();
            }

            const rest = new REST(
                { version: '10' })
                .setToken(this.jjing?.token);

            const body = [...new Set(
                this.commands.values())]
                .flatMap(c =>
                c.commands?.map(cmd =>
                cmd.toJSON()) ?? []);

            await rest.put(
                Routes.applicationGuildCommands(
                    this.jjing?.clientId,
                    this.jjing?.guildId
                ), { body }
            );
            
            await rest.put(
                Routes.applicationCommands(
                    this.jjing?.clientId
                ), { body: [] }
            );
            log.load(MESSAGES.COMMAND.SUCCESS);
        } catch (e) {
            log.error(MESSAGES.COMMAND.FAIL);
            handler.error(error);
        }
    }

    #undefinedClient() {
        throw new Error(
            MESSAGES.COMMAND.CLIENT_UNDEFINED);
    }

    config(options = {}) {
        const valid = Object.fromEntries(
            Object.entries(options)
            .filter(([_, v]) => v !== undefined));

        Object.assign(this.jjing, valid);
    }

    async ready() {
        this.#printBanner(this.jjing?.name);

        log.load(MESSAGES.LOGIN.SUCCESS);
        log.info('👤', this.user.tag);

        this.#changeStatus(this.jjing?.status)

        this.#printGuild(this.jjing?.guildId);

        await this.loadScripts(this.jjing?.path);

        await this.deployCommands();
    }
    
    #printBanner(name) {
        if (!name) return;
        console.log('────────────────────')
        console.log(`${name}`);
        console.log('────────────────────')
    }
    
    #changeStatus(status) {
        if (!status) return;
        this.user.setPresence({
            status});

        log.info(
            STATUS[this.user.presence.status]
            || STATUS.unknown);
    }

    async #printGuild(guildId) {
        try {
            if (!guildId) {
                this.#undefinedGuild();
            }

            const guild = await this
                .guilds.fetch(guildId);
            
            log.load(MESSAGES.GUILD.SUCCESS);
            log.info('🚪', guild.name);
        } catch (e) {
            log.error(MESSAGES.GUILD.FAIL);
            handler.error(e);
        }
    }

    #undefinedGuild() {
        throw new Error(
            MESSAGES.GUILD.GUILD_UNDEFINED);
    }

    async start(retry = 0) {
        try {
            if (!this.jjing?.token) {
                this.#undefinedToken();
            }

            await this.login(
                this.jjing?.token);
        } catch (e) {
            this.#errorStart(e, retry);
        }
    }

    #undefinedToken() {
        throw new Error(
            MESSAGES.LOGIN.TOKEN_UNDEFINED);
    }

    #errorStart(error, retry) {
        log.error(MESSAGES.LOGIN.FAIL);
        handler.error(error);

        if (!this.jjing?.count
        || !this.jjing?.delay) {
            return;
        }

        if (retry >= this.jjing?.count) {
            return log.error(
                MESSAGES.LOGIN.RETRY_LIMIT);
        }

        log.warn(
            MESSAGES.LOGIN.RETRY_COUNT(
                this.jjing?.delay, 
                retry + 1, RETRY_COUNT));

        setTimeout(() => {
            this.start(retry + 1);
        }, this.jjing?.delay * 1000);
    }
}