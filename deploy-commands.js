import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const clientId = process.env.HOTDOG_APP_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;

const commands = [];
// Grab all the command folders from the commands directory you created earlier
let foldersPath = join(process.cwd(), 'commands');

const commandFiles = readdirSync(foldersPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = join(foldersPath, file);
	const command = await import(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		console.error(`The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.info('Started removing all commands...');
		await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
			.then(() => console.info('Successfully deleted all guild commands.'))
			.catch(err => console.error(err));

		console.info(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.info(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
