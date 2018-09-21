const debug = require('debug')('app');
const db = require('./utils/db');
const pgp = require('./utils/pgp');
const node = require('./utils/node');
const web = require('./utils/express');
const {broadcastHandshake,broadcastCommand,broadcastReport} = require('./utils/broadcast');

(async () => {
	await db.init();
	await pgp.init();
	
	node.on('connect', () => {
		broadcastReport({
			url: "https://malicious.example",
			category: "Phishing"
		});
		broadcastCommand('ADD',{
			url: "https://malicious.example",
			category: "Phishing"
		});
	});
	
	node.on('addPeer', peer => broadcastHandshake());

	node.on('handshake', data => {
		
	});

	node.on('report', data => {
		db.addReport(data.payload);
	});
	
	node.on('signature', data => {
		
	});
	
	node.on('command', data => {
		db.addCommand(data.payload);
	});

	node.start();
	
	if(process.env.API) await web.start();

	debug("Started node on port %s",node.options.port);
})();