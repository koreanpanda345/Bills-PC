/* eslint-disable no-undef */
require("dotenv").config();
const DiscordBot = require("./DiscordBot");
const client = new DiscordBot();
const testMode = true;
const init = () => 
{
	[ "Client", "Guild" ].forEach(x => client.handler.event.loadEvents(x));
	[ "Miscellaneous", "Team", "Info", "DevTools", "Draft", "Tools", "Settings" ].forEach(x => client.handler.command.loadCommands(x));
	if(testMode)
		client.login(process.env.TEST_TOKEN);
	else
		client.login(process.env.DISCORD_TOKEN);
};

init();

String.prototype.toProperCase = function()
{
	return this.replace(/([^\W_]+[^\s-]*) */g, function(txt) 
	{ 
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};

Array.prototype.random = function()
{
	return this[Math.floor(Math.random() * this.length)];
};

process.on("uncaughtException", (error) => 
{
	const errorMessage = error.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
	console.error("Uncaught Exception: ", errorMessage);

	process.exit(1);
});

process.on("unhandledRejection", (error) =>
{
	console.error("Uncaught Promise Error: ", error);
});