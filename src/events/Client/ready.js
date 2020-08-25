// eslint-disable-next-line no-unused-vars
const DiscordBot = require("../../DiscordBot");

module.exports = class 
{
	/**
	 * 
	 * @param {DiscordBot} client 
	 */
	constructor(client)
	{
		this.client = client;
	}
	
	async invoke()
	{
		await this.client.wait(1000);
		this.client.appInfo = await this.client.fetchApplication();
		
		if(!this.client.settings.has("default"))
			this.client.settings.set("default", this.client.config.defaultSettings);

		setInterval(async () => 
		{
			this.client.appInfo = await this.client.fetchApplication();	
		}, 60000);

		this.client.logger.log(`${this.client.user.username} is ready`);

		this.client.user.setStatus("online");
		this.client.user.setActivity({name: `b!help for a list of commands | In ${this.client.guilds.cache.size} Servers`});
	}
};