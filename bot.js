const EventEmitter = require('events');
const MastodonAPI = require('mastodon-api');
const wurl = require('wurl');

class Bot extends EventEmitter {
    /**
     * Constructor
     * @param {string} api_url
     * @param {string} access_token
     * @param {array} to_listen
     */
    constructor({api_url, access_token}, to_listen) {
        super();

        this.api_url = api_url || 'https://botsin.space/api/v1/';
        this.access_token = access_token;
        this.to_listen = to_listen;

        this.listeners = new WeakMap();
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
            this.listeners.set(listen, this.M.stream('streaming/' + listen.api_point));

            this.listeners.get(listen).on('message', (msg) => {
                if (msg.event === listen.event) {
                    this.emit(listen.emit_on, msg.data)
                }
            })
        }

        this.me = (await this.verify_credentials());
    }

    async verify_credentials() {
        return (await this.M.get('accounts/verify_credentials')).data;
    }

    /**
     * Return a Array of Following
     * @returns {Array}
     */
    async following_list() {
        let result = [];
        let next_id = 0;

        for (let i = 0; true; i++) {
            let test;

            if (next_id === 0) {
                test = await this.M.get('accounts/' + this.me.id + '/following', {limit: 80});
            } else {
                test = await this.M.get('accounts/' + this.me.id + '/following', {limit: 80, max_id:next_id});
            }

            next_id = parseInt(wurl('?max_id' ,test.resp.headers.link.split(",")[0].split(';')[0].slice(1, -1)));

            result = result.concat(test.data);

            if(test.data.length < 80) break;
        }

        return result;
    }

    /**
     * Return a Array of Followers
     * @returns {Array}
     */
    async followers_list() {
        let result = [];
        let next_id = 0;

        for (let i = 0; true; i++) {
            let test;

            if (next_id === 0) {
                test = await client.M.get('accounts/' + client.me.id + '/followers', {limit: 80});
            } else {
                test = await client.M.get('accounts/' + client.me.id + '/followers', {limit: 80, max_id:next_id});
            }

            next_id = parseInt(wurl('?max_id' ,test.resp.headers.link.split(",")[0].split(';')[0].slice(1, -1)));

            result = result.concat(test.data);

            if(test.data.length < 80) break;
        }

        return result;
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
     * Fav an existing toot
     * @param {int} id
     */
    fav(id) {
        this.M.post('statuses/' + id + '/favourite');
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