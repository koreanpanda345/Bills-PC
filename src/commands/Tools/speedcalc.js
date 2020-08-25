/* eslint-disable no-unused-vars */
const CommandBase = require("../../base/CommandBase");
const { Message, MessageEmbed } = require("discord.js");
const { Generations } = require("@pkmn/data");
const { Dex } = require("@pkmn/dex");
const { Pokemon } = require("@smogon/calc/dist/pokemon");

module.exports = class SpeedCalcCommand extends CommandBase
{
	constructor(client)
	{
		super(client, {
			name: "speedcalc",
			aliases: [ "speed" ],
			category: "Tools",
			description: "Will check which one will be faster, and displays the max possible speed they can achieve. (if you want to include choice scarf, then type scarf in front of the pokemon's name.)",
			usage: "speed mega lopunny, scarf gengar\nb!speed scarf lopunny, gengar",
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
		if(count < 1) return message.channel.send("Sorry, but I need two pokemon to calc.");
		let mega1 = false;
		let mega2 = false;
		for(let i = 0; i < count; i++ )
		{  
			if(arglist[i].startsWith(" "))
			{
				let _str = arglist[i].replace(" ", "");
				arglist[i] = _str;
			}
			if(arglist[i].toLowerCase().startsWith("mega"))
			{
				let temp = arglist[i].replace("mega", "");
				arglist[i] = temp + "mega";
				if(i === 0) mega1 = true;
				else if(i === 1) mega2 = true;
			}
		}
		let name1 = arglist[0];
		let name2 = arglist[1];
		let scarf1 = false;
		let scarf2 = false;
		if(name1.toLowerCase().startsWith("scarf"))
		{
			scarf1 = true;
			name1 = name1.toLowerCase().replace("scarf ", "");
		}
		if(name2.toLowerCase().startsWith("scarf"))
		{
			scarf2 = true;
			name2 = name2.toLowerCase().replace("scarf ", "");
		}
		let gen1 = new Generations(Dex).get(8).species.get(name1) === undefined ? new Generations(Dex).get(7) : new Generations(Dex).get(8);
		let gen2 = new Generations(Dex).get(8).species.get(name2) === undefined ? new Generations(Dex).get(7) : new Generations(Dex).get(8);
		let pkm1 = new Pokemon(gen1, name1, {
			item: `${scarf1 === true ? "Choice Scarf" : undefined}`,
			evs: {spe: 252},
			nature: "Jolly"
		});
		let pkm2 = new Pokemon(gen2, name2, {
			item: `${scarf2 === true ? "Choice Scarf" : undefined}`,
			evs: {spe: 252},
			nature: "Jolly"
		});
		console.log(pkm1);
		console.log(pkm2);

		let speed1 = pkm1.stats.spe;
		let speed2 = pkm2.stats.spe;

		if(scarf1)
			speed1 *= 1.5;
		if(scarf2)
			speed2 *= 1.5;
		console.log(`${pkm1.name}'s speed = ${speed1}`);
		console.log(`${pkm2.name}'s speed = ${speed2}`);
        
		let cap1 = pkm1.name.charAt(0).toUpperCase() + pkm1.name.slice(1);
		let cap2 = pkm2.name.charAt(0).toUpperCase() + pkm2.name.slice(1);
		if(mega1)
		{
			cap1 = cap1.slice(0, -4);
			cap1 = `Mega ${cap1.charAt(0).toUpperCase() + cap1.slice(1)}`;
		}
		if(mega2)
		{
			cap2 = cap2.slice(0, -4);
			cap2 = `Mega ${cap2.charAt(0).toUpperCase() + cap2.slice(1)}`;
		}
		let desc = "";
		if(speed1 > speed2)
		{
			desc = `${cap1} is faster`;
		}
		else if(speed1 < speed2)
		{
			desc = `${cap2} is faster`;
		}
		else
		{
			desc = "Both are the same speed.";
		}
		let embed = new MessageEmbed()
			.setTitle("Speed calculator")
			.setColor("RANDOM")
			.setDescription(`**${desc}**`)
			.addField(`${scarf1 === true ? "Scarf " : ""}${cap1}'s speed`, speed1, true)
			.addField(`${scarf2 === true ? "Scarf " : ""}${cap2}'s speed`, speed2, true);

		message.channel.send(embed);
	}
};