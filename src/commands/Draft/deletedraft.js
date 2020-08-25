/* eslint-disable no-unused-vars */
const CommandBase = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const Airtable = require("../../Airtable/Database");

module.exports = class DeleteDraftCommand extends CommandBase
{
	constructor(client)
	{
		super(client, {
			name: "deletedraft",
			aliases: [ "dd" ],
			description: " Deletes a draft plan from the pc.",
			category: "Draft",
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
		let db = new Airtable({userId: message.author.id});
		let embed = new MessageEmbed();
		let data = await db.draft.deleteDraft(args[0]);
		if(!data.success)
		{
			embed.setTitle("Error");
			embed.setColor("RED");
			embed.setDescription(data.reason);
  
			return message.channel.send(embed).then((msg) => 
			{
				message.delete();
				msg.delete({timeout: 10000});
			});
		}
  
		embed.setTitle("Deleted a draft.");
		embed.setColor("RANDOM");
		embed.setDescription(`I Deleted ${data.old_draft} from the PC.`);
  
		message.channel.send(embed).then((msg) => 
		{
			message.delete();
			msg.delete({timeout: 10000});
		});
	}
};