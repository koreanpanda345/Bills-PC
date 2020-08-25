const { checkIfPokemonHasClericMoves, checkIfPokemonHasPivotMoves, checkIfPokemonhasHazardMoves, checkIfPokemonHasHazardRemovalMoves, TypeCalculator } = require("./DraftFunction");
const PokemonShowdown = require("./PokemonShowdown");
const ps = new PokemonShowdown();
module.exports = {
	/**
	 * 
	 * @param {String[]} team 
	 */
	async getInfoForTeam(team)
	{
		let out = {
			clericPokemon: [],
			pivotPokemon: [],
			hazardPokemon: [],
			hazardRemovalPokemon: [],
			types: [],
			speedTiers: [],
			abilities: [],
			typeChart: {}
		};

		for(let i = 0; i < team.length; i++)
		{
			let x = team[i];
			let cleric = await checkIfPokemonHasClericMoves(x);
			console.log(cleric);
			let pivot = await checkIfPokemonHasPivotMoves(x);
			console.log(pivot);
			let hazards = await checkIfPokemonhasHazardMoves(x);
			console.log(hazards);
			let removal = await checkIfPokemonHasHazardRemovalMoves(x);
			console.log(removal);

			if(cleric.length !== 0) out.clericPokemon.push({pokemon: x, moves: cleric});
			if(pivot.length !== 0) out.pivotPokemon.push({pokemon: x, moves: pivot});
			if(hazards.length !== 0) out.hazardPokemon.push({pokemon: x, moves: hazards});
			if(removal.length !== 0) out.hazardRemovalPokemon.push({pokemon: x, moves: removal});

			let pokemon = await ps.pokemonDex(x);
			
			out.types.push(pokemon.types.length == 2 ? `${pokemon.types[0]} | ${pokemon.types[1]}` : `${pokemon.types[0]}`);
			out.speedTiers.push({pokemon: pokemon.name, speed: pokemon.baseStats.spe});
			out.abilities.push({pokemon: pokemon.name, "0": pokemon.abilities["0"], "1": pokemon.abilities["1"], "H": pokemon.abilities["H"], "S": pokemon.abilities["S"]});
		}

		let typeChart = await TypeCalculator(out.types);
		out.typeChart = typeChart;
		console.log(out);
		return out;
	}
};