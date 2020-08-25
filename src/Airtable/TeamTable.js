/* eslint-disable no-unused-vars */

module.exports = class TeamTable
{
	/**
	 * 
	 * @param {Airtable.Base} base 
	 * @param {{userId: string}} data 
	 */
	constructor(base, data)
	{
		this.base = base("Teams");
		this.data = data;
	}
	/**
	 * 
	 * @param {{teamName: String, teamPaste: String, teamSend: String}} data 
	 * @returns {{success: Boolean, reason?: String}}
	 */
	async addTeam(data)
	{
		// eslint-disable-next-line no-async-promise-executor
		let result = await new Promise(async (resolve, _) =>
		{
			if(!await this.checkIfUserHasTeams())
			{
				let success = await this.createUsersEntry(data);
				if(!success.success)
					return resolve({success: false, reason: success.reason});
				else
					return resolve({success: true});
			}
			let _data = await this.getUserTeams();
			
			this.base.update(
				[
					{
						id: _data.recordId,
						fields: {
							teamNames: _data.teamNames + "," + data.teamName,
							teams: _data.teamPastes + "," + data.teamPaste,
							visibility: _data.teamSend + "," + data.teamSend
						},
					},
				], (err, _) =>
				{
					if(err) return resolve({success: false, reason: err});
					return resolve({success: true});
				}
			);
		});

		return result;
	}

	/**
	 * @returns {Boolean}
	 */
	async checkIfUserHasTeams()
	{
		let result = await new Promise((resolve, _) => 
		{
			this.base.select({
				filterByFormula: `userId=${this.data.userId}`
			}).eachPage((records, _) =>
			{
				if(!records.length) return resolve(false);
				return resolve(true);
			});
		});
		return result;
	}
	/**
	 * 
	 * @param {{team_name: String, team_paste: String, team_send: String}} teamData 
	 * @returns {{success: Boolean, reason?: String}}
	 */
	async createUsersEntry(teamData)
	{
		let result = await new Promise((resolve, _) => 
		{
			this.base.create(
				[
					{
						fields: {
							userId: this.data.userId,
							teamNames: teamData.team_name,
							teams: teamData.team_paste,
							visibility: teamData.team_send
						},
					},
				], (err, _) =>
				{
					if(err) return resolve({success: false, reason: err});
					return resolve({success: true});
				}
			);
		});
		return result;
	}
	/**
   	 * @summary Converts The Teams Into Readable Arrays.
     * @param {{record_id: String, teamNames: String, teamPastes: String, teamSend: String}} data 
     * @returns {{recordId: String, names: String[], teams: String[], sends: String[]}}
     */
	convertTeamsIntoArray(data)
	{
		let nameArr = [];
		let teamArr = [];
		let sendArr = [];

		for(let i = 0; i < data.teamNames.split(",").length; i++)
			nameArr.push(data.teamNames.split(",")[i]);
		for(let i = 0; i < data.teamPastes.split(",").length; i++)
			teamArr.push(data.teamPastes.split(",")[i]);
		for(let i = 0; i < data.teamSend.split(",").length; i++)
			sendArr.push(data.teamSend.split(",")[i]);

		return {
			recordId: data.recordId,
			names: nameArr,
			teams: teamArr,
			sends: sendArr
		};
	}
	/**
	 * 
	 * @param {Number} select 
	 * @returns {{success: Boolean, reason?: String, oldName?: String}}
	 */
	async deleteTeam(select)
	{
		// eslint-disable-next-line no-async-promise-executor
		let data = await new Promise(async(resolve, _) =>
		{
			if(!await this.checkIfUserHasTeams)
				return resolve({success: false, reason: "There is no teams in the PC."});
			let teams = await this.getUserTeams();
			if(isNaN(select)) return resolve({success: false, reason: "Sorry, but that id is not a number, please try again."});
			select--;
			let arr = await this.convertTeamsIntoArray(teams);
			if(select > arr.teams.length) return resolve({success: false, reason: "Sorry, but it doesn't seem like that id exist."});
			
			let oldName = arr.names[select];
			
			arr.names.splice(select, 1);
			arr.teams.splice(select, 1);
			arr.sends.splice(select, 1);

			this.base.update(
				[
					{
						id: arr.recordId,
						fields: {
							teamNames: arr.names.toString(),
							teams: arr.teams.toString(),
							visibility: arr.sends.toString()
						},
					},
				], (err, _) => 
				{
					if(err) return resolve({success: false, reason: err});
					return resolve({success: true, oldName: oldName});
				}
			);
		});
		return data;
	}
	/**
	 * 
	 * @param {Number} select 
	 * @param {{paste}} newData 
	 * @returns {{success: Boolean, reason?: String, teamName?: String}}
	 */
	async editTeam(select, newData)
	{
		// eslint-disable-next-line no-async-promise-executor
		let data = await new Promise(async (resolve, _) => 
		{
			if(!await this.checkIfUserHasTeams()) return resolve({success: false, reason: "There is no teams in the PC."});
			let teams = await this.getUserTeams();
			if(isNaN(select)) return resolve({success: false, reason: "Sorry, but that id is not a number, please try again."});
			select--;
			let arr = await this.convertTeamsIntoArray(teams);
			if(select > arr.teams.length) return resolve({success: false, reason: "Sorry, but it doesn't seem like that id exists."});
			
			arr.teams[select] = newData.paste;
			this.base.update(
				[
					{
						id: arr.recordId,
						fields: {
							teams: arr.teams.toString(),
						},
					},
				], (err, _) => 
				{
					if(err) return resolve({success: false, reason: err});
					return resolve({success: true, teamName: arr.name[select]});
				}
			);
		});

		return data;
	}
	/**
	 * 
	 * @param {Number} select 
	 * @returns {{success: Boolean, reason?: String, team?: {name: String, paste: String, send: String}}}
	 */
	async getTeam(select)
	{
		// eslint-disable-next-line no-async-promise-executor
		let data = await new Promise(async(resolve, _) =>
		{
			if(!await this.checkIfUserHasTeams()) return resolve({success: false, reason: "There is no teams in the PC."});
			let teams = await this.getUserTeams();
			if(isNaN(select)) return resolve({success: false, reason: "Sorry, but that id is not a number, please try again."});
			select--;
			let arr = await this.convertTeamsIntoArray(teams);
			if(select > arr.teams.length) return resolve({success: false, reason: "Sorry, but it doesn't seem like that id exist."});
			return resolve({
				success: true,
				team: {
					name: arr.names[select],
					paste: arr.teams[select],
					send: arr.sends[select]
				}
			});
		});

		return data;
	}


	/**
     * @summary Gets the user's teams.
     * @returns {{recordId: String, teamNames: String, teamPastes: String, teamSend: String}}
     */
	async getUserTeams()
	{
		let result = await new Promise((resolve, _) => 
		{
			this.base.select({
				filterByFormula: `userId=${this.data.userId}`
			}).eachPage((records, _) =>
			{
				records.forEach((record) => 
				{
					return resolve({
						recordId: record.getId(),
						teamNames: record.get("teamNames"),
						teamPastes: record.get("teams"),
						teamSend: record.get("visibility")
					});
				});
			});
		});

		return result;
	}

};