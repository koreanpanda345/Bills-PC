/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-unused-vars */
const CommandBase = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const {Sets} = require("@pkmn/sets");
const { Field } = require("@smogon/calc");
const { Generations } = require("@pkmn/data");
const { Dex } = require("@pkmn/dex");
const { Pokemon } = require("@smogon/calc/dist/pokemon");
const { Move } = require("@smogon/calc/dist/move");
const { calculate } = require("@smogon/calc/dist/calc");
module.exports = class DamageCalcCommand extends CommandBase
{
	constructor(client)
	{
		super(client, {
			name: "damagecalc",
			aliases: [ "calc", "damage" ],
			description: "Will calc all four moves fo the first pokemon you pass in.",
			category: "Tools",
			usage: "damagecalc Krookodile @ Choice Scarf\nAbility: Moxie\nEVs: 252 Atk / 4 SpD / 252 Spe\nJolly Nature\n- Earthquake\n- Knock Off\n- Stone Edge\n- Superpower" + 
			", Gengar @ Life Orb\nAbility: Cursed Body\nEVs: 252 SpA / 4 SpD / 252 Spe\nTimid Nature\nIVs: 0 Atk\n- Shadow Ball\n- Sludge Wave\n- Focus Blast\n- Icy Wind",
			guildOnly: false,
			enabled: true
		});
	}
	/**
	 * 
	 * @param {Message} message 
	 * @param {String[]} args 
	 */
	async invoke(message, args)
	{
		let str = args.join(" ");
    	let arglist = str.split(",");
		let count = arglist.length;
		for(let i = 0; i < count; i++)
		{
			if(arglist[i].startsWith(" "))
			{
				let _str = arglist[i].replace(" ", "");
				arglist[i] = _str;
			}
		}
		message.channel.send("Calcing, please wait  <a:typing:393848431413559296>").then((msg) => 
		{
			setTimeout(() => 
			{
				let pkm1 = arglist[0];
				let pkm2 = arglist[1];
				let set1 = Sets.importSet(pkm1);
				let set2 = Sets.importSet(pkm2);
				let other = "";
				if(arglist[2])
					other = arglist[2].toLowerCase();
				let field = new Field({
					defenderSide:{
						isSR: ((other.includes("sr") || other.includes("stealth rocks") || other.includes("rocks")) ? true : false),
						spikes: (other.includes("spikes") ? other.includes("3 spikes") ? other.includes("2 spikes") ? other.includes("1 spikes") ? 1 : 2 : 3: 0: 0),
						isSeeded: (other.includes("seeds") || other.includes("leech seeds")) ? true : false,
						isLightScreen: (other.includes("light screen") || other.includes("screen")) ? true : false,
						isReflect: (other.includes("reflect")) ? true : false,
						isAuroraVeil: (other.includes("aurora veil") || other.includes("veil")) ? true : false,
					}
				});
				// console.log(other);
				// console.log(field);
				// console.log(set1);
				// console.log(set2);
				let gen1 = new Generations(Dex).get(8).species.get(set1.species) === undefined ? new Generations(Dex).get(7) : new Generations(Dex).get(8);
				let gen2 = new Generations(Dex).get(8).species.get(set2.species) === undefined ? new Generations(Dex).get(7) : new Generations(Dex).get(8);
				let attacker = new Pokemon(gen1, set1.species, {
					item: set1.item,
					nature: set1.nature,
					ability: set1.ability
				});
				if(set1.evs)
					attacker.evs = set1.evs;
				if(set1.ivs)
					attacker.ivs = set1.ivs;
				let defender = new Pokemon(gen2, set2.species, {
					item: set2.item,
					nature: set2.nature,
					ability: set2.ability
				});
				if(set2.evs)
					defender.evs = set2.evs;
				if(set2.ivs)
					defender.ivs = set2.ivs;
				let desc = "";
				for(let i = 0; i < set1.moves.length; i++)
				{
					let move = new Move(gen1, set1.moves[i]);
					const result = calculate(new Generations(Dex).get(8), attacker, defender, move, field);
					//console.log(result);
					let percent1 = Math.floor(Math.round(result.damage[0] / result.defender.originalCurHP * 100));
					let percent2 = Math.floor(Math.round(result.damage[result.damage.length - 1] / result.defender.originalCurHP * 100));
					let _result = "";
					if(result.damage !== 0)
					{
						_result += `${result.rawDesc.attackBoost !== (undefined || 0) ? `${result.rawDesc.attackBoost}+ `: ""}${result.rawDesc.attackEVs} ${result.rawDesc.attackerName} ${result.rawDesc.moveName} (${result.move.bp} bp)`;
						_result += " vs.";
						_result += ` ${result.rawDesc.HPEVs} / ${result.rawDesc.defenseEVs} ${result.rawDesc.defenderName}`;
						_result += `:\n${result.damage[0]} - ${result.damage[result.damage.length - 1]} (${percent1}% - ${percent2}%)`;
						let ko = Math.floor(100 / percent1);
						_result += ` -- ${
							ko >= 1 && 2 >= ko ?
								ko >= 2 && 3 >= ko ?
									ko >= 3 && 4 >= ko ?
										ko >= 4 && 5 >= ko ?
											ko >= 5 && 6 >= ko ?
												ko >= 6 && 7 >= ko ?
													ko >= 7 && 8 >= ko ?
														ko >= 8 && 9 >= ko ?
															ko >= 9 ?
																"Possibly the worst move ever" :
																"Possibly 9HKO" :
															"Possibly 8HKO" :
														"Possibly 7HKO" :
													"Possibly 6HKO" :
												"Possibly 5HKO" :
											"guaranteed 4HKO" :
										"guaranteed 3HKO" :
									"guaranteed 2HKO" :
								"guaranteed OHKO"}`;
					}
					else
					{
						_result += `${result.rawDesc.attackerName} ${result.rawDesc.moveName} vs. ${result.rawDesc.defenderName}: Does nothing. (0%)`;
					}
					desc += `${_result}\n`;
				}
				msg.delete();
				let embed = new MessageEmbed();
				embed.setTitle("Damage Calcs");
				embed.setDescription(`**${desc}**`);
				embed.setColor("RANDOM");
            
				embed.addField("Attacking Pokemon", pkm1, true);

				if(arglist[2])
					embed.addField("Field", `
                ${
	(field.defenderSide.isSR ? "Steatlh Rocks\n" : "")
}${
	!field.defenderSide.spikes === (0 || undefined) ? `Spikes: ${field.defenderSide.spikes}\n` : ""
}${
	field.defenderSide.isReflect ? "Reflect\n" : ""
}${
	field.defenderSide.isLightScreen ? "Light Screen\n" : ""
}${
	field.defenderSide.isSeeded ? "Leech Seeds\n" : ""
}${
	field.defenderSide.isAuroraVeil ? "Aurora Veil" : ""
}
                `, true);
				embed.addField("Defending Pokemon", pkm2, true);
    
				message.channel.send(embed);
			}, 3000);
            
		});
	}
};