const Ban = require('./ban.js');
const io = require('./server.js').io;
let commands = {
    "ban": {
        "help": "ip [length reason]",
        "function": function(args) {
			if (args.length === 0)
				return console.log(this.help);
				
            let ip = args[0];
            let length = args[1];
            let reason = args.slice(2).join(" ");

            Ban.addBan(ip, length, reason);
            console.log(
                "ban: " +
                ip + "," +
                length + "," +
                reason
            );
        }
    },
    "mute": {
        "help": "ip [length reason]",
        "function": function(args) {
			if (args.length === 0)
				return console.log(this.help);
				
            let ip = args[0];
            let length = args[1];
            let reason = args.slice(2).join(" ");

            Ban.mute(ip, length, reason);
            console.log(
                "mute: " +
                ip + "," +
                length + "," +
                reason
            );
        }
    },
    "warn": {
        "help": "ip [reason]",
        "function": function(args) {
				
            let ip = args[0];
            let reason = args.slice(2).join(" ");

            Ban.warning(ip, reason);
            console.log(
                "warning to: " +
                ip + "," +
                reason
            );
        }
    },
    "report": {
        "help": "ip [reason]",
        "function": function(args) {
				
            let ip = args[0];
            let reason = args.slice(2).join(" ");

            Ban.addReport(ip, reason);
            console.log(
                "report to: " +
                ip + "," +
                reason
            );
        }
    },
    "addadmin": {
        "help": "ip",
        "function": function(args) {
				
            let ip = args[0];
            let reason = args.slice(2).join(" ");

            Ban.login(ip, reason);
            console.log(
                "added admin: " +
                ip + "," +
                reason
            );
        }
    },
    "removeadmin": {
        "help": "ip",
        "function": function(args) {
				
            let ip = args[0];
            let reason = args.slice(2).join(" ");

            Ban.removeLogin(ip, reason);
            console.log(
                "removed admin: " +
                ip + "," +
                reason
            );
        }
    },
    "broadcast": {
        "help": "[txt]",
        "function": function(args) {
			if (args.length === 0)
				return console.log(this.help);
				
            io.emit("broadcast",args.join(" "));
        }
    },
    "kick": {
        "help": "ip [reason]",
        "function": function(args) {
			if (args.length === 0)
				return console.log(this.help);
				
            let ip = args[0];
            let reason = args.slice(1).join(" ");

            if (reason.trim() == "") reason = undefined;

            Ban.kick(ip, reason);
            console.log(
                "kick: " +
                ip + "," +
                reason
            );
        }
    },
    "unban": {
        "help": "ip",
        "function": function(args) {
			if (args.length === 0)
				return console.log(this.help);
			
            let ip = args[0];
            Ban.removeBan(ip);
            console.log("unban: " + ip);
        }
    },
    "unmute": {
        "help": "ip",
        "function": function(args) {
			if (args.length === 0)
				return console.log(this.help);
			
            let ip = args[0];
            Ban.removeMute(ip);
            console.log("unmute: " + ip);
        }
    },
    "help": {
        "function": function() {
            let keys = Object.keys(commands);
			for (var i = 0; i < keys.length; i++) {
                let key = keys[i];
				console.log(key + ":\t" + (commands[key].help || 'N/A'));
            }
        }
    }
}

exports.listen = function() {
    process.openStdin().addListener("data", function(input) {
        try {
            let list = input.toString().trim().split(" ");
            let command = list[0].toLowerCase();
            let args = list.slice(1);
            let argsString = args.join(" ");
            commands[command].function(args);
        } catch(e) {
            console.log("Invalid command.");
            console.log(e);
        }
    });
}
