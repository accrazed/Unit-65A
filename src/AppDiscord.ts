import { ArgsOf, Client, Discord, On, Once } from '@typeit/discord';

@Discord()
abstract class AppDiscord {
    @On('message')
    onMessage([message]: ArgsOf<'message'>, client: Client) {
        const msg = message.content.toLocaleLowerCase();

        const supportServerID = `${BigInt('722467018368090142')}`;
        const infoChannelID: `${bigint}` = `${BigInt('722800979266764820')}`;

        if (message.guild.id === supportServerID && msg.includes('how') && msg.includes('dark')) {
            message.reply(
                'If you want the dark mode version of the theme, see ' +
                    message.guild.channels.cache.get(infoChannelID).toString() +
                    ' :)'
            );
        }
    }
}
