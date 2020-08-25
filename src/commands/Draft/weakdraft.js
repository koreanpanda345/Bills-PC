/* eslint-disable no-unused-vars */
const CommandBase = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const PokemonShowdown = require("../../util/PokemonShowdown");
const Airtable = require("../../Airtable/Database");
const {TypeCalculator} = require("../../util/DraftFunction");
module.exports = class WeakDraftCommand extends CommandBase
{
	constructor(client)
	{
		super(client, {
			name: "weakdraft",
			aliases: "wd",
			description: "Displays your Type chart for you draft plan.",
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
		const ps = new PokemonShowdown();
		const db = new Airtable({userId: message.author.id});
		let embed = new MessageEmbed();
		let select = args[0];
		if(isNaN(select)) return message.channel.send("Sorry, but the id that you requested is not a vaild id.");
		select = Number(select);
		let draft = await db.draft.getDraft(select);
		let types = [];
		let pokemon = [];

		if(!draft.success)
		{
			embed.setTitle("Error");
			embed.setColor("RED");
			embed.setDescription(draft.reason);
			return message.channel.send(embed);
		}

		for(let i = 0; i < draft.draft.plan.split("<>").length; i++)
		{
			let field = draft.draft.plan.split("<>");
			let name = field[i].split("</>")[0];
			let value = field[i].split("</>")[1];

			if(value !== undefined)
			{
				types.push(
					value
						.split("Type: ")[1]
						.split("Abilities:")[0]
						.toLowerCase()
						.replace(/ +/g, "")
						.replace(/\n+/g, "")
				);
				pokemon.push(
					value
						.split("Type: ")[0]
						.toLowerCase()
						.replace(/ +/g, "")
						.replace(/\n+/g, "")
				);
			}
		}
		let desc = "";
		for(let i = 0; i < pokemon.length; i++)
			desc += `${pokemon[i].toProperCase()} - Types: ${types[i].replace("||", " ").toProperCase()}\n`;
		embed.setDescription(desc);
		await TypeCalculator(types).then(async(chart) => 
		{
			embed.setTitle(`${draft.draft.name} Type Chart`);

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
					`Immune: ${chart.immune[x]}\nResist: ${chart.resist[x]}\nNetural: ${
						chart.netural[x]
					}\n${
						chart.weak[x] >= 3
							? `__**Weak: ${chart.weak[x]}**__`
							: `Weak: ${chart.weak[x]}`
					}`,
					true
				);
			});
			embed.setColor("RANDOM");
			message.channel.send(embed).then((msg) =>
			{
				msg.react("❎").then((r) =>
				{
					let filter = (reaction, user) => reaction.emoji.name === "❎" && user.id === message.author.id;
					let del = msg.createReactionCollector(filter, {time: 1000000});
					del.on("collect", () =>
					{
						del.stop();
					});
					del.on("end", () =>
					{
						msg.delete();
					});
				});
			});
		});
	}
};