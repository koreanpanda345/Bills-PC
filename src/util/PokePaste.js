/* eslint-disable no-unused-vars */
const TinyUrl = require("tinyurl");
const axios = require("axios").default;
const htmlToArticleJson = require("@mattersmedia/html-to-article-json");
module.exports = class PokePaste
{
	async import(url)
	{
		let data = await new Promise((resolve, _) => 
		{
			axios.get(url)
				.then((response) => 
				{
					console.log(response.data);
					let html = response.data;
					const json = htmlToArticleJson(html);
					let team = "";
					for(let i = 0; i < json.length; i++)
					{
						if(json[i].type === "paragraph")
						{
							let content = json[i].children[0].content;
							content = content.replace(/Ability:+/g, "<>Ability:");
							content = content.replace(/EVs:+/g, "<>EVs:");
							content = content.replace(/IVs:+/g, "<>IVs:");
							content = content.replace(/(- )+/g, "<>-");
							team += content + "\n\n";
						}
					}

					let _data = {
						title: json[json.length - 3].children[0].content,
						team: team.replace(/<>+/g, "\n"),
					};
					return resolve({success: true, teamName: _data.title, teamPaste: _data.team.replace("Columns Mode / Stat Colours / Light Mode", ""), teamSend: "public"});

				})
				.catch(error => 
				{
					console.error(error);
					return resolve({success: false, reason: error});
				});
		});

		return data;
	}

	async export(data)
	{
		let url = encodeURI("title=" + data.title + "&paste=" + data.paste + "&author=" + data.author);
		url = url.replace(/:/g, "%3A");
		url = url.replace(/%20/g, "+");
		url = url.replace(/\n/g, "%0A");
		url = url.replace(/%0A/g, "%0D%0A");
		url = "https://pokepast.es/create?" + url;
		let _data = await new Promise((resolve, _) =>
		{
			TinyUrl.shorten(url, (res, err) =>
			{
				if(err) return resolve({success: false, reason: err});
				return resolve({success: true, url: res});
			});
		});
		return _data;
	}
};