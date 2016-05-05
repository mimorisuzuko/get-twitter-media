'use strict';

const Twitter = require('twitter');
const co = require('co');
const config = require('./config.json');
const rp = require('request-promise');
const fs = require('fs');

const twitter = new Twitter({
	consumer_key: config.consumer_key,
	consumer_secret: config.consumer_secret,
	access_token_key: config.access_token_key,
	access_token_secret: config.access_token_secret
});
const name = process.argv[2];

/**
 * @param {Object} option
 */
const getUserTimeline = (option) => {
	return new Promise((resolve, reject) => {
		twitter.get('statuses/user_timeline', option, (err, tweets, res) => {
			if (err) {
				console(err);
			}
			resolve(tweets);
		});
	});
};

const option = {
	screen_name: 'iRis_s_yu',
	count: 200
};

try {
	fs.accessSync(name);
} catch (e) {
	fs.mkdirSync(name);
}

co(function* () {
	while (true) {
		const tweets = yield getUserTimeline(option);
		if (tweets.length === 0) {
			break;
		}
		console.log(tweets.length);
		for (let tweet of tweets) {
			option.max_id = tweet.id_str;
			if (tweet.hasOwnProperty('retweeted_status') || !tweet.entities.hasOwnProperty('media')) {
				continue;
			}
			for (let media of tweet.entities.media) {
				const url = media.media_url;
				const b = yield rp(url, { encoding: null });
				fs.writeFileSync(`${name}/${url.split('/').pop()}`, b, 'binary');
				console.log(url);
			}
		}
	}
});