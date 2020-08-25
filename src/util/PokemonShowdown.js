// eslint-disable-next-line no-unused-vars
const { Dex, Item, Move, Ability, Species, Learnset, Type } = require("@pkmn/dex");
const {Sets} = require("@pkmn/sets");
const {Generations, Types} = require("@pkmn/data");
// eslint-disable-next-line no-unused-vars
const Calc = require("@smogon/calc");
const { Pokemon } = require("@smogon/calc/dist/pokemon");
module.exports = class PokemonShowdown
{
	/**
	 * 
	 * @param {String} name
	 * @returns {Item} 
	 */
	async itemDex(name)
	{
		return Dex.getItem(name);
	}
	/**
	 * 
	 * @param {String} name
	 * @returns {Move} 
	 */
	async moveDex(name)
	{
		return Dex.getMove(name);
	}
	/**
	 * 
	 * @param {String} name
	 * @returns {Ability} 
	 */
	async abilityDex(name)
	{
		return Dex.getAbility(name);
	}
	/**
	 * 
	 * @param {String} name 
	 * @returns {Species}
	 */
	async pokemonDex(name)
	{
		let search = name.toLowerCase()
			.replace(" ", "");
		let pokemon = Dex.getSpecies(search);
		return pokemon;
	}
	/**
	 * 
	 * @param {String} name
	 * @returns {String} 
	 */
	pokemonSprites(name)
	{
		// eslint-disable-next-line no-undef
		return `${process.env.SDSPRITES_ENDPOINT}${name.toLowerCase()}.gif`;
	}
	/**
	 * 
	 * @param {String} name
	 * @returns {Learnset} 
	 */
	async getLearnset(name)
	{
		return Dex.getLearnset(name);
	}
	/**
	 * 
	 * @param {String} name
	 * @returns {Type} 
	 */
	getType(name)
	{
		let type = new Types(Dex).get(name);
		return type;
	}

	async damageCalc(data)
	{
		if(!data.attacking) return {success: false, reason: "There was no attacking pokemon set."};
		if(!data.defending) return {success: false, reason: "There was no defending pokemon set."};

		let atkSet = Sets.importSet(data.attacking);
		let defSet = Sets.importSet(data.defending);
		
		let field;

		if(data.field !== undefined)
			field = new Calc.Field({
				defenderSide: {
					isSR: data.field.sr == null ? false : true,
					spikes: data.field.spikes == null ? 0 : data.field.spikes,
					isSeeded: data.field.seeds == null ? false : true,
					isLightScreen: data.field.lightScreent == null ? false : true,
					isReflect: data.field.reflect == null ? false : true,
					isAuroraVeil: data.field == null ? false : true
				}
			});

		let atkGen = new Generations(Dex).get(8).species.get(atkSet.species) == undefined ? new Generations(Dex).get(7) : new Generations(Dex).get(8);
		let defGen = new Generations(Dex).get(8).species.get(defSet.species) == undefined ? new Generations(Dex).get(7) : new Generations(Dex).get(8);

		let attacker = new Pokemon(atkGen, atkSet.species, {
			item: atkSet.item,
			nature: defSet.nature,
			ability: atkSet.ability
		});

		if(atkSet.evs) attacker.evs = atkSet.evs;
		if(atkSet.ivs) attacker.ivs = atkSet.ivs;

		let defender = new Pokemon(defGen, defSet.species, {
			item: defSet.item,
			nature: defSet.nature,
			ability: defSet.ability
		});

		if(defSet.evs) defender.evs = defSet.evs;
		if(defSet.ivs) defender.ivs = defSet.ivs;

		for(let i = 0; i < atkSet.moves.length; i++)
		{
			let move = new Calc.Move(atkGen, atkSet.move[i]);
			let result;
			if(data.field !== undefined)
				result = Calc.calculate(new Generations(Dex).get(8), attacker, defender, move, field);
			else
				result = Calc.calculate(new Generations(Dex).get(8), attacker, defender, move);
			console.log(result);
			return result;
		}


	}
};