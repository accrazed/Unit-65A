require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Unit ${bot.user.tag} online!`);
});

bot.on('message', msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');

    } else if (msg.content.startsWith('!kick')) {
        if (msg.mentions.users.size) {
            const taggedUser = msg.mentions.users.first();
            msg.channel.send(`You wanted to kick: ${taggedUser.username}`);
        } else {
            msg.reply('Please tag a valid user!');
        }
    }
});
