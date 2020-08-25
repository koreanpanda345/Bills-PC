/* eslint-disable no-unused-vars */

module.exports = class DraftTable
{
	/**
	 * 
	 * @param {Airtable.Base} base 
	 * @param {{userId: string}} data 
	 */
	constructor(base, data)
	{
		this.base = base("Draft plans");
		this.data = data;
	}
	/**
     * 
     * @param {{name: String, plan: String, type: String}} draft 
     * @returns {{success: Boolean, reason?: String}}
     */
	async addDraft(draft)
	{
		// eslint-disable-next-line no-async-promise-executor
		let result = await new Promise(async(resolve, _) => 
		{
			if(!await this.checkIfUserHasDraft())
			{
				let success = await this.createUserEntry(draft);
				if(!success.success) return resolve({success: false, reason: "Something Happened"});
				else return resolve(success);
			}

			let data = await this.getUsersDrafts();
			this.base.update(
				[
					{
						id: data.recordId,
						fields: {
							draftname: data.draftNames + "," + draft.name,
							draftplans: data.draftPlans + "," + draft.plan,
							drafttype: data.draftTypes + "," + draft.type
						}
					}
				], (err, _) =>
				{
					if(err) return resolve({success: false, reason: err});
					return resolve({success: true});
				}
			);
		});
	}

	/**
	 * @returns {Boolean}
	 */
	async checkIfUserHasDraft()
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
   	 * @param {{name: String, plan: String, type: String}} data
     * @returns {{success: Boolean, reason?: String}}
     */
	async createUserEntry(data)
	{
		let result = await new Promise((resolve, _) => 
		{
			this.base.create(
				[
					{
						fields: {
							userId: this.data.userId,
							draftname: data.name,
							draftplans: data.plan,
							drafttype: data.type
						}
					}
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
     * 
     * @param {{recordId: String, draftNames: String, draftPlans: String, draftTypes: String}} data
     * @returns {{recordId: String, names: String[], plans: String[], types: String[]}} 
     */
	async convertDraftsIntoArray(data)
	{
		let draftName = [];
		let draftPlans = [];
		let draftType = [];
		for (let i = 0; i < data.draftNames.split(",").length; i++) 
			draftName.push(data.draftNames.split(",")[i]);
		
		for (let i = 0; i < data.draftPlans.split(",").length; i++) 
			draftPlans.push(data.draftPlans.split(",")[i]);
		
		for (let i = 0; i < data.draftTypes.split(",").length; i++) 
			draftType.push(data.draftTypes.split(",")[i]);
		
		return {
			recordId: data.recordId,
			names: draftName,
			plans: draftPlans,
			types: draftType
		};
	}
	/**
	 * 
	 * @param {Number} select
	 * @returns {{success: Boolean, reason?: String, name?: String}} 
	 */
	async deleteDraft(select)
	{
		// eslint-disable-next-line no-async-promise-executor
		let result = await new Promise(async(resolve, _) =>
		{
			if(!await this.checkIfUserHasDraft())
				return resolve({success: false, reason: "Sorry, but it seems like you do not have a draft plan made yet."});
			let drafts = await this.getUsersDrafts();
			if(isNaN(select)) return resolve({success: false, reason: "Sorry, but that id is not a number."});
			let arr = await this.convertDraftsIntoArray(drafts);
			select--;
			if(select > arr.names.length) return resolve({success: false, reason: "Sorry, but it seems like that id doesn't exist yet."});
			let oldName = arr.names[select];
			arr.names.splice(select, 1);
			arr.plans.splice(select, 1);
			arr.types.splice(select, 1);

			this.base.update(
				[
					{
						id: arr.recordId,
						fields: {
							draftname: arr.names.toString(),
							draftplans: arr.plans.toString(),
							drafttype: arr.types.toString()
						}
					}
				], (err, _) =>
				{
					if(err) return resolve({success: false, reason: err});
					return resolve({success: true, name: oldName});
				});
		});

		return result;
	}
	/**
     * 
     * @param {{Number}} select 
     * @param {{plan: String}} newData 
     * @returns {{success: Boolean, reason?: String, draft: String}}
     */
	async editDraft(select, data)
	{
		// eslint-disable-next-line no-async-promise-executor
		let result = await new Promise(async(resolve, _) =>
		{
			if(!await this.checkIfUserHasDraft())
				return resolve({success: false, reason: "Sorry, but it looks like you do not have any draft plans in the pc yet."});
			let drafts = await this.getUsersDrafts();
			if(isNaN(select)) return resolve({success: false, reason: "Sorry, but that id is not a number."});
			let arr = await this.convertDraftsIntoArray(drafts);
			select--;
			if(select > arr.names.length) return resolve({success: false, reason: "Sorry, but it seems lik that id doesn't exist yet."});
			arr.plans[select] = data.plan;
			this.base.update(
				[
					{
						id: arr.recordId,
						fields: {
							draftplans: arr.plans.toString(),
						}
					}
				], (err, _) =>
				{
					if(err) return resolve({success: false, reason: err});
					return resolve({success: true, name: arr.names[select]});
				}
			);
		});
		return result;
	}
	/**
	 * @param {Number} select
	 * @returns {{success: Boolean, reason?: String, draft?: {name: String, plan: String, type: String}}}
	 */
	async getDraft(select)
	{
		// eslint-disable-next-line no-async-promise-executor
		let data = await new Promise(async(resolve, _) =>
		{
			if(!await this.checkIfUserHasDraft())
				return resolve({success: false, reason: "Sorry, but it looks like you don't have any drafts in the pc yet."});
			let drafts = await this.getUsersDrafts();
			if(isNaN(select)) return resolve({success: false, reason: "Sorry, but that id is not a valid id."});
			let arr = await this.convertDraftsIntoArray(drafts);
			select--;
			if(select > arr.names.length) return resolve({success: false, reason: "Sorry, but it looks like that id doesn't exist yet."});
			return resolve({success: true, draft: {name: arr.names[select], plan: arr.plans[select], type: arr.types[select]}});
		});

		return data;
	}
	/**
   	 * @returns {{recordId: String, draftNames: String, draftPlans: String, draftTypes: String}}
     */
	async getUsersDrafts()
	{
		let data = await new Promise((resolve, _) =>
		{
			this.base.select({
				filterByFormula: `userId=${this.data.userId}`
			}).eachPage((records, _) =>
			{
				records.forEach((record) => 
				{
					return resolve({
						recordId: record.getId(),
						draftNames: record.get("draftname"),
						draftPlans: record.get("draftplans"),
						draftTypes: record.get("drafttype"),
					});
				});
			});
		});
		return data;
	}
};