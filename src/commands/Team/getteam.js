/* eslint-disable no-unused-vars */
const Command = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const Airtable = require("../../Airtable/Database");
module.exports = class GetTeamCommand extends Command 
{
	constructor(client) 
	{
		super(client, {
			name: "getteam",
			category: "Team",
			enabled: true,
			description: "Gets a team with the team's id.",
			usage: "getteam <team id>",
			aliases: [ "gt" ],
		});
	}
	/**
   *
   * @param {Message} message
   * @param {String[]} args
   */
	async invoke(message, args) 
	{
		if (!args[0])
			return message.channel.send(
				"Sorry, but I need to know what team you would like."
			);
		let embed = new MessageEmbed();
		let db = new Airtable({ userId: message.author.id });
		let team = await db.team.getTeam(args[0]);
		if (!team.success) 
		{
			embed.setTitle("Error").setColor("RED").setDescription(team.reason);
			return message.channel.send(embed).then((msg) => 
			{
				msg.delete({ timeout: 10000 });
			});
		}

		embed.setColor("RANDOM");
		embed.setTitle(`${team.team.name}`);
		embed.setDescription(`${team.team.paste}`);
		if (team.team.send === "dm")
			message.author.send(embed).then((msg) => 
			{
				msg.react("⏏️").then((r) => 
				{
					const importFilter = (reaction, user) =>
						reaction.emoji.name === "⏏️" && user.id === message.author.id;
					const _import = msg.createReactionCollector(importFilter, {
						time: 600000,
					});

					msg.delete({ timeout: 60000 });
					_import.on("collect", (r) => 
					{
						let str = `***${team.team.name}***\n\`\`\`${team.team.paste}\`\`\``;
						msg.delete();
						message.author.send(str).then((msg) => 
						{
							msg.delete({ timeout: 60000 });
						});
					});
				});
			});
		if (team.team.send === "public")
			message.channel.send(embed).then((msg) => 
			{
				msg.react("⏏️").then((r) => 
				{
					msg.react("❎");
					msg.delete({ timeout: 60000 });
					const importFilter = (reaction, user) =>
						reaction.emoji.name === "⏏️" && user.id === message.author.id;
					const _import = msg.createReactionCollector(importFilter, {
						time: 600000,
					});
					const closeFilter = (reaction, user) =>
						reaction.emoji.name === "❎" && user.id === message.author.id;
					const _close = msg.createReactionCollector(closeFilter, {
						time: 600000,
					});

					_import.on("collect", (r) => 
					{
						let str = `***${team.team.name}***\n\`\`\`${team.team.paste}\`\`\``;
						msg.delete();
						message.channel.send(str).then((msg) => 
						{
							msg.delete({ timeout: 60000 });
						});
					});
					_close.on("collect", (r) => 
					{
						msg.delete();
					});
				});
			});
	}
};
