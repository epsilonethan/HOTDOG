import {Client, Events, GatewayIntentBits, Collection} from 'discord.js';
import {scheduleJob} from 'node-schedule';
import {generateCronRule} from "./helpers/cron.js";
import {sendImgurImage} from "./helpers/imgur.js";
import {sendKnowYourMemeImage} from "./helpers/know-your-meme.js";
import {join} from "path";
import {readdirSync} from "fs";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] });

const usersToMessage = [
    {
        user: process.env.TEDDY,
        cron: {
            minute: 0,
            hour: 16
        },
        searchTerm: 'hotdog',
        knowYourMemeChance: 1
    },
    {
        user: process.env.PAUL,
        cron: {
            minute: 0,
            hour: 17
        },
        searchTerm: 'hotdog',
        knowYourMemeChance: 1
    },
    {
        user: process.env.JOEL,
        cron: {
            minute: 0,
            hour: 18
        },
        searchTerm: 'corndog',
        knowYourMemeChance: .5
    },
]

client.commands = new Collection();

let foldersPath = join(process.cwd(), 'commands');

const commandFiles = readdirSync(foldersPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = join(foldersPath, file);
    const command = await import(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.error(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    }
});

client.once(Events.ClientReady, () => {
    console.log('Bot is online!');

    usersToMessage.forEach(config => {
        scheduleJob(generateCronRule(config.cron.minute, config.cron.hour), async () => {
            const user = await client.users.fetch(config.user);
            const channel = await client.channels.fetch(process.env.COSTCO);

            if (Math.random() > config.knowYourMemeChance) {
                await sendImgurImage(channel, user, config.searchTerm)
            } else {
                await sendKnowYourMemeImage(channel, user, config.searchTerm, 2);
            }
        })
    })
});

client.login(process.env.DISCORD_TOKEN);
