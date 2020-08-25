/* eslint-disable no-unused-vars */
const Command = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const Airtable = require("../../Airtable/Database");
const PokePaste = require("../../util/PokePaste");
module.exports = class PasteTeamCommand extends Command 
{
	constructor(client) 
	{
		super(client, {
			name: "pasteteam",
			category: "Team",
			aliases: [ "pt" ],
			description: "pastes your team to pokepaste.",
			usage: "pasteteam (team id)",
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
		let pokePaste = new PokePaste();  
		if(!args[0])
		{
			let embed = new MessageEmbed()
				.setTitle("Untitled")
				.setDescription("Please enter the name of your team paste.");
			message.channel.send(embed).then(async msg => 
			{
				let _title = "";
				let filter = (m) => m.author.id === message.author.id; 
				let title = message.channel.createMessageCollector(filter, {time: 600000, max: 1});
				title.on("collect", async (m) => 
				{
					_title = m.content;
					embed.setTitle(m.content);
					embed.setDescription("Enter your team paste.");
					msg.edit(embed);
					m.delete();
					let team = message.channel.createMessageCollector(filter, {time: 600000, max: 1});
    
					team.on("collect", async (m) => 
					{
						let data = await pokePaste.export({title: _title, paste: m.content, author: message.author.username});
						if(!data.success)
						{
							embed.setTitle("Error");
							embed.setColor("red");
							embed.setDescription(data.reason);
							return msg.edit(embed).then((_msg) => 
							{
								message.delete();
								msg.delete({timeout: 10000});
							});
						}
						embed.setTitle(`PokePaste for ${_title}`);
						embed.setURL(data.url);
						msg.edit(embed).then((_msg) => 
						{
							message.delete();
						});
					});
				});
			});
		}
		else
		{
			let embed = new MessageEmbed();
			let data = await db.team.getTeam(args[0]);
			if(!data.success)
			{
				embed.setTitle("Error");
				embed.setColor("red");
				embed.setDescription(data.reason);
				return message.channel.send(embed).then((msg) => 
				{
					message.delete();
					msg.delete({timeout: 10000});
				});
			}
			let result = await pokePaste.export({title: data.team.name, paste: data.team.paste, author: message.author.username});
			if(!result.success)
			{
				embed.setTitle("Error");
				embed.setColor("red");
				embed.setDescription(result.reason);
				return message.channel.send(embed).then((msg) => 
				{
					message.delete();
					msg.delete({timeout: 10000});
				});
			}
			embed.setTitle(`PokePaste for ${data.team.name}`);
			embed.setColor("RANDOM");
			embed.setURL(result.url);
    
			message.channel.send(embed).then((msg) => 
			{
				message.delete();
			});
		}
	}
};