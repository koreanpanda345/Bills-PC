/* eslint-disable no-unused-vars */
const DiscordBot = require("../DiscordBot");
const { readdirSync } = require("fs");
module.exports = class CommandHandler
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
	 * @param {String} dir 
	 */
	loadCommands(dir)
	{
		const commands = readdirSync(`./src/commands/${dir}`).filter(d => d.endsWith(".js"));
		for(let file of commands)
		{
			let _cmd = require(`../commands/${dir}/${file}`);
			let cmd = new _cmd(this.client);
			this.client.commands.set(cmd.props.name, cmd);
			this.client.logger.log(`${cmd.props.name} was loaded`, "cmd");
		}
	}
};