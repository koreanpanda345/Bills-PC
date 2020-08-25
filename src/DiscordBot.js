// eslint-disable-next-line no-unused-vars
const { Client, Collection, Message } = require("discord.js");
const Logger = require("./modules/Logger");
const Enmap = require("enmap");
const CommandHandler = require("./handlers/CommandHandler");
const EventHandler = require("./handlers/EventHandler");

module.exports = class DiscordBot extends Client 
{
	constructor(options) 
	{
		super(options);
		this.commands = new Collection();
		this.logger = new Logger();
		this.settings = new Enmap({name: "settings", cloneLevel: "deep", fetchAll: false, autoFetch: true});
		this.config = require("./config");
		this.appInfo = {};
		this.commandHandler = new CommandHandler(this);
		this.eventHandler = new EventHandler(this);
		this.handler = {event: this.eventHandler, command: this.commandHandler};
		this.wait = require("util").promisify(setTimeout);
	}

	async clean(text) 
	{
		if(text && text.constructor.name == "Promise")
			text = await text;
		if(typeof text !== "string")
			text = require("util").inspect(text, {depth: 1});

		text = text
			.replace(/`/g, "`" + String.fromCharCode(8203))
			.replace(/@/g, "@" + String.fromCharCode(8203))
			// eslint-disable-next-line no-undef
			.replace(process.env.DISCORD_TOKEN, "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0")
			// eslint-disable-next-line no-undef
			.replace(process.env.TEST_TOKEN, "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0");
	}
	/**
	 * 
	 * @param {String} guildId 
	 */
	getSettings(guildId)
	{
		return {
			...(this.config.defaultSettings || {}),
			...(this.settings.get(guildId) || {})
		};
	}
	/**
	 * 
	 * @param {String} guildId 
	 * @param {{}} newSettings 
	 */
	writeSettings(guildId, newSettings)
	{
		const defaults = this.settings.get("default");
		let settings = this.settings.get(guildId);
		if(typeof settings !== "object") settings = {};
		for(const key in newSettings)
		{
			if(defaults[key] !== newSettings[key])
				settings[key] = newSettings[key];
			else
				delete settings[key];	
		}

		this.settings.set(guildId, settings);
	}

	/**
	 * 
	 * @param {Message} message 
	 * @param {any} question 
	 * @param {Number} limit 
	 */
	async awaitReply(message, question, limit = 60000)
	{
		const filter = m => m.author.id === message.author.id;
		await message.channel.send(question);
		try 
		{
			const collected = await message.channel.awaitMessages(filter, {max: 1, time: limit, errors: [ "time" ]});
			return collected.first().content;
		} 
		catch(error) 
		{
			return false;
		}
	}
};