# Federation Bot

This is a work in progress.

> DISCLAIMER : Running a Federation Bot might not be a good thing. Some 
> instances admins consider that inappropriate. Please, be kind and mute
> their instance with the bot account so the bot won't follow their users.

This is a Federation Bot working with the Mastodon API.

This bot listens on the Federated Timeline and follows everyone.

This bot respect the #nobot tag.

If you don't want to be followed by the bot anymore, 
just DM "unfollow" to the bot, and it'll never follow you again.

### Commands

* __unfollow__ : The bot will unfollow and mure you so it'll never follow you again.
* __muteuser <user@domain.tld>__ : The bot will mute the targeted user. Admin only.
* __blockdomain <domain.tld>__ : The bot will mute the targeted domain. Admin only.

## Running the bot

```bash
git clone http://git.cant.at/Tagada/FederationBot.git
cd FederationBot/
npm install
cp config.json.example config.json
vi config.json
```

Edit the `config.json`.

```bash
node index.js
```