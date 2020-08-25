/* eslint-disable no-unused-vars */
const Command = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const Airtable = require("../../Airtable/Database");

module.exports = class TeamCommand extends Command 
{
	constructor(client) 
	{
		super(client, {
			name: "team",
			category: "Team",
			description: "Displays all of your teams.",
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
		let check = await db.team.checkIfUserHasTeams();
		if(!check) return message.channel.send("Sorry, but you do not have any teams yet.");
		let teams = await db.team.getUserTeams();
		let data = await db.team.convertTeamsIntoArray(teams);
    
		let str = "";
		for (let i = 0; i < data.names.length; i++) 
		{
			str += `__**${i + 1}**__ - ${data.names[i]}\n`;
		}
		let teamEmbed = new MessageEmbed();
		teamEmbed.setColor("RANDOM");
		teamEmbed.setTitle(`${message.author.username}'s Teams`);
		teamEmbed.setDescription(str);
		message.channel.send(teamEmbed);
	}
};