const CommandBase = require('../CommandBase');

class BlockDomain extends CommandBase {
    constructor(client) {
        super(client);
        this.name = 'blockdomain';
        this.admin_only = true;
        this.required_args = 1;
    }

    execute(msg, args) {
        this.client.block_domain(args[0]);

        this.client.fav(msg.status.id);
    }
}

module.exports = BlockDomain;