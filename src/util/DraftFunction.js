const PokemonShowdwon = require("./PokemonShowdown");
const ps = new PokemonShowdwon();
module.exports = {
	async checkIfPokemonHasClericMoves(name)
	{
		name = name.toLowerCase().replace("-mega", "").replace("-therian", "");
		let learnset = await ps.getLearnset(name);
		let obj = [];
		let pokemon = await ps.pokemonDex(name);
		let prevo = pokemon.prevo ? await ps.getLearnset(pokemon.prevo) : null;
		[ "wish", "heal bell", "healing wish", "aromatherapy" ].forEach(x => 
		{
			if(learnset.learnset[x.replace(" ", "")] || (prevo != null && prevo.learnset[x.replace(" ", "")]))
				obj.push(x.toProperCase());
		});

		return obj;
	},
	async checkIfPokemonHasPivotMoves(name)
	{
		name = name.toLowerCase().replace("-mega", "").replace("-therian", "");
		let learnset = await ps.getLearnset(name);
		let obj = [];
		let pokemon = await ps.pokemonDex(name);
		let prevo = pokemon.prevo ? await ps.getLearnset(pokemon.prevo) : null;
		[ "volt switch", "u-turn", "flip turn", "parting shot", "baton pass", "teleport" ].forEach(x => 
		{
			if(learnset.learnset[x.replace(" ", "").replace("-", "")] || (prevo != null && prevo.learnset[x.replace(" ", "").replace("-", "")]))
				obj.push(x.toProperCase());
		});

		return obj;
	},

	async checkIfPokemonhasHazardMoves(name)
	{
		name = name.toLowerCase().replace("-mega", "").replace("-therian", "");
		let learnset = await ps.getLearnset(name);
		let obj = [];
		let pokemon = await ps.pokemonDex(name);
		let prevo = pokemon.prevo ? await ps.getLearnset(pokemon.prevo) : null;
		[ "stealth rock", "spikes", "toxic spikes", "sticky web" ].forEach(x => 
		{
			if(learnset.learnset[x.replace(" ", "").replace("-", "")] || (prevo != null && prevo.learnset[x.replace(" ", "").replace("-", "")]))
				obj.push(x.toProperCase());
		});

		return obj;
	},

	async checkIfPokemonHasHazardRemovalMoves(name)
	{
		name = name.toLowerCase().replace("-mega", "").replace("-therian", "");
		let learnset = await ps.getLearnset(name);
		let obj = [];
		let pokemon = await ps.pokemonDex(name);
		let prevo = pokemon.prevo ? await ps.getLearnset(pokemon.prevo) : null;
		[ "defog", "rapid spin" ].forEach(x => 
		{
			if(learnset.learnset[x.replace(" ", "").replace("-", "")] || (prevo != null && prevo.learnset[x.replace(" ", "").replace("-", "")]))
				obj.push(x.toProperCase());
		});

		return obj;
	},
	/**
	 * 
	 * @param {String[]} types 
	 */
	async TypeCalculator(types)
	{
		let netural = {
			Bug: 0,
			Dark: 0,
			Dragon: 0,
			Electric: 0,
			Fairy: 0,
			Fighting: 0,
			Fire: 0,
			Flying: 0,
			Ghost: 0,
			Grass: 0,
			Ground: 0,
			Ice: 0,
			Normal: 0,
			Poison: 0,
			Psychic: 0,
			Rock: 0,
			Steel: 0,
			Water: 0
		};
		let resist = {
			Bug: 0,
			Dark: 0,
			Dragon: 0,
			Electric: 0,
			Fairy: 0,
			Fighting: 0,
			Fire: 0,
			Flying: 0,
			Ghost: 0,
			Grass: 0,
			Ground: 0,
			Ice: 0,
			Normal: 0,
			Poison: 0,
			Psychic: 0,
			Rock: 0,
			Steel: 0,
			Water: 0
		};
		let immune = {
			Bug: 0,
			Dark: 0,
			Dragon: 0,
			Electric: 0,
			Fairy: 0,
			Fighting: 0,
			Fire: 0,
			Flying: 0,
			Ghost: 0,
			Grass: 0,
			Ground: 0,
			Ice: 0,
			Normal: 0,
			Poison: 0,
			Psychic: 0,
			Rock: 0,
			Steel: 0,
			Water: 0
		};
		let weak = {
			Bug: 0,
			Dark: 0,
			Dragon: 0,
			Electric: 0,
			Fairy: 0,
			Fighting: 0,
			Fire: 0,
			Flying: 0,
			Ghost: 0,
			Grass: 0,
			Ground: 0,
			Ice: 0,
			Normal: 0,
			Poison: 0,
			Psychic: 0,
			Rock: 0,
			Steel: 0,
			Water: 0
		};  
		let typeList = [
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
			"Water"
		];

		for(let type of types) 
		{
			if(type.includes("||")) 
			{
	
				typeList.forEach(x => 
				{
					let type1 = ps.getType(x);
					let type2 = ps.getType(x);
					let upper1 = type.split("||")[0].charAt(0).toUpperCase() + type.split("||")[0].slice(1);
					let upper2 = type.split("||")[1].charAt(0).toUpperCase() + type.split("||")[1].slice(1);
					let _type1 = type1.effectiveness[upper1];
					let _type2 = type2.effectiveness[upper2];
					if(_type1 === 0 || _type2 === 0)
						immune[x]++;
					else if((_type1 === 0.5 && _type2 === 0.5) || (_type1 === 0.5 && _type2 === 1) || (_type1 === 1 && _type2 === 0.5))
						resist[x]++;
					else if((_type1 === 1 && _type2 === 1) || (_type1 === 0.5 && _type2 === 2) || (_type1 === 2 && _type2 === 0.5))
						netural[x]++;
					else if((_type1 === 2 && _type2 === 2) || (_type1 === 1 && _type2 === 2) || (_type1 === 2 && _type2 === 1))
						weak[x]++;
				});
			}
			else
			{
				typeList.forEach(x => 
				{
					let _type = ps.getType(x);
					let upper = type.charAt(0).toUpperCase() + type.slice(1);
					let __type = _type.effectiveness[upper];
					if(__type === 0) 
					{
						immune[x]++;
					}
					else if(__type === 0.5) 
					{
						resist[x]++;
					}
					else if(__type === 1) 
					{
						netural[x]++;
					}
					else if(__type === 2) 
					{
						weak[x]++;
					}
				});
			}
		}

		return {
			immune: immune,
			resist: resist,
			netural: netural,
			weak: weak
		};
	}
};