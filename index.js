const Bot = require("./bot");
const striptags = require('striptags');
const fs = require('fs');
const config = require('./config.json');

// Hardcode admins since Mastodon API doesn't provide such thing...
const admins = new Set(config.admins);

const client = new Bot(config, [{api_point: "public", events: ["update"]},
                                {api_point: "user", events: ["notification"]}]);

const commands = new Map();
const commandFiles = fs.readdirSync(__dirname + "/commands/");
for (const file of commandFiles) {
    const commandClass = require(__dirname + "/commands/" + file);
    const command = new commandClass(client);
    commands.set(command.name, command)
}

// Following list
const following = new Set();

client.start().then(() => {
    client.following_list().then((result) => {
        for(const account of result) {
            following.add(account.acct)
        }
    });
});

// When a toot arrives in Federated Timeline
client.on('update', (msg) => {
    const acct = msg.account.acct;
    const id = parseInt(msg.account.id);
    const acct_parts = acct.split('@');

    if (acct_parts.length === 1) {
        console.log('LOCAL ACCOUNT: ' + acct);
        return;
    }

    // Don't follow locked accounts
    if(msg.account.locked === true) {
        console.log("LOCKED: " + acct);
        return;
    }

    // Respect #nobot
    if (striptags(msg.account.note).match(/#nobot/i)) {
        client.mute_user(id);
        console.log("MUTED #nobot: " + acct);
    }

    // This will be... not optimal I think.
    if (following.has(acct)) {
        console.log('ALREADY FOLLOWS: ' + acct);
        return;
    }

    following.add(acct);
    client.follow(id);
    console.log("NOW FOLLOWS: " + acct);
});

// When a toto arrives in notifications (mentions)
client.on("notification", (msg) => {
    if (msg.type !== "mention") return;

    if (!admins.some((e) => { return e === msg.account.acct;})) return;

    const status = striptags(msg.status.content);

    if (!status.startsWith(client.me.acct)) return;

    const args = stripped.slice(client.me.acct + 1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    //Check if command exists
    if (!this.commands.has(commandName)) {
        return;
    }
    const command = this.commands.get(commandName);

    //Check if command is disabled
    if (command.disabled === true) return;

    //Check if command is AdminOnly
    if(command.admin_only === true && !admins.has(msg.account.acct)) return;

    //Check args length
    if (command.required_args > args) {
        return;
    }

    console.log(`CMD: ${commandName} from ${msg.account.acct}`);

    //Execute the command
    try {
        command.execute(msg, args);
    }
    catch (error) {
        console.error(error);
    }
});