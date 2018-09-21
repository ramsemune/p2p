const fs = require('fs-extra');
const debug = require('debug')('config');

if (!fs.existsSync('./config.json')) {
	throw new Error("No config file found");
	process.exit();
} else {
	const config = require('../config.json');
	module.exports = config;
}