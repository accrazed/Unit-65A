const Dotenv = require('dotenv').config();
const Discord = require('discord.js');
const Sequelize = require('sequelize');

const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const global_prefix = '.';

bot.login(TOKEN);

// Initialize the connection info
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	logging: false,
	dialect: 'sqlite',
	storage: 'database.sqlite',
});

// Initialize the database model
const Data = sequelize.define('data', 
{
    snowflakeID: {
        type: Sequelize.STRING,
        unique: true,
    },
    da_user: Sequelize.STRING,
    osu_user: Sequelize.STRING,
    poggers_best: Sequelize.INTEGER,
});
bot.on('ready', () => 
{
    Data.sync({ force: true });
    console.info(`Unit ${bot.user.tag} online!`);
});

bot.on('message', async msg => 
{
    if (msg.author.bot) return;

    let args;
    let command = "";

    // if (msg.guild)
    // {
    //     let prefix = "";

    //     if (msg.content.startsWith(global_prefix))
    //     {
    //         prefix = global_prefix;
    //     }
    //     else
    //     {
    //         // const guildPrefix = await prefixes.get(msg.guild.id);
    //         if (msg.content.startsWith(guildPrefix)) 
    //             prefix = guildPrefix;
    //     }

    //     args = msg.content.slice(prefix.length).trim().split(/\s+/);
    // }
    // const command = args.shift().toLowerCase();

    // if (command === 'prefix') 
    // {
    //     // if there's at least one argument, set the prefix
    //     if (args.length > 0) 
    //     {
    //         // await prefixes.set(msg.guild.id, args[0]);
    //         return msg.channel.send(`Successfully set prefix to \`${args[0]}\``);
    //     }
    //     // return msg.channel.send(`Prefix is \`${await prefixes.get(msg.guild.id) || global_prefix}\``);
    // }

    if (command === 'poggy') 
    {
        let sadge = msg.guild.emojis.cache.find(emoji => emoji.name === 'sadge');
        return msg.channel.send(`no more poggy woggies ${sadge}`);

        let time = Date.now() - msg.createdTimestamp;
        if (time < (await highscore_ping.get(msg.guild.id)).split(/\s+/)[1])
        {
            let hs = "" + msg.author.username + ": " + time  ;
            await highscore_ping.set(msg.guild.id, hs);
            return msg.channel.send(`Woggies! High score! ${hs}ms.`);
        }
        msg.channel.send(`Woggies! ${time}ms.`);
    }
    else if (command === 'poggychamps') {
        // msg.channel.send(`Current poggy woggie highscore is set by ${await highscore_ping.get(msg.guild.id)} ms.`);
    }
    else if (msg.mentions.has('153562159161278473') && msg.author.id === '160854407020412928' && (msg.content.includes("love you") || msg.content.includes("love u")))
    {
        msg.channel.send(`luv u too sugartits 💜`);
    }
});