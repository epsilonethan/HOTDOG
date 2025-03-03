import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js'
import fetch from 'node-fetch';
import { scheduleJob, RecurrenceRule } from 'node-schedule';
import { KnowYourMemeClient } from 'knowyourmeme-ts';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] });

const token = process.env.DISCORD_TOKEN;

const costcoId = process.env.COSTCO;

const knowYourMemeClient = new KnowYourMemeClient();

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

function generateCronRule(minute, hour) {
    const rule = new RecurrenceRule();
    rule.minute = minute;
    rule.hour = hour;
    rule.tz = 'US/Central';

    return rule
}

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

async function sendKnowYourMemeImage(channel, user, memeSearchTerm) {
    const memeUrls = await KnowYourMemeClient.search(memeSearchTerm);

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

client.once(Events.ClientReady, () => {
    console.log('Bot is online!');

    usersToMessage.forEach(config => {
        scheduleJob(generateCronRule(config.cron.minute, config.cron.hour), async () => {
            const user = await client.users.fetch(config.user);
            const channel = client.channels.cache.get(costcoId);

            if (Math.random() > config.knowYourMemeChance) {
                sendImgurImage(channel, user, config.searchTerm)
            } else {
                sendKnowYourMemeImage(channel, user, config.searchTerm, 2);
            }
        })
    })
});

client.login(token);
