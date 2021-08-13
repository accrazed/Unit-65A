import 'reflect-metadata';

import { Client } from 'discordx';
import { Intents } from 'discord.js';

require('dotenv').config();

export class Main {
    private static _client: Client;

    static get Client(): Client {
        return this._client;
    }

    static async start() {
        this._client = new Client({
            classes: [`${__dirname}/*.ts`],
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
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
            prefix: '!',
            requiredByDefault: true,
            slashGuilds: ['722467018368090142'],
        });

        await this._client.login(process.env.DISCORD_TOKEN || '');

        this._client.once('ready', async () => {
            await this._client.clearSlashes();
            await this._client.initSlashes();

            console.log('Unit 65A Online!');
        });

        this._client.on('messageCreate', (message) => {
            this._client.executeCommand(message);
        });

        this._client.on('interactionCreate', (interaction) => {
            this._client.executeInteraction(interaction);
        });
    }
}
Main.start();
