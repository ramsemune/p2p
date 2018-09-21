const debug = require('debug')('broadcast');
const node = require('./node');
const config = require('./config');
const {version} = require('../package.json');
const {encode} = require('./encoding');
const {sign} = require('./pgp');

const broadcast = async (type,payload) => node.broadcast.write(encode({
	client: {
		id: config.id,
		key: config.pgp.public,
		version: version
	},
	type: type,
	payload: payload,
	signature: await sign(payload)
}));

module.exports.broadcastHandshake = () => {
	debug("Broadcasting handshake");
	broadcast('HANDSHAKE', {
		id: config.id,
		key: config.pgp.public,
		version: version
	});
}

module.exports.broadcastReport = (data) => {
	debug("Broadcasting report: %o",data);
	broadcast('REPORT', data);
}

module.exports.broadcastCommand = (command,data) => {
	debug("Broadcasting command %s: %o",command,data);
	data.type = command;
	broadcast('COMMAND', data);
}

