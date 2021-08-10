import 'reflect-metadata';

import { Client } from '@typeit/discord';
import { Intents } from 'discord.js';

require('dotenv').config();

export class Main {
    private static _client: Client;

    static get Client(): Client {
        return this._client;
    }

    static async start() {
        this._client = new Client({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_EMOJIS,
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGE_TYPING,
                Intents.FLAGS.GUILD_INTEGRATIONS,
                Intents.FLAGS.GUILD_PRESENCES,
                Intents.FLAGS.GUILD_WEBHOOKS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_INVITES,
                Intents.FLAGS.GUILD_BANS,
            ],
            requiredByDefault: true,
        });

        // In the login method, you must specify the glob string to load your classes (for the framework).
        // In this case that's not necessary because the entry point of your application is this file.
        await this._client.login(process.env.DISCORD_TOKEN, `${__dirname}/*.ts`);

        this._client.once('ready', async () => {
            await this._client.clearSlashes();
            await this._client.initSlashes();

            console.log('Unit 65A Online!');
        });
    }
}
Main.start();
