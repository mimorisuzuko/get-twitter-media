'use strict'

const prominence = require('prominence');
const Twitter = require('twitter');
const co = require('co');
const fs = require('fs');
const rp = require('request-promise');

const name = process.argv[2];
const twitter = new Twitter({
	consumer_key: '',
	consumer_secret: '',
	access_token_key: '',
	access_token_secret: ''
});

try{
	fs.accessSync(name);
}catch(e){
	fs.mkdirSync(name);
}

co(function* (){
	let id = 1699835811240370177;
	while(true){
		const tws = yield prominence(twitter).get('statuses/user_timeline', {screen_name: name, count: 200, max_id: id});
		if(tws.length === 0){
			break;
		}
		for(let t of tws){
			if(t['retweeted_status'] !== undefined){
				continue;
			}
			id = t['id']+1;
			const media = t['entities']['media'];
			if(media === undefined){
				continue;
			}
			for(let m of media){
				const url = m['media_url'];
				console.log(url);
				const b = yield rp({method: 'GET', url: url, encoding: null});
				fs.writeFileSync(name+'/'+url.split('/').pop(), b, 'binary');
			}
		}
	}
});
