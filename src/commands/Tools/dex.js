/* eslint-disable no-unused-vars */
const CommandBase = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const PokemonShowdown = require("../../util/PokemonShowdown");
const typeColor = require("../../util/TypeColors");
const options = [ "item", "ability", "move" ];
module.exports = class DexCommand extends CommandBase
{
	constructor(client)
	{
		super(client, {
			name: "dex",
			aliases: [ "pokedex" ],
			description: "Displays info about either a ability, move, item, or pokemon.",
			category: "Tools",
			usage: "dex (ability/move/item/pokemon name) (ability name/move name/item name)\nExample: b!dex ability scrappy\nb!dex move high jump kick\nb!dex item lopunnite\nb!dex mega lopunny",
			guildOnly: false,
			enabled: true
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
		const ps = new PokemonShowdown();
		if (args[0] === "item") 
		{
			let _search = args.join(" ").slice(args[0].length + 1);
			let search = _search.toLowerCase().replace(/ +/g, "");
			let item = await await ps.itemDex(search);
			let embed = new MessageEmbed();
			embed.setColor("RANDOM");
			embed.setTitle(`Info on ${item.name}`);
			embed.setDescription(`Description: ${item.desc}`);
			if (item.megaStone)
				embed.addField("Mega Evolves:", `${item.megaEvolves}`);
			if (item.fling)
				embed.addField("Fling Power:", `${item.fling.basePower}`);
			message.channel.send(embed);
		}
		else if (args[0] === "ability") 
		{
			let _search = args.join(" ").slice(args[0].length + 1);
			let search = _search.toLowerCase().replace(/ +/g, "");
			let ability = await ps.abilityDex(search);
			let embed = new MessageEmbed();
			embed.setTitle(`Info on ${ability.name}`);
			embed.setDescription(
				`Description: ${ability.desc}\n\nShort Description: ${ability.shortDesc}`
			);
			embed.setColor("RANDOM");
			embed.addField("Rating", `${ability.rating}`);
			message.channel.send(embed);
		}
		else if (args[0] === "move") 
		{
			let _search = args.join(" ").slice(args[0].length + 1);
			let search = _search.toLowerCase().replace(/ +/g, "");
			let move = await ps.moveDex(search);
			let embed = new MessageEmbed();
			embed.setColor(
				typeColor[move.type][this.random(typeColor[move.type].length)]
			);
			embed.setTitle(`Info on ${move.name}`);
			embed.setDescription(
				`Description: ${move.desc}\n\nShort Description: ${move.shortDesc}`
			);
			embed.addField(
				"Accuracy: ",
				`${move.accuracy === true ? "---" : move.accuracy}`,
				true
			);
			embed.addField(
				`${move.category} | Base Power: `,
				`${move.basePower === 0 ? "---" : move.basePower}`,
				true
			);
			embed.addField("PP:", `${move.pp} PP`, true);
			embed.addField("Priority", `${move.priority}`, true);
			embed.addField("Type", `${move.type}`, true);
			embed.addField(
				"Target",
				`${
					move.target === "normal" ? "Adjacent Pokemon" : move.target
				}`,
				true
			);
			message.channel.send(embed);
		}
		if (!options.includes(args[0])) 
		{
			let search = args.join(" ").toLowerCase();
			if (search.toLowerCase().includes("mega ")) 
			{
				let temp = search.replace("mega ", "");
				search = temp + "mega";
			}
			if (search.toLowerCase().includes("alola" || "alolan")) 
			{
				let temp = search.replace("alola", "");
				temp = temp.replace("alolan", "");
				search = temp + "alola";
			}
			let poke = await ps.pokemonDex(search);
			let abilities;
			let ab = Object.values(poke.abilities);
			console.log(ab);
			for (let i = 0; i < ab.length; i++) 
			{
				abilities += `${ab[i]}\n`;
			}
			let embed = new MessageEmbed();
			embed.setTitle(`Info On ${poke.name}`);
			embed.setColor(
				typeColor[poke.types[0]][
					this.random(typeColor[poke.types[0]].length)]
			);
			embed.setDescription(`
				Tier: ${
	poke.tier === undefined ? "Illegal" : poke.tier
} | Types: ${
	poke.types.length === 2
		? `${poke.types[0]} ${poke.types[1]}`
		: `${poke.types[0]}`
}
				\nAbilities: \n${abilities.replace(
		"undefined",
		""
	)}\n[Can find more about ${
	poke.name
}](https://www.smogon.com/dex/ss/pokemon/${search})`);
			embed.addField(
				"Base Stats",
				`**__HP__: ${poke.baseStats.hp}
				__ATK__: ${poke.baseStats.atk}
				__DEF__: ${poke.baseStats.def}
				__SPA__: ${poke.baseStats.spa}
				__SPD__: ${poke.baseStats.spd}
				__SPE__: ${poke.baseStats.spe}**`,
				true
			);
			embed.addField(
				`Height: ${poke.heightm}m\nWeight: ${poke.weightkg}kg\nColor: ${poke.color}`,
				"\u200b",
				true
			);
			embed.addField("\u200b", "\u200b");
			if (poke.prevo)
				embed.addField("Evolves From", poke.prevo, true);
			if (poke.evo) embed.addField("Evolves Into", poke.evo[0], true);
			let sprite = await ps.pokemonSprites(poke.name);
			embed.setImage(sprite);
			if (poke.otherFormes)
				embed.addField(
					"Other Forms",
					poke.otherFormes.toString().replace(/,+/g, ", "),
					true
				);
			message.channel.send(embed);
		}
	}
};