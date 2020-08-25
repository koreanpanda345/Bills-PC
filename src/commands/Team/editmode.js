/* eslint-disable no-unused-vars */
const Command = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");

module.exports = class EditModeCommand extends Command 
{
	constructor(client) 
	{
		super(client, {
			name: "editmode",
			aliases: [ "em" ],
			category: "Team",
			description: "Allows you to changes the send mode for your teams.",
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
		return message.channel.send("This command is under maintance. I am very sorry.");
	}
};