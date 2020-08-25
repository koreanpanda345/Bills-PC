// eslint-disable-next-line no-unused-vars
const DiscordBot = require("../../DiscordBot");
// eslint-disable-next-line no-unused-vars
const { Message } = require("discord.js");


module.exports = class
{
	/**
	 * 
	 * @param {DiscordBot} client 
	 */
	constructor(client)
	{
		this.client = client;
	}
	/**
	 * 
	 * @param {Message} message 
	 */
	async invoke(message)
	{
		if(message.author.bot) return;

		if(message.guild && !message.channel.permissionsFor(message.guild.me).missing("SEND_MESSAGES")) return;
		let settings;
		if(message.channel.type === "dm") settings = this.client.settings.get("default");
		else settings = this.client.getSettings(message.guild.id);
		message.settings = settings;

		const prefixMention = new RegExp(`<@!?${this.client.user.id}> ?$`);
		if(message.content.match(prefixMention)) return message.channel.send(`My Prefix for this server is ${settings.prefix}`);

		if(message.content.indexOf(settings.prefix) !== 0) return;

		const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();
		if(message.guild && !message.member) await message.guild.members.fetch(message.author);

		const cmd = this.client.commands.get(command) || this.client.commands.find(_cmd => _cmd.props.aliases && _cmd.props.aliases.includes(command));
		if(!cmd) return;
		if(!message.guild && cmd.props.guildOnly) return message.channel.send("This command only be use in a server.");

		try 
		{
			cmd.invoke(message, args);
		}
		catch(error)
		{
			console.error(error);
		}

	}
};