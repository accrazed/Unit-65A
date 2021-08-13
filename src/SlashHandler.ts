import { CommandInteraction } from 'discord.js';
import {
    DefaultPermission,
    Discord,
    Permission,
    Slash,
    SlashChoice,
    SlashGroup,
    SlashOption,
    SlashParams,
} from 'discordx';
@Discord()
@SlashGroup('gh', 'Github Commands for easy interaction', {
    issues: 'gh issue commands',
})
export abstract class SlashHandler {
    @DefaultPermission(true)
    @Permission({
        id: '153562159161278473',
        type: 'USER',
        permission: true,
    })
    @Slash('add')
    @SlashGroup('issues')
    ghIssueAdd(
        @SlashOption('title', { description: 'issue title' })
        title: string,
        @SlashOption('body', { description: 'issue description' })
        body: string,
        @SlashOption('image', { description: 'image of issue' })
        image: string,
        interaction: CommandInteraction
    ) {
        interaction.reply(
            `running \`gh issue add --title ${title} --body "${body} [!image of issue](${image})"\`...`
        );
    }
}
