/* eslint-disable no-unused-vars */
const CommandBase = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const Airtable = require("../../Airtable/Database");
module.exports = class DraftCommand extends CommandBase
{
	constructor(client)
	{
		super(client, {
			name: "draft",
			description: "Displays all of your drafts.",
			category: "Draft",
			enabled: true,
			guildOnly: false,
		});
	}
	/**
	 * 
	 * @param {Message} message 
	 * @param {String[]} args 
	 */
	async invoke(message, args)
	{
		if(args[0])
		{
			switch(args[0])
			{
			case "add":
				args.shift();
				new(require("./adddraft")(this.client)).invoke(message, args);
				break;
			case "delete":
				args.shift();
				new(require("./deletedraft")(this.client)).invoke(message, args);
				break;
			
			}
		}

		let embed = new MessageEmbed();
		let db = new Airtable({userId: message.author.id});
		if(!await db.draft.checkIfUserHasDraft())
		{
			embed.setTitle("Error");
			embed.setColor("RED");
			embed.setDescription("Sorry, but you don't have any drafts made yet.");

			return message.channel.send(embed).then(msg =>
			{
				message.delete();
				msg.delete({time: 10000});
			});
		}

		let data = await db.draft.getUsersDrafts();
		let arr = await db.draft.convertDraftsIntoArray(data);

		embed.setTitle(`${message.author.username}'s Drafts`);
		embed.setColor("RANDOM");

		let desc = "";
		for(let i = 0; i < arr.names.length; i++)
		{
			if(arr.names[i] !== "")
				desc += `__**${i + 1}:**__ ${arr.names[i]}\n`;
		}

		embed.setDescription(desc);
		message.channel.send(embed);
	}
};