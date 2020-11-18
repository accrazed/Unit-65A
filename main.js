const Dotenv = require('dotenv').config();
const Discord = require('discord.js');
const Sequelize = require('sequelize');

const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const default_prefix = '>';

bot.login(TOKEN);

// Initialize the connection info
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    logging: false,
    dialect: 'sqlite',
    storage: 'database.sqlite',
});

// Initialize users db
const UserData = sequelize.define('user_data', {
    snowflake_id: {
        type: Sequelize.STRING,
        unique: true,
    },
    da_user: {
        type: Sequelize.STRING,
        defaultValue: null
    },
    osu_user: {
        type: Sequelize.STRING,
        defaultValue: null
    },
    poggers_best: {
        type: Sequelize.INTEGER,
        defaultValue: null
    },
    pogger_last: {
        type: Sequelize.INTEGER,
        defaultValue: null
    },
});

// Initialize guilds db
const GuildData = sequelize.define('guild_data', {
    name: Sequelize.STRING,
    poggers_best_id: Sequelize.STRING,
    snowflake_id: {
        type: Sequelize.STRING,
        unique: true,
    },
    prefix: {
        type: Sequelize.STRING,
        defaultValue: default_prefix,
        allowNull: false,
    },
});

bot.on('ready', () => {
    UserData.sync();
    GuildData.sync();
    console.log(`Unit ${bot.user.tag} online!`);
});

// Initialize guild data
bot.on('guildCreate', async guild => {
    console.log(`Joined new guild: ${guild.name}`);
});

// Remove guild data
bot.on('guildDelete', async guild => {
    console.log(`Lost access to guild: ${guild.name}`);
});

bot.on('message', async msg => {
    if (msg.author.bot) return;

    // Guild Commands
    if (msg.guild.available) {
        let args, command;

        let cur_guild = await findorCreateGuild(msg);

        if (msg.content.startsWith(cur_guild.prefix)) {
            args = msg.content.slice(cur_guild.prefix.length).trim().toLowerCase().split(' ');
            command = args.shift();
        } else {
            return;
        }

        if (command === 'prefix') {
            if (!msg.guild.member(msg.author).hasPermission('MANAGE_MESSAGES')) {
                if (args.length > 0)
                    return msg.reply(`Sorry, you need to have Manage Messages permissions to do this`);
                return msg.channel.send(`Prefix is \`${cur_guild.prefix}\``);
            }
            // If there are any args, then the user wants to change the prefix
            if (args.length > 0) {
                cur_guild.prefix = args.shift();
                await cur_guild.save();
                return msg.channel.send(`Prefix is now set to \`${cur_guild.prefix}\``);
            }
            return msg.channel.send(`Prefix is \`${cur_guild.prefix}\``);
        }

        if (command === 'poggy') {
            const cur_user = await findorCreateUser(msg);
            const time = Date.now() - msg.createdTimestamp;
            const last_pog = ((Date.now() - cur_user.pogger_last) / 1000 / 60).toFixed(1);
            let output = ``;

            // Check if it's been 1 hour since last poggy
            if (last_pog == 'NaN' || last_pog >= 60.0) {
                output = output.concat(`Woggies! ${time}ms\n`);
                let cur_record = await UserData.findOne({where: { snowflake_id: cur_guild.poggers_best_id}});
                

                // New personal best
                if (cur_user.poggers_best == null || cur_user.poggers_best > time) {
                    cur_user.poggers_best = time;
                    cur_user.pogger_last = Date.now();

                    await cur_user.save();
                    output = output.concat(`New personal best: ${time}ms!\n`);
                }
                // New server record
                if (cur_guild.poggers_best_id == null || cur_record.poggers_best > time) {
                    cur_guild.poggers_best_id = cur_user.snowflake_id;

                    await cur_guild.save();
                    output = output.concat(`New server record set by ${cur_user.da_user}: ${time}ms!\n`);
                }
                msg.channel.send(output);
                return;
            } else {
                return msg.channel.send(`You can only poggy once every hour.\nCooldown: ${60 - last_pog}min(s)`);
            }
        }
        // TO DO: Make poggychamps give a leaderboard of top scores instead of just the record
        // Thoughts: more databases to hold sorted arrays of scores, tied to ids, specific to each
        // guild? Will need to sit on this more. 
        else if (command === 'poggychamps') {
            const top = await UserData.findOne({where: {snowflake_id: cur_guild.poggers_best_id}});
            if (top === null)
                return msg.channel.send(`There isn't a highscore yet on this server.`); 
            return msg.channel.send(`Current poggy woggie highscore is set by ${top.da_user} with ${top.poggers_best} ms.`);
        } else if (msg.mentions.has('153562159161278473') &&
            msg.author.id === '160854407020412928' &&
            (msg.content.includes("love you") || msg.content.includes("love u"))) {
            msg.channel.send(`luv u too sugartits 💜`);
        }
    }
    // DM Commands
    else {
        return;
    }
});
async function findorCreateUser(msg) {
    ret = await UserData.findOrCreate({
        where: {
            snowflake_id: msg.author.id
        },
        defaults: {
            snowflake_id: msg.author.id,
            da_user: msg.author.username
        }
    });
    return ret[0];
}
async function findorCreateGuild(msg) {
    ret = await GuildData.findOrCreate({
        where: {
            snowflake_id: msg.guild.id
        },
        defaults: {
            snowflake_id: msg.guild.id,
            name: msg.guild.name
        }
    });
    return ret[0];
}