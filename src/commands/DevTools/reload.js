/* eslint-disable no-unused-vars */
const Command = require("../../base/CommandBase");
const { Message } = require("discord.js");

module.exports = class ReloadCommand extends Command 
{
	constructor(client) 
	{
		super(client, {
			name: "reload",
			category: "DevTools",
			usage: "reload <command name>",
			description: "Reloads a command",
			enabled: true,
			guildOnly: false
		});
	}
	/**
     * 
     * @param {Message} message 
     * @param {String[]} args 
     */
	async invoke(message, args) 
	{
		if(message.author.id !== "304446682081525772") return message.channel.send("Sorry, but you don't have access to use this command.");
		if(!args.length) return message.channel.send("What command did you want to reload?");
		const commandName = args[0].toLowerCase();
		const command = this.client.commands.get(commandName) || this.client.commands.find(cmd => cmd.props.aliases && cmd.props.aliases.includes(commandName));

		if(!command) return message.channel.send("That command doesn't seem to exist.");
		delete require.cache[require(`../${command.props.category}/${command.props.name}.js`)];
		try 
		{
			const _newCommand = require(`../${command.props.category}/${command.props.name}.js`);
			const newCommand = new _newCommand(this.client);
			this.client.commands.set(newCommand.props.name, newCommand);
		}
		catch(error) 
		{
			this.client.logger.error(`${error}`);
			message.channel.send(`ERROR: ${error}`);
		}

		message.channel.send(`Command \`${command.props.name}\` was reloaded!`);
	}
};