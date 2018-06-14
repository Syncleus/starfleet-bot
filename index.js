const Bot = require("./bot");
const striptags = require('striptags');
const fs = require('fs');
const config = require('./config.json');

// Init
const client = new Bot(config, [{api_point: "public", event: "update", emit_on: "federated"},
    {api_point: "user", event: "notification", emit_on: "mentions"},
    {api_point: "user", event: "update", emit_on: "home"}]);

const admins = new Set(config.admins);

const following = new Set();

const commands = new Map();
const commandFiles = fs.readdirSync(__dirname + "/commands/");
for (const file of commandFiles) {
    const commandClass = require(__dirname + "/commands/" + file);
    const command = new commandClass(client);
    commands.set(command.name, command)
}

// Start the bot and populate following
client.start().then(() => {
    client.following_list().then((result) => {
        for (const account of result) following.add(account.acct)

        console.log(`I'm currently following ${following.size} accounts.`)
    });

    console.log("Federation Bot started ! 🎉")
});

// When a toot arrives in Federated Timeline
client.on('federated', (msg) => {
    follow_or_not_follow(msg);
});

// Listen reblogs on Home
client.on('home', (msg) => {
    if (msg.reblog !== null) follow_or_not_follow(msg.reblog);
});

function follow_or_not_follow(msg) {
    const acct = msg.account.acct;
    const id = parseInt(msg.account.id);
    const acct_parts = acct.split('@');

    // Don't follow local accounts
    if (acct_parts.length === 1) return;

    // Don't follow locked accounts
    if (msg.account.locked === true) return;

    // Don't follow other bots
    if (msg.account.bot === true) return;

    // Respect #nobot
    if (striptags(msg.account.note).match(/#nobot/i)) {
        client.mute_user(id);
        console.log("MUTED #nobot: " + acct);
        return;
    }

    // Already following. (This will be... not optimal I think.)
    if (following.has(acct)) return;

    following.add(acct);
    client.follow(id);
    console.log("NOW FOLLOWS: " + acct);
}

// When a toot mention the bot
client.on("mentions", (msg) => {
    if (msg.type !== "mention") return;

    const status = striptags(msg.status.content);

    const full_acct = '@' + client.me.acct;

    // Starting with @username@domain or @username (local toots)
    if (!status.startsWith(full_acct) || !status.startsWith('@' + client.me.username)) return;

    const args = status.slice(client.me.acct.length + 1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check if command exists
    if (!commands.has(commandName)) return;

    const command = commands.get(commandName);

    // Check if command is disabled
    if (command.disabled === true) return;

    // Check if command is AdminOnly
    if (command.admin_only === true && !admins.has(msg.account.acct)) return;

    //Check args length
    if (command.required_args > args) return;

    console.log(`CMD: ${commandName} from ${msg.account.acct}`);

    // Execute the command
    try {
        command.execute(msg, args);
    }
    catch (error) {
        console.error(error);
    }
});

process.on('SIGINT', () => {
    console.info("Exiting...");
    process.exit();
});
