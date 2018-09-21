const fs = require('fs-extra');
const url = require('url');
const path = require('path');
const {serialize,deserialize} = require("serialijse");
const {sha256} = require('./encoding');
const debug = require('debug')('db');

/* Define empty database structure */
const db = {
	reports: {},
	entries: {},
	commands: {}
};

const persist = async () => {
	debug("Persisting db...");
	await fs.writeFile('./cache.db',serialize(db));
}

/* Write DB on exit */
const exitHandler = () => {
	process.stdin.resume();
	console.log("Cleaning up...");
	fs.writeFileSync('./cache.db',serialize(db));
	console.log("Exited.");
	process.exit(1);
}

module.exports.init = async () => {
	const cacheExists = await fs.pathExists('./cache.db');
	if(cacheExists) {
		const oldCache = await fs.readFile('./cache.db','utf8');
		Object.assign(db,deserialize(oldCache));
	}
	await persist();
	setInterval(persist,10*1000);
	process.once('beforeExit', exitHandler);
	process.once('SIGINT', exitHandler);
	process.once('SIGTERM', exitHandler);
}

module.exports.read = () => db;

module.exports.write = persist;

module.exports.addReport = (entry) => {
	const id = sha256(entry);
	db.reports[id] = {
		id: id,
		time: Date.now(),
		data: entry
	};
	return db.reports[id];
}

module.exports.addCommand = (entry) => {
	const id = sha256(entry);
	db.commands[id] = {
		id: id,
		submitter: null,
		time: Date.now(),
		signatures: [],
		data: entry
	};
	return db.commands[id];
}