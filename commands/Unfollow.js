const CommandBase = require('../CommandBase');

class Unfollow extends CommandBase {
    constructor(client) {
        super(client);
        this.name = 'unfollow';
    }

    execute(msg) {
        this.client.unfollow(msg.account.id);

        this.client.mute_user(msg.account.id);

        this.client.fav(msg.status.id);
    }
}

module.exports = Unfollow;