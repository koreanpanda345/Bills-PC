/* eslint-disable no-unused-vars */
const Command = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const Airtable = require("../../Airtable/Database");
const PokePaste = require("../../util/PokePaste");
module.exports = class EditTeamCommand extends Command 
{
	constructor(client) 
	{
		super(client, {
			name: "editteam",
			aliases: [ "et" ],
			description: "Allows you to update a team that is in the pc.",
			category: "Team",
			usage: "editTeam 1, Bun Bun (Lopunny) @ Lopunnite\nAbility: Limber\nEVs: 252 Atk / 4 SpD / 252 Spe\nJolly Nature\n- Fake Out\n- Ice Punch\n- Return\n- High Jump Kick`",
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
		const db = new Airtable({userId: message.author.id});
		let embed = new MessageEmbed();
		let str = args.join(" ");
		let _arglist = str.split(",");
		let count = _arglist.length;
		for(let i = 0; i < count; i++)
		{
			if(_arglist[i].startsWith(" "))
			{
				let _str = _arglist[i].replace(" ", "");
				_arglist[i] = _str;
			}
		}
		if(_arglist[1].includes("https://pokepast.es"))
		{
			let data = await new PokePaste().import(_arglist[1]);
			if(!data.success) return;
			_arglist[1] = data.team_paste;
		}
		console.log(_arglist);
		if (!_arglist)
			return message.channel.send(
				"Please try again, but provide the command with your team's id, and your team in text form with ',' between the team name and your team.example: `b!editTeam 1, Bun Bun (Lopunny) @ Lopunnite\nAbility: Limber\nEVs: 252 Atk / 4 SpD / 252 Spe\nJolly Nature\n- Fake Out\n- Ice Punch\n- Return\n- High Jump Kick`"
			);
		let data = await db.team.editTeam(_arglist[0], {teamPaste: _arglist[1]});
		if(!data.success)
		{
			embed.setColor("red");
			embed.setTitle("Error");
			embed.setDescription(data.reason);
			return message.channel.send(embed).then((msg) => 
			{
				message.delete();
				msg.delete({timeout: 10000});
			});
		}
		embed.setColor("RANDOM");
		embed.setTitle("Edited a Team");
		embed.setDescription(`Edited ${data.team_name}`);
      
		message.channel.send(embed).then((msg) => 
		{
			message.delete();
			msg.delete({timeout: 10000});
		});
	}
};