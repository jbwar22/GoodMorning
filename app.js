var moment = require('moment');
var Discord = require('discord.js');
var LocalStorage = require('node-localstorage').LocalStorage; // TODO replace with sqlite3
localStorage = new LocalStorage('./dat');
var config = require('./config.js');

var bot = new Discord.Client();

let guildList = [];
var guildMap = {};
let guildTimeouts = {};

bot.on('ready', () => {
	guildMap = JSON.parse(localStorage.getItem('guildMap'));
	for (let i = 0; i < Object.keys(guildMap).length; i++) {
		guildList.push(Object.keys(guildMap)[i]);
		guildTimeouts[Object.keys(guildMap)[i]] = null;
	}

	console.log('Good Morning Ready!');
	
	for (let i = 0; i < guildList.length; i++) {
		setGuildTimeout(guildList[i]);
	}
});

async function runPing(guildId){
	console.log("PINGING " + guildId);
	let guild = await bot.guilds.fetch(guildId);

	let memberManager = guild.members;
	let membersCollection = await memberManager.fetch();

	let members = [];

	if (guildMap[guildId].role) {
		let membersAll = membersCollection.array();
		for (var i = 0; i < membersAll.length; i++) {
			if (membersAll[i].roles.cache.has(guildMap[guildId].role)) {
				members.push(membersAll[i]);
			}
		}
	} else {
		members = membersCollection.array();
	}

	
	var user = members[Math.floor(Math.random() * members.length)];

	let chat = guild.channels.resolve(guildMap[guildId].chat);
	chat.send('Good Morning, ' + user.toString());
}

function setGuildTimeout(guildId) {
		console.log("");
		console.log("setting timeout for " + guildId);
		let offset = guildMap[guildId].offset;
		offset = offset ? parseInt(offset) : 0;
		let addHours = ((24 + offset - moment().hours()) - 1) % 24 + 1;
		if (addHours > 24) addHours -= 24;
		console.log("        H " + addHours);
		let subMinutes = moment().minutes();
		console.log("       -M " + subMinutes);
		let subSeconds = moment().seconds();
		console.log("       -S " + subSeconds);
		let subMillis = moment().milliseconds();
		console.log("       -X " + subMillis);
		if (guildTimeouts[guildId]) {
			clearTimeout(guildTimeouts[guildId]);	
		}
		let timeout = addHours * 1000 * 60 * 60;
		timeout -= subMinutes * 1000 * 60;
		timeout -= subSeconds * 1000;
		timeout -= subMillis;
		clearTimeout(guildTimeouts[guildId]);
		if (timeout >= 1000 * 60) {
			timeout *= 0.8;
			guildTimeouts[guildId] = setTimeout(function() {
				setGuildTimeout(guildId);	
			}, timeout);
			console.log("    recheck time: " + moment().add(timeout, 'ms').format("T\\h\\e Do @ HH:mm:ss + SSS\\m\\s"));
		} else {
			guildTimeouts[guildId] = setTimeout(function() {
				runPing(guildId);
				setGuildTimeout(guildId);	
			}, timeout);
			console.log("    ping time: " + moment().add(timeout, 'ms').format("T\\h\\e Do @ HH:mm:ss + SSS\\m\\s"));
		}
}

bot.login(config.token);
