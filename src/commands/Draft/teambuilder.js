/* eslint-disable no-unused-vars */
const CommandBase = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const Airtable = require("../../Airtable/Database");
const { getInfoForTeam } = require("../../util/Teambuilder");
module.exports = class TeambuilderCommand extends CommandBase
{
	constructor(client)
	{
		super(client, {
			name: "teambuilder",
			description: "Creates a teambuilding enviroment for you to use to teambuild for a draft match.",
			category: "Draft",
			usage: "teambuilder <draft id>",
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
		let page = 0;
		const db = new Airtable({userId: message.author.id});
		let select = args[0];
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setTitle("Teambuilder")
			.setDescription(
				"Please list the pokemon that you will be facing. The format looks like this `pokemon\npokemon\npokemon` example `lopunny\ncinccino\nchansey`"
			);
		let draft = await db.draft.getDraft(select);
		if(!draft.success)
		{
			embed.setColor("RED").setTitle("Error").setDescription(draft.reason);
			return message.channel.send(embed);
		}
		let users = [];
		for (let i = 0; i < draft.draft.plan.split("<>").length; i++) 
		{
			let field = draft.draft.plan.split("<>");
			let name = field[i].split("</>")[0];
			let value = field[i].split("</>")[1];
			if (value !== undefined)
				users.push(
					value
						.split("Type")[0]
						.toLowerCase()
						.replace(/ +/g, "")
						.replace(/\n+/g, "")
						.toProperCase()
				);
		}

		message.channel.send(embed).then(async(msg) =>
		{
			let filter = (m) => m.author.id == message.author.id;
			let pokes = message.channel.createMessageCollector(filter, {
				time: 86400000,
				max: 1,
			});

			pokes.on("collect", async(collected) => 
			{
				let pokemon = collected.content.toProperCase().split(/\n+/g);
				let opp = await getInfoForTeam(pokemon);
				let usr = await getInfoForTeam(users);
				embed = await this.makeTeamPreview(embed, usr, opp, users, pokemon);
				msg.edit(embed).then(async (msg) => 
				{
					msg.react("ℹ️").then((r) => 
					{
						msg.react("🔢").then((r) => 
						{
							msg.react("🔡").then((r) => 
							{
								msg.react("❌");
								let previewFilter = (reaction, user) =>
									reaction.emoji.name === "ℹ️" && user.id === message.author.id;
								let typechartFilter = (reaction, user) =>
									reaction.emoji.name === "🔢" && user.id === message.author.id;
								let oppTypechartFilter = (reaction, user) =>
									reaction.emoji.name === "🔡" && user.id === message.author.id;
								let cancelFilter = (reaction, user) =>
									reaction.emoji.name === "❌" && user.id === message.author.id;
								let preview = msg.createReactionCollector(previewFilter, {
									time: 864000,
								});
								let typechart = msg.createReactionCollector(typechartFilter, {
									time: 864000,
								});
								let oppTypechart = msg.createReactionCollector(
									oppTypechartFilter,
									{ time: 864000 }
								);
								let cancel = msg.createReactionCollector(cancelFilter, {
									time: 864000,
								});
								cancel.on("collect", () => 
								{
									cancel.stop();
									preview.stop();
									typechart.stop();
									oppTypechart.stop();
								});
		
								preview.on("collect", async () => 
								{
									if (page === 0) return;
									page = 0;
									embed = await this.makeTeamPreview( embed, usr, opp, users, pokemon);
									msg.edit(embed);
								});
								typechart.on("collect", async () => 
								{
									if (page === 1) return;
									page = 1;
									embed.description = "Your Type chart.";
									embed = await this.makeTypeChart(usr.typeChart, embed);
									msg.edit(embed);
								});
								oppTypechart.on("collect", async () => 
								{
									if (page === 2) return;
									page = 2;
									embed.description = "Oppenent's Type chart.";
									embed = await this.makeTypeChart(opp.typeChart, embed);
									msg.edit(embed);
								});
								cancel.on("end", () =>
								{
									msg.delete();
								});
							});
						});
					});
				});
			});
		});
	}

	async makeTypeChart(chart, embed)
	{
		embed.fields = [];
		let _types = [
			"Bug",
			"Dark",
			"Dragon",
			"Electric",
			"Fairy",
			"Fighting",
			"Fire",
			"Flying",
			"Ghost",
			"Grass",
			"Ground",
			"Ice",
			"Normal",
			"Poison",
			"Psychic",
			"Rock",
			"Steel",
			"Water",
		];
		_types.forEach((x) => 
		{
			embed.addField(
				x,
				`Immune: ${chart.immune[x]}\nResist: ${chart.resist[x]}\nNetrual: ${
					chart.netural[x]
				}\n${
					chart.weak[x] >= 3
						? `__**Weak: ${chart.weak[x]}**__`
						: `Weak: ${chart.weak[x]}`
				}`,
				true
			);
		});
		return embed;
	}

	async makeTeamPreview(embed, usr, opp, users, pokemon)
	{
		let userPreview = "";
		let userTypes = "";
		let oppTypes = "";
		let userSpeed = "";
		let oppSpeed = "";
		let userNotable = "";
		let oppNotable = "";
		let oppPreview = "";

		for (let i = 0; i < users.length; i++) 
		{
			userPreview += `${users[i].charAt(0).toUpperCase() + users[i].slice(1)}\n`;
		}
		for (let i = 0; i < opp.types.length; i++) 
		{
			oppPreview += `${
				pokemon[i].charAt(0).toUpperCase() + pokemon[i].slice(1)
			}\n`;
		}
		for (let i = 0; i < users.length; i++) 
		{
			userTypes += `${usr.types[i].replace("||", " ")}\n`;
		}
		for (let i = 0; i < opp.types.length; i++) 
		{
			oppTypes += `${opp.types[i].replace("||", " ")}\n`;
		}
		for (let i = 0; i < users.length; i++) 
		{
			userSpeed += `${usr.speedTiers[i].speed}\n`;
		}
		for (let i = 0; i < opp.types.length; i++) 
		{
			oppSpeed += `${opp.speedTiers[i].speed}\n`;
		}
		userNotable += "__Clerics__\n";
		for (let i = 0; i < usr.clericPokemon.length; i++) 
		{
			userNotable += `${usr.clericPokemon[i].pokemon} | ${usr.clericPokemon[
				i
			].moves.join(", ")}\n`;
		}
		userNotable += "__Pivots__\n";
		for (let i = 0; i < usr.pivotPokemon.length; i++) 
		{
			userNotable += `${usr.pivotPokemon[i].pokemon} | ${usr.pivotPokemon[
				i
			].moves.join(", ")}\n`;
		}
		userNotable += "__Hazards__\n";
		for (let i = 0; i < usr.hazardPokemon.length; i++) 
		{
			userNotable += `${usr.hazardPokemon[i].pokemon} | ${usr.hazardPokemon[
				i
			].moves.join(", ")}\n`;
		}

		userNotable += "__Hazard Removal__\n";
		for (let i = 0; i < usr.hazardRemovalPokemon.length; i++) 
		{
			userNotable += `${
				usr.hazardRemovalPokemon[i].pokemon
			} | ${usr.hazardRemovalPokemon[i].moves.join(", ")}\n`;
		}

		oppNotable += "__Clerics__\n";
		for (let i = 0; i < opp.clericPokemon.length; i++) 
		{
			oppNotable += `${opp.clericPokemon[i].pokemon} | ${opp.clericPokemon[
				i
			].moves.join(", ")}\n`;
		}
		oppNotable += "__Pivots__\n";
		for (let i = 0; i < opp.pivotPokemon.length; i++) 
		{
			oppNotable += `${opp.pivotPokemon[i].pokemon} | ${opp.pivotPokemon[
				i
			].moves.join(", ")}\n`;
		}
		oppNotable += "__Hazards__\n";
		for (let i = 0; i < opp.hazardPokemon.length; i++) 
		{
			oppNotable += `${opp.hazardPokemon[i].pokemon} | ${opp.hazardPokemon[
				i
			].moves.join(", ")}\n`;
		}

		oppNotable += "__Hazard Removal__\n";
		for (let i = 0; i < opp.hazardRemovalPokemon.length; i++) 
		{
			oppNotable += `${
				opp.hazardRemovalPokemon[i].pokemon
			} | ${opp.hazardRemovalPokemon[i].moves.join(", ")}\n`;
		}
		embed.description = "Draft Previews";
		embed.fields = [
			{ name: "Your Draft:", value: userPreview, inline: true },
			{ name: "Types", value: userTypes, inline: true },
			{ name: "Speed", value: userSpeed, inline: true },
			{ name: "Notable Moves", value: userNotable, inline: true },
			{ name: "\u200b", value: "\u200b", inline: false },
			{ name: "Opponent's Draft", value: oppPreview, inline: true },
			{ name: "Types", value: oppTypes, inline: true },
			{ name: "Speed", value: oppSpeed, inline: true },
			{ name: "Notable Moves", value: oppNotable, inline: true },
		];
		return embed;
	}
};