import {
    ArgsOf,
    Client,
    Command,
    CommandMessage,
    CommandOption,
    DefaultPermission,
    Discord,
    Guard,
    On,
    Once,
    Permission,
} from 'discordx';
const prefix = '!';

@Discord()
export abstract class MessageHandler {
    @On('message')
    onMessage([msg]: ArgsOf<'message'>, client: Client) {
        const content = msg.content.toLocaleLowerCase();
        const supportServerID = `${BigInt('722467018368090142')}`;
        const infoChannelID: `${bigint}` = `${BigInt('722800979266764820')}`;

        if (msg.guild == null) return;

        if (
            msg.guild.id === supportServerID &&
            content.includes('how') &&
            content.includes('dark')
        ) {
            const infoChannel = msg.guild.channels.cache.get(infoChannelID);
            const channel = infoChannel == null ? '#info' : infoChannel.toString;
            msg.reply(`If you want the dark mode version of the theme, see ${channel} :)`);
        }
    }

    @Command('ping')
    async cmdPing(msg: CommandMessage) {
        const timeElapsed = Date.now() - +msg.createdAt;
        msg.reply('Pong! ' + timeElapsed + 'ms');
    }
}
