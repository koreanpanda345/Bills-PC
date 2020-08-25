/* eslint-disable no-unused-vars */
const CommandBase = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const PokemonShowdown = require("../../util/PokemonShowdown");
const Airtable = require("../../Airtable/Database");
const {checkIfPokemonHasHazardRemovalMoves, checkIfPokemonHasPivotMoves, checkIfPokemonhasHazardMoves, checkIfPokemonHasClericMoves} = require("../../util/DraftFunction");

module.exports = class EditDraftCommand extends CommandBase
{
	constructor(client)
	{
		super(client, {
			name: "editdraft",
			category: "Draft",
			aliases: [ "ed" ],
			description: "Allows you to edit your draft plan.",
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
		let ps = new PokemonShowdown();
		let db = new Airtable({userId: message.author.id});
		let num = Number(args[0]);
		let getData = await db.draft.getDraft(num);  
		let embed = new MessageEmbed();
		embed.setColor("RANDOM");
		embed.setTitle(getData.draft.name);
		embed.setDescription(getData.draft.type + "Please enter the slot number and the pokemon in this format `number, pokemon`.\nexample: `3, lopunny`");
		for (let i = 0; i < getData.draft.plan.split("<>").length; i++) 
		{
			let field = getData.draft.plan.split("<>");
			let name = field[i].split("</>")[0];
			let value = field[i].split("</>")[1];
			if (name !== "")
				embed.addField(name, !value ? "\u200b" : value, false);
		}
  
		message.channel.send(embed).then((msg) => 
		{
			let startmsg;
			
			let filter = (m) => m.author.id === message.author.id;
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
					_pick = _pick.replace(/ +/g, "");
					let search = _pick.toLowerCase();
					if (search.includes("mega ")) 
					{
						let temp = search.replace("mega ", "");
						search = temp + "mega";
					}
					if(search.toLowerCase().includes("alola" || "alolan")) 
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
							${abilities.replace("undefined", "")}\nBase Speed: ${poke.baseStats.spe}\n${
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
					msg.edit(embed);
					
				}
				else if (m.content.toLowerCase() === "cancel") 
				{
					pick.stop();
					msg.delete();
					message.delete();
					message.channel
						.send("Canceled The Editting process.")
						.then((txt) => txt.delete({ timeout: 10000 }));
				}
				else if (m.content.toLowerCase() === "save") 
				{
					pick.stop();
					let draft = {
						slots: embed.fields,
						userId: message.author.id,
					};
					let plan = "";
					for (let i = 0; i < draft.slots.length; i++) 
					{
						plan += `${draft.slots[i].name}</> ${draft.slots[i].value}<>`;
					}
					//console.log(plan);
					let result = await db.draft.editDraft(num, {plan: plan});
					let _embed = new MessageEmbed();
					if(!result.success)
					{
						_embed.setTitle("Error");
						_embed.setColor("red");
						_embed.setDescription(result.reason);
  
						return message.channel.send(_embed).then((txt) => 
						{
							pick.stop();
							msg.delete();
							message.delete();
							txt.delete({timeout: 10000});
						});
					}
  
					_embed.setTitle("Edited Draft.");
					_embed.setColor("RANDOM");
					_embed.setDescription(`Edited ${result.draft} in the PC.`);
  
					message.channel.send(_embed).then((txt) => 
					{
						pick.stop();
						msg.delete();
						message.delete();
						txt.delete({timeout: 10000});
					});
  
				}
			});
		});
	}
};