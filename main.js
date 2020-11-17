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

// Initialize users db
const UserData = sequelize.define('user_data', 
{
    snowflake_id: {
        type: Sequelize.STRING,
        unique: true,
    },
    da_user: Sequelize.STRING,
    osu_user: Sequelize.STRING,
    poggers_best: Sequelize.INTEGER,
    pogger_last: Sequelize.DATE,
});
// Initialize guilds db
const GuildData = sequelize.define('guild_data', 
{
    name: Sequelize.STRING,
    snowflake_id: {
        type: Sequelize.STRING,
        unique: true,
    },
    prefix: {
        type: Sequelize.STRING,
        defaultValue: '>',
        allowNull: false,
    },
});

bot.on('ready', () => 
{
    UserData.sync();
    GuildData.sync();
    console.log(`Unit ${bot.user.tag} online!`);
});

// Initialize guild data
bot.on('guildCreate', async guild => {
    const guild_data = await GuildData.create(
    {
        snowflake_id: guild.id,
        name: guild.name,
    });
    console.log(`Joined new guild: ${guild.name}`);
});

// Remove guild data
bot.on('guildDelete', async guild => {
    console.log(`Lost access to guild: ${guild.name}`);
});

bot.on('message', async msg => 
{
    if (msg.author.bot) return;

    if (msg.content.startsWith())

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