const Bot = require("./bot");
const striptags = require('striptags');
const config = require('./config.json');

const client = new Bot(config, [{api_point: "public", events: ["update"]},
                                {api_point: "user", events: ["notification"]}]);

// Following list
const following = [];

client.start().then(() => {
    client.following_list().then((result) => {
        for(const account of result) {
            following.push(account.acct)
        }
    });
});

client.on('update', (msg) => {
    const acct = msg.account.acct;
    const id = parseInt(msg.account.id);
    const acct_parts = acct.split('@');

    if (acct_parts.length === 1) {
        console.log('LOCAL ACCOUNT: ' + acct);
        return;
    }

    // This will be... not optimal I think.
    for (const follow of following) {
        if (follow === acct) {
            console.log('ALREADY FOLLOWS: ' + acct);
            return;
        }
    }

    // Respect #nobot
    if (striptags(msg.account.note).match(/#nobot/i)) {
        client.mute_user(id);
        console.log("MUTED #nobot: " + acct);
    }

    following.push(acct);
    client.follow(id);
    console.log("NOW FOLLOWS: " + acct);
});

client.on("notification", (msg) => {
    if (msg.type !== "mention") return;

    // Todo: Implement unfollow command
    // Todo: Implement blockuser command
    // Todo: Implement blockdomain command
});