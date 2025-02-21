import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js'
import fetch from 'node-fetch';
import { scheduleJob } from 'node-schedule';
import readline from 'readline';
import {retrieveImages} from './knowyourmeme/index.js'
import dotenv from 'dotenv';

dotenv.config()

// Create a new Discord client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] });

// Bot's login token
const token = process.env.DISCORD_TOKEN;

// Discord User IDs
const teddy = process.env.TEDDY;
const joel = process.env.JOEL;
const paul = process.env.PAUL;
const ethan = process.env.ETHAN;
const nausoleumId = process.env.NAUSOLEUM;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

async function getRandomImgurImage(searchTerm) {
    const url = `https://api.imgur.com/3/gallery/search?q=${searchTerm}`
    const response = await fetch(url, {
        headers: {
            'Authorization': 'Client-ID ' + process.env.IMGUR_CLIENT_ID
        }
    });
    const data = await response.json();
    if (data && data.data && data.data.length > 0) {
        // Get a random image
        const imageLinks = data.data.filter(image => image.hasOwnProperty('images') && (image.images[0].link.endsWith('.jpg') || image.images[0].link.endsWith('.png') || image.images[0].link.endsWith('.gif')))
        const randomImage = imageLinks[Math.floor(Math.random() * imageLinks.length)].images[0].link;
        return randomImage;
    } else {
        return null;
    }
}

async function sendImgurImage(channel, user, searchTerm) {
    const memeUrl = await getRandomImgurImage(searchTerm);

    let description;
    if (searchTerm == 'hotdogs') {
        description = `Hey <@${user.id}>, enjoy this hotdog! 🌭`
    } else if (searchTerm == 'corndogs') {
        description = `Hey <@${user.id}>, enjoy this corndog! 🍠`
    } else {
        description = `Hey <@${user.id}>, enjoy this ${searchTerm}!`
    }

    if (memeUrl) {
        const embed = new EmbedBuilder()
            .setDescription(description)
            .setImage(memeUrl)
            .setTimestamp();
        
        channel.send({embeds: [embed]});
    } else {
        console.log('Sorry, I couldn\'t find a hotdog meme at the moment. 😔');
    }
}

async function sendKnowYourMemeImage(channel, user, memeSearchTerm, maxPages = 10) {
    const memeUrls = await retrieveImages(memeSearchTerm, maxPages);

    let description;
    if (memeSearchTerm == 'hotdogs') {
        description = `Hey <@${user.id}>, enjoy this hotdog! 🌭`
    } else if (memeSearchTerm == 'corndogs') {
        description = `Hey <@${user.id}>, enjoy this corndog! 🍠`
    } else {
        description = `Hey <@${user.id}>, enjoy this ${memeSearchTerm}!`
    }

    if (memeUrls && memeUrls.length > 0) {
        const randomImage = memeUrls[Math.floor(Math.random() * memeUrls.length)];

        const embed = new EmbedBuilder()
            .setDescription(description)
            .setImage(randomImage)
            .setTimestamp();

        channel.send({embeds: [embed]});
    } else {
        console.log('Sorry, I couldn\'t find a hotdog meme at the moment');
    }
}

// When the bot is ready
client.once(Events.ClientReady, () => {
    console.log('Bot is online!');

    // Listen for the keyboard combo in the console
    rl.on('line', async (input) => {
        const channel = client.channels.cache.get(nausoleumId);
        const teddyUser = await client.users.fetch(teddy);
        const joelUser = await client.users.fetch(joel);
        if (input.trim().toLowerCase() === 'sendhotdog') {
            sendKnowYourMemeImage(channel, teddyUser, 'hotdogs');
        } else if (input.trim().toLowerCase() === 'sendcorndog') {
            if (Math.random() > .5) {
                sendImgurImage(channel, joelUser, 'corndogs')
            } else {
                sendKnowYourMemeImage(channel, joelUser, 'corndogs', 2);
            }
        } else if (input.trim().toLowerCase() === 'explain') {
            channel.send(`🌭<@${user.id}> , I decided to make a bot to auto send you hotdogs🌭\n🌭Enjoy!🌭`)
        } else {
            console.log(`You typed: ${input}`);
        }
    });
    
    scheduleJob('0 16 * * *', async () => {
        const teddyUser = await client.users.fetch(teddy);
        const channel = client.channels.cache.get(nausoleumId);

        sendKnowYourMemeImage(channel, teddyUser, 'hotdogs');
    });

    scheduleJob('0 17 * * *', async () => {
        const paulUser = await client.users.fetch(paul);
        const channel = client.channels.cache.get(nausoleumId);

        sendKnowYourMemeImage(channel, paulUser, 'hotdogs');
    });

    scheduleJob('0 18 * * *', async () => {
        const joelUser = await client.users.fetch(joel);
        const channel = client.channels.cache.get(nausoleumId);

        if (Math.random() > .5) {
            sendImgurImage(channel, joelUser, 'corndogs')
        } else {
            sendKnowYourMemeImage(channel, joelUser, 'corndogs', 2);
        }
    });
});

// Log the bot in using the token
client.login(token);
