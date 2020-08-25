/* eslint-disable no-unused-vars */
const CommandBase = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const Airtable = require("../../Airtable/Database");
const PokemonShowdown = require("../../util/PokemonShowdown");
const typeColor = require("../../util/TypeColors");
const {checkIfPokemonHasClericMoves, checkIfPokemonHasHazardRemovalMoves, checkIfPokemonHasPivotMoves, checkIfPokemonhasHazardMoves} = require("../../util/DraftFunction");
module.exports = class ViewDraftCommand extends CommandBase
{
	constructor(client)
	{
		super(client, {
			name: "viewdraft",
			aliases: [ "draftplan", "vd" ],
			category: "Draft",
			guildOnly: false,
			description: "Displays your draft plan."
		});
	}

	random(max) 
	{
		return Math.floor(Math.random() * max);
	} 

	/**
	 * 
	 * @param {Message} message 
	 * @param {String[]} args 
	 */
	async invoke(message, args)
	{
		let ps = new PokemonShowdown();
		let db = new Airtable({userId: message.author.id});
		let data = await db.draft.getDraft(args[0]);
		let embed = new MessageEmbed();
		if(!data.success) 
		{
			embed.setTitle("Error");
			embed.setColor("RED");
			embed.setDescription(data.reason);

			return message.channel.send(embed).then((msg) => 
			{
				msg.delete({timeout: 10000});
			});
		}

		embed.setColor("RANDOM");
		embed.setTitle(`Draft Plan: ${data.draft.name}`);
		embed.setDescription(`Draft Type: ${data.draft.type}`);
		embed.addField("\u200b", "\u200b");
		let page = 0;
		let pages = [];
		let tiers = [];
		for(let i = 0; i < data.draft.plan.split("<>").length; i++)
		{
			let field = data.draft.plan.split("<>");
		
			let name = field[i].split("</>")[0];
			let value = field[i].split("</>")[1];
			if (value !== undefined)
				pages.push(
					value
						.split("Type")[0]
						.toLowerCase()
						.replace(/ +/g, "")
						.replace(/\n+/g, "")
				);
			tiers.push(name.split(": ")[1]);
		}

		message.channel.send(embed).then((msg) => 
		{
			msg.react("◀️").then((r) => 
			{
				msg.react("❎").then((r) => 
				{
					msg.react("▶️");

					let forwardsFilter = (reaction, user) =>
						reaction.emoji.name === "▶️" && user.id === message.author.id;
					let backwardsFilter = (reaction, user) =>
						reaction.emoji.name === "◀️" && user.id === message.author.id;
					let clearFilter = (reaction, user) =>
						reaction.emoji.name === "❎" && user.id === message.author.id;
					let backwards = msg.createReactionCollector(backwardsFilter, {
						time: 100000,
					});
					let clear = msg.createReactionCollector(clearFilter, {
						time: 100000,
					});
					let forwards = msg.createReactionCollector(forwardsFilter, {
						time: 100000,
					});

					clear.on("collect", () => 
					{
						clear.stop();
						backwards.stop();
						forwards.stop();
					});

					clear.on("end", () => 
					{
						msg.delete();
					});
					backwards.on("collect", async () => 
					{
						if (page === 0) return;
						page--;
						let search = pages[page - 1].replace(/\\n+/g, "");
						if (search.toLowerCase().includes("-dusk")) 
						{
							let temp = search.replace(/-dusk+/g, "dusk");
							search = temp;
						}
						if (search.toLowerCase().includes("-mega")) 
						{
							let temp = search.replace(/-mega+/g, "mega");
							search = temp;
						}
						let poke = await ps.pokemonDex(search);
			
						if (poke === undefined) 
						{
							embed.setTitle(`${tiers[page - 1]}: ---`);
							embed.setDescription("No Pokemon.");
							embed.setColor(typeColor["???"][this.random(typeColor["???"].length)]);
							embed.setImage("");
							msg.edit(embed);
							return;
						}
						let abilities;
						let ab = Object.values(poke.abilities);
						for (let i = 0; i < ab.length; i++) 
						{
							abilities += `${ab[i]}\n`;
						}
						embed.setTitle(`${tiers[page - 1]}: ${poke.name}`);
						embed.setColor(
							typeColor[poke.types[0]][
								this.random(typeColor[poke.types[0]].length)
							]
						);
						embed.setDescription(`
								Types: ${
	poke.types.length === 2
		? `${poke.types[0]} ${poke.types[1]}`
		: `${poke.types[0]}`
}
								\nAbilities: \n${abilities.replace(
		"undefined",
		""
	)}\nBase Stats:
								**__HP__: ${poke.baseStats.hp}
								__ATK__: ${poke.baseStats.atk}
								__DEF__: ${poke.baseStats.def}
								__SPA__: ${poke.baseStats.spa}
								__SPD__: ${poke.baseStats.spd}
								__SPE__: ${poke.baseStats.spe}**`);
						let pivot = await checkIfPokemonHasPivotMoves(
							poke.name.toLowerCase()
						);
						let str = "\u200b";
						if (pivot.length !== 0)
							str += `**Pivot Moves**\n${pivot.join("\n")}`;
						let cleric = await checkIfPokemonHasClericMoves(
							poke.name.toLowerCase()
						);
						if (cleric.length !== 0)
							str += `\n\n**Cleric Moves**\n${cleric.join("\n")}`;
						let hazards = await checkIfPokemonhasHazardMoves(
							poke.name.toLowerCase()
						);
						if (hazards.length !== 0)
							str += `\n\n**Hazard Moves**\n${hazards.join("\n")}`;
						let removal = await checkIfPokemonHasHazardRemovalMoves(
							poke.name.toLowerCase()
						);
						if (removal.length !== 0)
							str += `\n\n**Hazard Removal Moves**\n${removal.join("\n")}`;
						embed.fields[0] = { name: "\u200b", value: str, inline: false };
						let sprite = await ps.pokemonSprites(poke.name.toLowerCase());
						embed.setImage(sprite);
						msg.edit(embed);
					});
			
					forwards.on("collect", async () => 
					{
						if (page === pages.length) return;
						page++;
						let search = pages[page - 1].replace(/\\n+/g, "");
						if (search.toLowerCase().includes("-dusk")) 
						{
							let temp = search.replace(/-dusk+/g, "dusk");
							search = temp;
						}
						if (search.toLowerCase().includes("-mega")) 
						{
							let temp = search.replace(/-mega+/g, "mega");
							search = temp;
						}
						let poke = await ps.pokemonDex(search);
						if (poke === undefined) 
						{
							embed.setTitle(`${tiers[page - 1]}: ---`);
							embed.setDescription("No Pokemon.");
							embed.setImage("");
							embed.setColor(typeColor["???"][this.random(typeColor["???"].length)]);
							msg.edit(embed);
						}
						let abilities;
						let ab = Object.values(poke.abilities);
						for (let i = 0; i < ab.length; i++) 
						{
							abilities += `${ab[i]}\n`;
						}
						embed.setTitle(`${tiers[page - 1]}: ${poke.name}`);
						embed.setColor(
							typeColor[poke.types[0]][
								this.random(typeColor[poke.types[0]].length)
							]
						);
						embed.setDescription(`
							  Types: ${
	poke.types.length === 2
		? `${poke.types[0]} ${poke.types[1]}`
		: `${poke.types[0]}`
}
							  \nAbilities: \n${abilities.replace(
		"undefined",
		""
	)}\nBase Stats:
							  **__HP__: ${poke.baseStats.hp}
							  __ATK__: ${poke.baseStats.atk}
							  __DEF__: ${poke.baseStats.def}
							  __SPA__: ${poke.baseStats.spa}
							  __SPD__: ${poke.baseStats.spd}
							  __SPE__: ${poke.baseStats.spe}**`);
						let pivot = await checkIfPokemonHasPivotMoves(
							poke.name.toLowerCase()
						);
						let str = "\u200b";
						if (pivot.length !== 0)
							str += `**Pivot Moves**\n${pivot.join("\n")}`;
						let cleric = await checkIfPokemonHasClericMoves(
							poke.name.toLowerCase()
						);
						if (cleric.length !== 0)
							str += `\n\n**Cleric Moves**\n${cleric.join("\n")}`;
						let hazards = await checkIfPokemonhasHazardMoves(
							poke.name.toLowerCase()
						);
						if (hazards.length !== 0)
							str += `\n\n**Hazard Moves**\n${hazards.join("\n")}`;
						let removal = await checkIfPokemonHasHazardRemovalMoves(
							poke.name.toLowerCase()
						);
						if (removal.length !== 0)
							str += `\n\n**Hazard Removal Moves**\n${removal.join("\n")}`;
						embed.fields[0] = { name: "\u200b", value: str, inline: false };
						let sprite = await ps.pokemonSprites(poke.name.toLowerCase());
						embed.setImage(sprite);
						msg.edit(embed);
					});
				});
			});
		});
	}
};