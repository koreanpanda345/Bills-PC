/* eslint-disable no-unused-vars */
const Command = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const Airtable = require("../../Airtable/Database");
module.exports = class DelTeamCommand extends Command 
{
	constructor(client) 
	{
		super(client, {
			name: "delteam",
			aliases: [ "dt" ],
			description: "Deletes a team from your PC",
			category: "Team",
			usage: "delteam 1",
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
		let embed = new MessageEmbed();
		const db = new Airtable({userId: message.author.id});
		let data = await db.team.deleteTeam(args[0]);
		if(!data.success)
		{
			embed.setColor("red");
			embed.setTitle("Error");
			embed.setDescription(data.reason);
			return message.channel.send(embed).then((msg) => 
			{
				msg.delete({timeout: 10000});
			});
		}
		embed.setColor("RANDOM");
		embed.setTitle("Deleted a Team");
		embed.setDescription(`Deleted ${data.old_name} from the pc.`);
    
		message.channel.send(embed).then((msg) => 
		{
			msg.delete({timeout: 10000});
		});
	}
};