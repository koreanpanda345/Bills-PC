const chalk = require("chalk");
const moment = require("moment");
module.exports = class Logger
{
	/**
     * 
     * @param {any} content 
     * @param {"error" | "info" | "warn" | "debug" | "event" | "cmd" | "client"} type 
     */
	log(content, type)
	{
		let timestamp = chalk.black.bgGray(moment().format());
		switch(type)
		{
		case "error":   return console.log(`${timestamp}  ${chalk.black.bgRed("ERROR")}  ${content}`);
		case "info":    return console.log(`${timestamp}  ${chalk.black.bgBlue("INFO")}   ${content}`);
		case "debug":   return console.log(`${timestamp}  ${chalk.black.bgGreenBright("DEBUG")}  ${content}`);
		case "warn":    return console.log(`${timestamp}  ${chalk.black.bgYellowBright("WARN")}   ${content}`);
		case "client": 	return console.log(`${timestamp}  ${chalk.black.bgMagenta("CLIENT")}  ${content}`);
		case "cmd":		return console.log(`${timestamp}  ${chalk.black.bgWhite("CMD")}    ${content}`);
		case "event":	return console.log(`${timestamp}  ${chalk.black.bgCyanBright("EVENT")}  ${content}`);
		}
	}

	error(content)
	{
		return this.log(content, "error");
	}

	info(content)
	{
		return this.log(content, "info");
	}

	warn(content)
	{
		return this.log(content, "warn");
	}

	debug(content)
	{
		return this.log(content, "debug");
	}
};