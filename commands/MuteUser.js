const CommandBase = require('../CommandBase');

class MuteUser extends CommandBase {
    constructor(client) {
        super(client);
        this.name = 'muteuser';
        this.admin_only = true;
        this.required_args = 1;
    }

    execute(msg, args) {
        this.client.mute_user(args[0]);

        this.client.fav(msg.status.id);
    }
}

module.exports = MuteUser;