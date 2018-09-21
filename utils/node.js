const debug = require('debug')('node');
const ip = require('ip');
const smoke = require('smokesignal');
const {decode} = require('./encoding');
const {verify} = require('./pgp');

const node = smoke.createNode({
	port: parseInt(process.env.PORT) || 5001,
	address: ip.address(),
	seeds: [{
		port: parseInt(process.env.TESTPORT) || 5002,
		address: '127.0.0.1'
	}]
});

node.broadcast.on('data', async rawData => {
	const data = decode(rawData);
	debug("Incoming data: %o",data);
	if(data.signature && await verify(data.payload,data.signature)) {
		debug("Correct signature");
		node.emit('data',data);
		node.emit(data.type.toLowerCase(),data);
	} else {
		debug("Incorrect signature");
	}
});

node.peers.on('add', peer => {
	if(peer.remoteAddress && peer.remotePort) {
		peer.remoteLocation = peer.remoteAddress + ':' + peer.remotePort;
	} else if(peer.remoteAddress) {
		peer.remoteLocation = peer.remoteAddress;
	} else {
		peer.remoteLocation = undefined;
	}
	
	debug("Connected to new peer: %s (%s)",peer.id,peer.remoteLocation || 'Unknown IP/port');
	node.emit('addPeer',peer);
});
node.peers.on('remove', peer => {
	if(peer.remoteAddress && peer.remotePort) {
		peer.remoteLocation = peer.remoteAddress + ':' + peer.remotePort;
	} else if(peer.remoteAddress) {
		peer.remoteLocation = peer.remoteAddress;
	} else {
		peer.remoteLocation = undefined;
	}
	
	debug("Lost connection with peer: %s (%s)",peer.id,peer.remoteLocation || 'Unknown IP/port');
	node.emit('removePeer',peer);
});

node.on('connect', () => debug("Connected to first peer"));
node.on('disconnect', () => debug("Disconnected from last peer"));

module.exports = node;