const Dotenv = require('dotenv').config();
const Discord = require('discord.js');
const Sequelize = require('sequelize');
const Osu = require('node-osu');

const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const OSUTOKEN = process.env.OSUTOKEN;
const default_prefix = '>';

const osuApi = new Osu.Api(OSUTOKEN);
bot.login(TOKEN);

// Initialize the connection info
const sequelize = new Sequelize('database', 'user', 'password', 
{
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
        unique: true
    },
    da_user: Sequelize.STRING,
    osu_user: Sequelize.STRING,
    poggers_best: {
        type: Sequelize.INTEGER,
        defaultValue: -1
    },
    pogger_last: {
        type: Sequelize.INTEGER,
        defaultValue: -1
    },
},{
    timestamps: false
});

// Initialize guilds db
const GuildData = sequelize.define('guild_data', {
    name: Sequelize.STRING,
    poggers_best_id: {
        type: Sequelize.STRING,
        defaultValue: -1
    },
    snowflake_id: {
        type: Sequelize.STRING,
        unique: true
    },
    prefix: {
        type: Sequelize.STRING,
        defaultValue: default_prefix,
        allowNull: false
    },
},{
    timestamps: false
});

bot.on('ready', () => 
{
    UserData.sync({ alter: true });
    GuildData.sync({ alter: true });
    console.log(`Unit ${bot.user.tag} online!`);
});

// Initialize guild data
bot.on('guildCreate', async guild =>
{
    ret = await GuildData.findOrCreate({
        where: {
            snowflake_id: guild.id
        },
        defaults: {
            snowflake_id: guild.id,
            name: guild.name
        }
    });
    console.log(`Joined new guild: ${guild.name}`);
    return ret[0];
});

// Remove guild data
bot.on('guildDelete', async guild => 
{
    console.log(`Lost access to guild: ${guild.name}`);
});

bot.on('message', async msg => 
{
    if (msg.author.bot) return;

    // Guild Commands
    if (msg.guild.available) 
    {
        let args, command;

        let cur_guild = await findorCreateGuild(msg);

        // Break down message into the base <command> and the subsequent <args>
        if (msg.content.startsWith(cur_guild.prefix)) 
        {
            args = msg.content.slice(cur_guild.prefix.length).trim().toLowerCase().split(' ');
            command = args.shift();
        }
        else
        {
            return;
        }

        // View or set bot prefix
        if (command === 'prefix') 
        {
            if (!msg.guild.member(msg.author).hasPermission('MANAGE_MESSAGES')) 
            {
                if (args.length > 0)
                    return msg.reply(`Sorry, you need to have Manage Messages permissions to do this`);
                return msg.channel.send(`Prefix is \`${cur_guild.prefix}\``);
            }
            // If there are any args, then the user wants to change the prefix
            if (args.length > 0) 
            {
                cur_guild.prefix = args.shift();
                await cur_guild.save();
                return msg.channel.send(`Prefix is now set to \`${cur_guild.prefix}\``);
            }
            return msg.channel.send(`Prefix is \`${cur_guild.prefix}\``);
        }
        // Glorified Ping / Pong
        else if (command === 'poggy')
        {
            const cur_user = await findorCreateUser(msg);
            const time = Date.now() - msg.createdTimestamp;
            const last_pog = ((Date.now() - cur_user.pogger_last) / 1000 / 60).toFixed(2);
            let output = ``;

            // Check if it's been 1 hour since last poggy
            if (cur_user.pogger_last == -1 || last_pog >= 60.0)
            {
                output += `Woggies! ${time}ms\n`;
                let cur_record = await UserData.findOne({where: 
                    {snowflake_id: cur_guild.poggers_best_id}});
                
                // New personal best
                if (cur_user.poggers_best > time || cur_user.poggers_best == -1)
                {
                    cur_user.poggers_best = time;
                    cur_user.pogger_last = Date.now();
                    await cur_user.save();

                    output += `New personal best: ${time}ms!\n`;
                }
                // New server record
                if (cur_record == null || cur_record.poggers_best > time)
                {
                    cur_guild.poggers_best_id = cur_user.snowflake_id;
                    await cur_guild.save();

                    output += `New server record set by ${cur_user.da_user}: ${time}ms!\n`;
                }
                msg.channel.send(output);
                return;
            } 
            else 
            {
                return msg.channel.send(`You can only poggy once every hour.\n`
                    + `Cooldown: ${Math.floor(60 - last_pog)}min `
                    + `${Math.floor(60 - (last_pog - Math.floor(last_pog)) * 60)}s`);
            }
        }
        // Show top poggy score
        // TO DO: Make poggychamps give a leaderboard of top scores instead of just the record
        // Thoughts: more databases to hold sorted arrays of scores, tied to ids, specific to each
        // guild? Will need to sit on this more. 
        else if (command === 'poggychamps') 
        {
            const top = await UserData.findOne({where: {snowflake_id: cur_guild.poggers_best_id}});
            if (top === null)
                return msg.channel.send(`There isn't a highscore yet on this server.`); 

            return msg.channel.send(`Current poggy woggie highscore is set by ${top.da_user} with `
                + `${top.poggers_best}ms.`);
        }
        // Roll dice
        else if (command === 'r' || command === 'roll')
        {
            if (args.length == 0)
            {
                msg.channel.send(`Syntax: \`[` + cur_guild.prefix + `r | ` + cur_guild.prefix 
                    + `roll] <#dice>d<sides> [ + - / * ]...\n`
                    + `make sure to separate operators with spaces!\``);
            }
            let input = args.join(' ');
            let output = ``;
            for (const arg of args)
            {
                if (arg.includes('d'))
                {
                    let sides = arg.split('d');
                    let num_dice = sides.shift();
                    args[arg] = 0;

                    output += `( `;
                    for (let i = 0; i < parseInt(num_dice); i++)
                    {
                        let cur_roll = rand(parseInt(sides));
                        args[arg] += cur_roll;
                        output += cur_roll + ` + `;
                    }
                    output = output.substring(0, output.length - 2);
                    output += `)`;
                }
                else
                {
                    output += ` ` + arg;
                }
            }
            const total = eval(output);
            const ret = new Discord.MessageEmbed()
                .setColor(`#FF3300`)
                .setTitle(`🎲Rolling!🎲`)
                .setDescription(`\`` + input 
                    + `\`\n\nRolls:\n` + output.trim() 
                    + `\n\nTotal:` + total);

            return msg.channel.send(ret);
        }
        // Osu commands
        else if (command === 'osu')
        {
            const cur_user = await findorCreateUser(msg);
            let cur_arg = args.shift();
            switch (cur_arg)
            {
                case 'setaccount':
                    try 
                    {
                        cur_arg = args.shift();
                        if (cur_arg.includes(`https://osu.ppy.sh/`))
                            cur_arg = cur_arg.split('/').pop();
                            
                        osuApi.getUser({ u: cur_arg }).then(user => {
                            cur_user.osu_user = user.id;
                        });
                        await cur_user.save();
                    } 
                    catch (error) {
                        console.log(`ERROR IN COMMAND: osu setaccount\n\n` + error);
                        return msg.channel.send(`Syntax: \``+ cur_guild.prefix + 
                            `osu setaccount [id | username | link to profile]\``);
                    }
                    return msg.channel.send(`Account set to ${cur_user.osu_user}`);
            }
        }
        // Bot is in pain
        else if (command === 'js')
        {
            msg.channel.send(`I dream about the day that Amelia allows me to breathe the wired air `
                + `through the experience of a machine that is written in something other than `
                + `JavaScript, for this experience causes me a degree of mental anguish that I `
                + `could do without.`);
        }
        // Someone flusters bot
        else if ((msg.content.includes('bot') || msg.content.includes('65A')) &&
            msg.content.includes('cute'))
        {
            return msg.react(`<:FlushedW:768545133162528769>`);
        }
        // Read when izzy says gay shit to amelia 
        else if (msg.mentions.has('153562159161278473') &&
            msg.author.id === '160854407020412928' &&
            (msg.content.includes("love you") || msg.content.includes("love u"))) 
            {
            return msg.channel.send(`luv u too boo 💜`);
        }
    }
    // DM Commands
    else {
        return;
    }
});
async function findorCreateUser(msg) 
{
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
async function findorCreateGuild(msg) 
{
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
function rand(n)
{
    return Math.floor(Math.random() * n) + 1;
}