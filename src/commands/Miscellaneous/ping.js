/* eslint-disable no-unused-vars */
const CommandBase = require("../../base/CommandBase");
const { Message } = require("discord.js");
module.exports = class PingCommand extends CommandBase
{
	constructor(client)
	{
		super(client, {
			name: "ping",
			aliases: [ "latency" ],
			description: "Displays the bot's ping.",
			category: "Miscellaneous",
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
		message.channel.send(`Pong! ping is ${this.client.ws.ping} ms!`);
	}
};