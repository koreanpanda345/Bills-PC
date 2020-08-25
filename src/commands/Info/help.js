/* eslint-disable no-unused-vars */
const CommandBase = require("../../base/CommandBase");
const { MessageEmbed, Message } = require("discord.js");
const {readdirSync} = require("fs");

/*
  The HELP command is used to display every command's name and description
  to the user, so that he may see what commands are available. The help
  command is also filtered by level, so if a user does not have access to
  a command, it is not shown to them. If a command name is given with the
  help command, its extended help is shown.
*/
module.exports = class Help extends CommandBase 
{
	constructor(client) 
	{
		super(client, {
			name: "help",
			description: "Displays all the available commands for you.",
			category: "Info",
			usage: "help [command]",
			aliases: [ "command", "commands" ],
			guildOnly: true
		});
	}
	/**
	 * 
	 * @param {Message} message 
	 * @param {String[]} args 
	 */
	async invoke(message, args) 
	{
      
		const embed = new MessageEmbed();
		embed.setColor("RANDOM");
		embed.setAuthor(`${message.guild.me.displayName}'s Help`, message.guild.iconURL);
		embed.setThumbnail(this.client.user.displayAvatarURL);

		if(!args[0])
		{
			const categories = readdirSync("./src/commands/");
			embed.setDescription(`These are the avaliable commands for ${message.guild.me.displayName}
        You can find more info on [my website](https://bills-pc.netlify.app/commands)
        If you need additional help, or just want to be up to date with what is going on with the bot. Come join the [discord server](https://discord.gg/uhMbRMa) for it.`);
			embed.setFooter(`${message.guild.me.displayName} | Total Commands: ${this.client.commands.size}`);
			embed.setThumbnail(this.client.user.displayAvatarURL({format: "jpg"}));
			categories.forEach(category => 
			{
				const dir = this.client.commands.filter(c => c.props.category === category);
				const capitalise = category.slice(0, 1).toUpperCase() + category.slice(1);
            
				try
				{
					if(capitalise !== "DevTools")
						embed.addField(`>${capitalise} [${dir.size}]:`, dir.map(c => `\`${c.props.name}\``).join(" "));
				} 
				catch(e)
				{
					console.error(e);
				}
			});
			return message.channel.send(embed);
		}
		else 
		{
			let command = this.client.commands.get(args[0].toLowerCase()) || this.client.commands.find(cmd => cmd.conf.aliases && cmd.conf.aliases.includes(args[0].toLowerCase()));
			if(!command) return message.channel.send(embed.setTitle("Invalid Command").setDescription(`do \`${message.settings["prefix"]}help\` of a list of commands.`));
			embed.setDescription(`The Bot's prefix is \`${message.settings["prefix"]}\`\n
        **Command:** ${command.props.name.slice(0, 1).toUpperCase() + command.props.name.slice(1)}\n
        **Description:** ${command.props.description || "No Description Provided"}\n
        **Aliases:** ${command.props.aliases.join(", ") || "None"}\n
        **Usage:** ${message.settings["prefix"]}${command.props.usage || "None was provided"}\n
        \n
        *<> means that it is required, () means it's optional*
        `);
			embed.setFooter(`${message.guild.me.displayName}`, this.client.user.displayAvatarURL({format: "jpg"}));

			return message.channel.send(embed);
		}
	}
};