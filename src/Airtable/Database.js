const Airtable = require("airtable");
const TeamTable = require("./TeamTable");
const DraftTable = require("./Draft");
module.exports = class Database
{
	/**
	 * 
	 * @param {{userId?: String}} data 
	 */
	constructor(data)
	{
		// eslint-disable-next-line no-undef
		this.db = new Airtable({apiKey: process.env.AIRTABLE_API}).base(process.env.AIRTABLE_TABLE);
		this.team = new TeamTable(this.db, data);
		this.draft = new DraftTable(this.db, data);
	}

};