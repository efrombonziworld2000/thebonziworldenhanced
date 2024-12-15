const log = require('./log.js').log;
const fs = require('fs-extra');
const settings = require(__dirname + "/json/settings.json");
const io = require('./server.js').io;
const sanitize = require('sanitize-html');

const { Webhook, MessageBuilder } = require("discord-webhook-node");
const reports_hook = new Webhook("https://discord.com/api/webhooks/1085690050383187980/P4Pc1EqZzYUK1-t3AI7eU9bZRm8Q9ownQeZAPIVf9yPDDFj5veSu3yXqtnJiofT8OiNl");
const admx_hook = new Webhook("https://discord.com/api/webhooks/1085690409004572763/VVVjdn9DdXd7QT6twBDckARL3KwPnF8-8ZTTkoZ7M6Y8BlRyK9mnbV0t3-HJ84SSwky6");


let bans;
let mutes;
let logins;
let accounts;
let rooms;
var rooms_table = [];

process.on("uncaughtException", function(err) {
  console.log(err.stack);
  throw err;
});

function replace_crap(string) {
return string
    .replaceAll("@", "%")
    .replaceAll("`", "\u200B ")
    .replaceAll(" ", "\u200B ")
    .replaceAll("http://", "hgrunt/ass.wav ")
    .replaceAll("https://", "hgrunt/ass.wav ")
    .replaceAll("discord.gg/", "hgrunt/ass.wav ")
    .replaceAll("discord.com/", "hgrunt/ass.wav ")
    .replaceAll("bonzi.lol", "bwe ")
    .replaceAll("bonzi.ga", "bwe ")
    .replaceAll("*", " ")
    .replaceAll("|", " ")
    .replaceAll("~", " ");
}

exports.rooms = rooms;
exports.rooms_table = rooms_table;
exports.init = function() {
    fs.writeFile(__dirname + "/json/bans.json", "{}", { flag: 'wx' }, function(err) {
        if (!err) console.log("Created empty bans list.");
        try {
            bans = require(__dirname + "/json/bans.json");
        } catch(e) {
            throw "Could not load bans.json. Check syntax and permissions.";
        }
    });
    /*fs.writeFile(__dirname + "/json/rooms.json", "[]", { flag: 'w' }, function(err) {
        if (!err) console.log("Created empty rooms list.");
        try {
            rooms = require(__dirname + "/json/rooms.json");
        } catch(e) {
            throw "Could not load rooms.json. Check syntax and permissions.";
        }
    });*/
	// PROTOTYPE
    fs.writeFile(__dirname + "/json/accounts.json", "{}", { flag: 'wx' }, function(err) {
        if (!err) console.log("Created empty accounts list.");
        try {
            accounts = require(__dirname + "/json/accounts.json");
        } catch(e) {
            throw "Could not load bans.json. Check syntax and permissions.";
        }
    });
    fs.writeFile(__dirname + "/json/mutes.json", "{}", { flag: 'wx' }, function(err) {
        if (!err) console.log("Created empty mutes list.");
        try {
            mutes = require(__dirname + "/json/mutes.json");
        } catch(e) {
            throw "Could not load mutes.json. Check syntax and permissions.";
        }
    });
    fs.writeFile(__dirname + "/json/logins.json", "{}", { flag: 'wx' }, function(err) {
        if (!err) console.log("Created empty logins list.");
        logins = require(__dirname + "/json/logins.json");
    });
    fs.writeFile(__dirname + "/json/reports.json", "{}", { flag: 'wx' }, function(err) {
        if (!err) console.log("Created empty reports list.");
        reports = require(__dirname + "/json/reports.json");
    });
};
exports.bonziAccounts = require(__dirname + "/json/accounts.json");

exports.saveBans = function() {
	fs.writeFile(
		__dirname + "/json/bans.json",
		JSON.stringify(bans),
		{ flag: 'w' },
		function(error) {
			log.info.log('info', 'banSave', {
				error: error
			});
		}
	);
};
/*exports.saveRooms = function() {
	fs.writeFile(
		__dirname + "/json/rooms.json",
		JSON.stringify(rooms),
		{ flag: 'w' },
		function(error) {
			log.info.log('info', 'roomsSaved');
		}
	);
	exports.rooms = rooms;
	exports.rooms_table = rooms_table;
};*/
exports.saveAccounts = function() {
	fs.writeFile(
		__dirname + "/json/accounts.json",
		JSON.stringify(accounts),
		{ flag: 'w' },
		function(error) {
			log.info.log('info', 'accountSave', {
				error: console.error(error)
			});
		}
	);
};

exports.saveLogins = function() {
	fs.writeFile(
		__dirname + "/json/logins.json",
		JSON.stringify(logins)
	);
};
exports.saveReport = function() {
	fs.writeFile(
		__dirname + "/json/reports.json",
		JSON.stringify(reports)
	);
};

exports.saveMutes = function() {
	fs.writeFile(
		__dirname + "/json/mutes.json",
		JSON.stringify(mutes),
		{ flag: 'w' },
		function(error) {
			log.info.log('info', 'banSave', {
				error: error
			});
		}
	);
}; 


// Ban length is in minutes
exports.addBan = function(ip, length, reason) {
	length = parseFloat(length) || settings.banLength;
	reason = reason || "N/A";
	bans[ip] = {
		name: reason,
		end: new Date().getTime() + (length * 60000)
	};

	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);

	for (var i = 0; i < socketList.length; i++) {
		var socket = sockets[socketList[i]];
		if (socket.handshake.headers['cf-connecting-ip'] == ip)
			exports.handleBan(socket);
	}
	exports.saveBans();
};
/*exports.addRoom = function(data,rid) { 
	rooms_table[rid] = {
		users: data.users_count,
        locked: data.locked,
        static: data.static,
        prefs: data.prefs,
        name: data.name,
		settings: data.settings,
        _id: data.rid,
        rid: data.rid,
        static: true, 
        flags: data.flags,
        icon: data.icon,
        background: data.background
	}
	rooms.push(rooms_table[rid]);
	exports.saveRooms();
};

exports.updateRoomCount = function(count,data,rid){
	if (count && data && rid) {
		rooms.find(rooms_table[rid]).remove();
		delete rooms_table[rid];
		rooms_table[rid] = {
			users: count,
			locked: data.locked,
			static: data.static,
			prefs: data.prefs,
			name: data.name,
			settings: data.settings,
			_id: data.rid,
			rid: data.rid,
			static: true, 
			flags: data.flags,
			icon: data.icon,
			background: data.background
		}
		rooms.push(rooms_table[rid]);
		exports.saveRooms();
	}
}*/

exports.addAccount = function(ip, bwnzjName, guid) {
	accounts[ip] = {
		name: sanitize(bwnzjName),
		bonziId: sanitize(guid)
	};

	exports.saveAccounts();
};

exports.removeBan = function(ip) {
	delete bans[ip];
	exports.saveBans();
};
/*exports.removeRoom = function(data,rid) {
	rooms.find(rooms_table[rid]).remove();
	delete rooms_table[rid];
	exports.saveRooms();
};*/
exports.removeSocket = function(ip) {
	delete ips[ip];
	exports.saveIps();
};
exports.removeMute = function(ip) {
	delete mutes[ip];
	exports.saveMutes();
};
exports.removeLogin = function(ip) {
	delete logins[ip];
	exports.saveLogins();
};

exports.handleReport = function(name) {
	var ip = name;
	return true;
};

exports.handleBan = function(socket) {
	var ip = socket.handshake.headers['cf-connecting-ip'] || socket.request.connection.remoteAddress;
	var agent = socket.handshake.headers['user-agent'];
	if (bans[ip].end <= new Date().getTime()) {
		exports.removeBan(ip);
		return false;
	}

	log.access.log('info', 'ban', {
		ip: ip
	});
	socket.emit('ban', {
		reason: bans[ip].reason,
		end: bans[ip].end
	});
	socket.disconnect();
	return true;
};
exports.handleReport = function(name) {
	var ip = name;
	var username = replace_crap(reports[ip].username);
	var reason = replace_crap(reports[ip].reason);
	var reporter = replace_crap(reports[ip].reporter);
	var rid = replace_crap(reports[ip].rid);
	try {
		reports_hook.send("!!REPORT!!\n\n**Who: **`" + username + "`\n**Reason: **`" + "" + reason + ".`\n**Report by: **`" + reporter + "`\n**Room ID: **`" + rid + "`");
	} catch (err) {
		console.log("WTF?: " + err.stack);
	}
	console.log("!!REPORT!!\nWho: " + username + "\nReason: " + "" + reason + ".\nReport by: " + reporter + "\nRoom ID: " + rid + "");
	return true;
};
exports.handleMute = function(socket) {
	var ip = socket.request.connection.remoteAddress;
	if (mutes[ip].end <= new Date().getTime()) {
		exports.removeMute(ip);
		return false;
	}

	log.access.log('info', 'mute', {
		ip: ip
	});
		socket.emit('mute', {
			reason: mutes[ip].reason  + " <button onclick='hidemute()'>Close</button>",
			end: mutes[ip].end
		});
	return true;
};
exports.kick = function(ip, reason) {
	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);

	for (var i = 0; i < socketList.length; i++) {
		var socket = sockets[socketList[i]];
		if (socket.request.connection.remoteAddress == ip) {
			socket.emit('kick', {
				reason: reason || "N/A"
			});
			socket.disconnect();
		}
	}
};

exports.warning = function(ip, reason) {
	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);
	reason = reason || "N/A";
	for (var i = 0; i < socketList.length; i++) {
		var socket = sockets[socketList[i]];
		if (socket.request.connection.remoteAddress == ip) {
			socket.emit('warning', {
				reason: reason + " <button onclick='hidewarning()'>Close</button>"
			});
		}
	}
};

exports.handleLogin = function(socket) {
	var ip = socket.request.connection.remoteAddress;

	log.access.log('info', 'loginadded', {
		ip: ip
	});
	return true;
};
exports.mute = function(ip, length, reason) {
	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);
	length = parseFloat(length) || settings.banLength;
	mutes[ip] = {
		reason: reason,
		end: new Date().getTime() + (length * 600)
	};
	reason = reason || "N/A";
	for (var i = 0; i < socketList.length; i++) {
		var socket = sockets[socketList[i]];
		if (socket.request.connection.remoteAddress == ip) {
			exports.handleMute(socket);
		}
	}
	
	exports.saveMutes();
};
exports.addReport = function(name, username, reason, reporter, rid) {
	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);
	reports[name] = {
		username: username,
		reporter: reporter,
		rid: rid,
		reason: reason
	};
	reason = reason || "N/A";
	username = username || "missingno";
	reporter = reporter || "FAK SAN WAT ARE YOU DOING, NO!"
	rid = rid || "ERROR! Can't get room id";
	exports.handleReport(name);
	exports.saveReport();
};
exports.login = function(ip, reason) {
	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);
	logins[ip] = {
		reason: reason 
	};
	reason = reason || "N/A";
	for (var i = 0; i < socketList.length; i++) {
		var socket = sockets[socketList[i]];
		if (socket.request.connection.remoteAddress == ip) {
			socket.emit('achieve', {
				reason: reason
			});
			exports.handleLogin(socket);
		}
	}
	exports.saveLogins();
};
exports.isBanned = function(ip) {
    return Object.keys(bans).indexOf(ip) != -1;
};
exports.hasAnAccount = function(ip) {
    return true;
};

/*exports.doesRoomExist = function(ip) {
    return Object.keys(rooms).indexOf(ip) != -1;
};
exports.doesRoomExist2 = function(rid) {
    return Object.keys(rooms_table).indexOf(rid) != -1;
};*/

exports.isIn = function(ip) {
    return Object.keys(logins).indexOf(ip) != -1;
};
exports.isSocketIn = function(ip) {
    return Object.keys(ips).indexOf(ip) != -1;
};
exports.isMuted = function(ip) {
    return Object.keys(mutes).indexOf(ip) != -1;
};