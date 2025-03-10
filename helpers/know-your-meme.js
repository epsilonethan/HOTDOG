import {EmbedBuilder} from "discord.js";
import {KnowYourMemeClient} from "knowyourmeme-ts";

export async function sendKnowYourMemeImage(channel, user, memeSearchTerm) {
    const kymClient = new KnowYourMemeClient();
    const memeUrls = await kymClient.search(memeSearchTerm);

    let description;
    if (memeSearchTerm === 'hotdogs') {
        description = `Hey <@${user.id}>, enjoy this hotdog! 🌭`
    } else if (memeSearchTerm === 'corndogs') {
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