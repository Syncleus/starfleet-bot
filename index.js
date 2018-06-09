const Bot = require("./bot");
const config = require('./config.json');

const client = new Bot(config, {to_listen: [{api_point: "public", events: ["update"]},
                                            {api_point: "user", events: ["notification"]}]});

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

    //Todo: Implement #nobot detection

    following.push(acct);
    client.follow(acct);
    console.log("NOW FOLLOWS: " + acct);
});

client.on("notification", (msg) => {
    if (msg.type !== "mention") return;

    // Todo: Implement unfollow command
    // Todo: Implement blockuser command
    // Todo: Implement blockdomain command
});