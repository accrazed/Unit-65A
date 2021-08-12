import { ArgsOf, Client, Discord, On, Once, Permission, Slash, SlashParams } from '@typeit/discord';

const prefix = '!';

@Discord()
abstract class EventHandler {
    @On('message')
    onMessage([msg]: ArgsOf<'message'>, client: Client) {
        const content = msg.content.toLocaleLowerCase();
        const supportServerID = `${BigInt('722467018368090142')}`;
        const infoChannelID: `${bigint}` = `${BigInt('722800979266764820')}`;

        if (
            msg.guild.id === supportServerID &&
            content.includes('how') &&
            content.includes('dark')
        ) {
            msg.reply(
                'If you want the dark mode version of the theme, see ' +
                    msg.guild.channels.cache.get(infoChannelID).toString() +
                    ' :)'
            );
        }

        // Prefixed
        if (content.charAt(0) === '!') {
            let args: string[] = content.split(' ');
            let command: string = args.shift().substr(1);

            switch (command) {
                case 'ping':
                    const timeElapsed = Date.now() - +msg.createdAt;
                    msg.reply('Pong! ' + timeElapsed + 'ms');
                    break;
            }
        }
    }
}
