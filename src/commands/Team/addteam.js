/* eslint-disable no-unused-vars */
const Command = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const Airtable = require("../../Airtable/Database");
const PokePaste = require("../../util/PokePaste");

module.exports = class AddTeamCommand extends Command 
{
	constructor(client) 
	{
		super(client, {
			name: "addteam",
			category: "Team",
			description: "Allows you to add a team to the PC.",
			usage: "addTeam Best Bunny, Bun Bun (Lopunny) @ Lopunnite\nAbility: Limber\nEVs: 252 Atk / 4 SpD / 252 Spe\nJolly Nature\n- Fake Out\n- Ice Punch\n- Return\n- High Jump Kick,dm`",
			enabled: true,
			guildOnly: false,
			aliases: [ "at" ]
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
		let pokepaste = new PokePaste();
		let teamData = {};
		if(args[0].includes("https://pokepast.es")) 
		{
			let url = args[0];
			let data = await pokepaste.import(url);
			console.log(data);
			if(!data.success) return;
			teamData.teamName = data.teamName;
			teamData.teamPaste = data.teamPaste;
			teamData.teamSend = args[1] || "public";
		}

		else 
		{
			let str = args.join(" ");
			let arglist = str.split(",");
			let count = arglist.length;
			for(let i =0; i < count; i++) 
			{
				if(arglist[i].startsWith(" "))
				{
					let _str = arglist[i].replace(" ", "");
					arglist[i] = _str;
				}
			}
			if(!arglist && arglist.length < 2)
				return message.channel.send("Please try again, but provide the command with your team name, and your team in text form with ',' between the team name and your team.example: `b!addTeam Best Bunny, Bun Bun (Lopunny) @ Lopunnite\nAbility: Limber\nEVs: 252 Atk / 4 SpD / 252 Spe\nJolly Nature\n- Fake Out\n- Ice Punch\n- Return\n- High Jump Kick`");
			teamData.teamName = arglist[0];
			teamData.teamPaste = arglist[1];
			teamData.teamSend = arglist[2] || "public";
		}
		let result = await db.team.addTeam(teamData);
		if(!result) return message.channel.send("Something happened");
		let embed = new MessageEmbed()
			.setTitle(`Added ${teamData.teamName} to the PC.`)
			.setColor("RANDOM");
      
		message.channel.send(embed).then((msg) => 
		{
			message.delete();
			msg.delete({timeout: 10000});
		});
	}
};