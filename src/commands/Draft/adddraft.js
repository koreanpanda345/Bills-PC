const CommandBase = require("../../base/CommandBase");
const {checkIfPokemonHasHazardRemovalMoves, checkIfPokemonHasPivotMoves, checkIfPokemonhasHazardMoves, checkIfPokemonHasClericMoves} = require("../../util/DraftFunction");
const PokemonShowdown = require("../../util/PokemonShowdown");
const ps = new PokemonShowdown();
const Airtable = require("../../Airtable/Database");
// eslint-disable-next-line no-unused-vars
const {MessageEmbed, Message} = require("discord.js"); 
module.exports = class AddDraftCommand extends CommandBase
{
	constructor(client)
	{
		super(client, {
			name: "adddraft",
			aliases: [ "ad" ],
			description: "Adds a new Draft Plan to the PC.",
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
	// eslint-disable-next-line no-unused-vars
	async invoke(message, args)
	{
		let db = new Airtable({ userId: message.author.id });
		let embed = new MessageEmbed();
		embed.setColor("RANDOM");
		embed.setTitle("Untitled");
		embed.setDescription(
			"Please Type in what you would like your draft plan's name to be."
		);
		message.channel.send(embed).then(async (msg) => 
		{
			// filter is a global variable for this command.
			var filter = (m) => m.author.id === message.author.id;
			// Creates a MessageCollector that will be used to await Messages.
			let name = message.channel.createMessageCollector(filter,{
				time: 86400000,
				max: 1,
			});
			// Collect event.
			name.on("collect", (m) => 
			{
				console.log(m.content);
				let _name = m.content;
				embed.setTitle(`${_name}`);
				let _draft;
				//tier 1, tier 2, tier 3, tier 3, tier 4, tier 5, mega, free, free, free, free\
				_draft = "tier";
				embed.setDescription(
					`Tier Draft
                  Please enter the tier system that you will be using.
                  - iGL
  
                  if you don't see a prebuilt tier system that your league uses, please put in \`custom (<tiers>)\`
                  example: \`custom (tier 1, tier 2, tier 3, tier 3, tier 4, tier 5, mega, free, free, free, free)\` including the \`,\``
				);
				msg.edit(embed);
				let tiers = message.channel.createMessageCollector(filter,{
					time: 86400000,
					max: 1,
				});
				tiers.on("collect", async (m) => 
				{
					let _tiers;
					if (m.content.toLowerCase().startsWith("igl")) 
					{
						_tiers = [
							"Tier 1",
							"Tier 2",
							"Tier 3",
							"Tier 3",
							"Tier 4",
							"Tier 5",
							"Mega",
							"Free",
							"Free",
							"Free",
							"Free",
						];
						_draft = "IGL Draft Format";
					}
					if (m.content.startsWith("custom")) 
					{
						_draft = "Custom Tier Draft Format";
						_tiers = m.content.split(",");
						_tiers[0] = _tiers[0].split("(")[1];
						_tiers[_tiers.length - 1] = _tiers[_tiers.length - 1].split(")")[0];
					}

					embed.setDescription(
						`${_draft}\nPlease enter the slot number and the pokemon in this format \`number, pokemon\`.\nexample: \`3, lopunny\`\nTo Save just type in \`save\` and to cancel type in \`cancel\`.`
					);

					for (let i = 0; i < _tiers.length; i++) 
					{
						embed.addField(`Slot ${i + 1}: ` + _tiers[i], "\u200b", false);
					}
						
					msg.edit(embed);
					let pick = message.channel.createMessageCollector(filter, {
						time: 86400000,
					});
					pick.on("collect", async (m) => 
					{
						if (
							m.content.toLowerCase() !== "cancel" &&
                                m.content.toLowerCase() !== "save"
						) 
						{
							let _pick = m.content.split(",")[1];
							let __tier = m.content.split(",")[0];
							if (!_pick) return;
							_pick = _pick.replace(/ +/g, "");
							let search = _pick.toLowerCase();
							await this.getPokemon(search, __tier, embed);
							msg.edit(embed);
							message.channel
								.send("Added pokemon.")
								.then((__msg) => __msg.delete({ timeout: 5000 }));
						}
						if (m.content.toLowerCase() === "save") 
						{
							pick.stop();

							let draft = {
								name: embed.title,
								type: embed.description.split("Please")[0],
								slots: embed.fields,
								userId: message.author.id,
							};
							let plan = "";
							for (let i = 0; i < embed.fields.length; i++) 
							{
								plan += `${embed.fields[i].name}</> ${embed.fields[i].value}<>`;
							}
							draft.plan = plan;
							let data = await db.draft.addDraft(draft);
							if (!data.success) 
							{
								let _embed = new MessageEmbed();
								_embed.setTitle("Error");
								_embed.setColor("red");
								_embed.setDescription(data.reason);
								return message.channel.send(_embed).then((txt) => 
								{
									pick.stop();
									message.delete();
									txt.delete({ timeout: 10000 });
								});
							}
							let _embed = new MessageEmbed();

							_embed.setTitle(`Added ${draft.name} to the PC.`);
							_embed.setColor("RANDOM");
							_embed.setDescription("");

							message.channel.send(_embed).then((txt) => 
							{
								pick.stop();
								msg.delete();
								txt.delete({ timeout: 10000 });
							});
						}
						if (m.content.toLowerCase() === "cancel") 
						{
							pick.stop();
							msg.delete();
							message.channel
								.send("Cancelled")
								.then((txt) => txt.delete({ timeout: 10000 }));
						}
					});
				});
			});
		});
	}
	
	async getPokemon(name, tier, embed) 
	{
		let search = name;
		let __tier = tier;
		if (search.toLowerCase().includes("mega")) 
		{
			let temp = search.replace("mega", "");
			search = temp + "mega";
		}
		if (search.toLowerCase().includes("alola" || "alolan")) 
		{
			let temp = search.replace("alola", "");
			temp = temp.replace("alolan", "");
			search = temp + "alola";
		}
		let poke = await ps.pokemonDex(search);
		let pivot = await checkIfPokemonHasPivotMoves(poke.name.toLowerCase());
		let cleric = await checkIfPokemonHasClericMoves(poke.name.toLowerCase());
		let hazard = await checkIfPokemonhasHazardMoves(
			poke.name.toLowerCase()
		);
		let removal = await checkIfPokemonHasHazardRemovalMoves(
			poke.name.toLowerCase()
		);
		let abilities;
		let ab = Object.values(poke.abilities);
		for (let i = 0; i < ab.length; i++) 
		{
			abilities += `- ${ab[i]}\n`;
		}
		embed.fields[Number(__tier) - 1] = {
			name: embed.fields[Number(__tier) - 1].name,
			value: `${poke.name}\nType: ${
				poke.types.length === 2
					? `${poke.types[0]} || ${poke.types[1]}`
					: `${poke.types[0]}`
			}\n Abilities:
				${abilities.replace("undefined", "")}\nBase Speed: ${
	poke.baseStats.spe
}\n${
	pivot.length != 0 ? `Pivot Moves:\n${pivot.join(" ")}\n` : ""
}${
	cleric.length != 0 ? `Cleric Moves:\n${cleric.join(" ")}\n` : ""
}${
	hazard.length != 0 ? `Hazards Moves:\n${hazard.join(" ")}` : ""
}${
	removal.length != 0
		? `Hazard Removal Moves:\n${removal.join(" ")}`
		: ""
}`,
		};
	}
};