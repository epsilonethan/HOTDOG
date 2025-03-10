import {EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {KnowYourMemeClient} from "knowyourmeme-ts";

export const data = new SlashCommandBuilder()
    .setName('random')
    .setDescription('Send a random meme based on search term')
    .addStringOption(option =>
        option
            .setName('searchTerm')
            .setRequired(true)
    );
export async function execute(interaction) {
    const kymClient = new KnowYourMemeClient();
    const memeUrls = await kymClient.search(interaction.options.getString('searchTerm'));

    if (memeUrls && memeUrls.length > 0) {
        const randomImage = memeUrls[Math.floor(Math.random() * memeUrls.length)];

        const embed = new EmbedBuilder()
            .setDescription(`Here\'s your ${interaction.options.getString('searchTerm')}`)
            .setImage(randomImage)
            .setTimestamp();

        await interaction.reply({embeds: [embed]})
    } else {
        await interaction.reply('Your search term didn\'t return any results!');
        console.log('Sorry, I couldn\'t find a hotdog meme at the moment');
    }


}
