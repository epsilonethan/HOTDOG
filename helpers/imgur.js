import fetch from "node-fetch";
import {EmbedBuilder} from "discord.js";

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
        return imageLinks[Math.floor(Math.random() * imageLinks.length)].images[0].link;
    } else {
        return null;
    }
}

export async function sendImgurImage(channel, user, searchTerm) {
    const memeUrl = await getRandomImgurImage(searchTerm);

    let description;
    if (searchTerm === 'hotdogs') {
        description = `Hey <@${user.id}>, enjoy this hotdog! 🌭`
    } else if (searchTerm === 'corndogs') {
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