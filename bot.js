const EventEmitter = require('events');
const MastodonAPI = require('mastodon-api');

class Bot extends EventEmitter {
    /**
     * Constructor
     * @param {string} api_url
     * @param {string} access_token
     * @param {array} listen_on
     */
    constructor({api_url, access_token}, to_listen) {
        super();

        this.api_url = api_url || 'https://botsin.space/api/v1/';
        this.access_token = access_token;
        this.to_listen = to_listen;

        this.listeners = [];
    }

    /**
     * Run the bot
     */
    async start() {
        this.M = new MastodonAPI({
            api_url: this.api_url,
            access_token: this.access_token
        });

        for(const listen of this.to_listen) {
            this.listeners[listen] = this.M.stream('streaming/' + listen.api_point);

            this.listeners[listen].on('message', (msg) => {
                for(const event of listen.events) {
                    if (msg.event === event) {
                        this.emit(msg.event, msg.data)
                    }
                }
            })
        }

        this.me = (await this.M.get('accounts/verify_credentials')).data;
    }

    /**
     * Fav an existing toot
     * @param {int} id
     */
    fav(id) {
        this.M.post('statuses/' + id + '/favourite');
    }

    /**
     * Return a Array of Following
     * @returns {Array}
     */
    async following_list() {
        const following_list = await this.M.get('accounts/' + this.me.id + '/following');

        return following_list.data;
    }

    /**
     * Return a Array of Followers
     * @returns {Array}
     */
    async followers_list() {
        const followers_list = await this.M.get('accounts/' + this.me.id + '/followers');

        return followers_list.data;
    }

    async verify_credentials() {
        return await this.M.get('accounts/verify_credentials');
    }

    /**
     * Send a new toot
     * @param {string} toot
     * @param {string|int} visibility
     * @param {int|null} reply_to
     */
    post(toot, visibility = "unlisted", reply_to) {
        this.M.post('statuses', {
            status: toot,
            visibility: visibility,
            in_reply_to: reply_to
        })
    }

    /**
     * Reply to an existing toot
     * @param data
     * @param status
     * @param visibility
     */
    reply(data, status, visibility) {
        visibility = visibility || data.status.visibility;

        this.post(`@${data.account.acct} ${status}`, visibility, data.status.id);
    }

    /**
     * Follow a user
     * @param {int} id
     */
    follow(id) {
        this.M.post('accounts/' + id + '/follow');
    }

    /**
     * Unfollow a user
     * @param {int} id
     */
    unfollow(id) {
        this.M.post('accounts/' + id + '/unfollow');
    }

    /**
     * Mute an user
     * @param {int} id
     */
    mute_user(id) {
        this.M.post('accounts/' + id + '/mute');
    }

    /**
     * Block a domain
     * @param {string} domain
     */
    block_domain(domain) {
        this.M.post('domain_blocks', { domain });
    }
}

module.exports = Bot;