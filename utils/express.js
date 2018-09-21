const debug = require('debug')('web');
const {name,version} = require('../package.json');
const db = require('./db');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
	res.send(name + ' ' + version);
});

app.get('/reports', (req, res) => {
	res.json(db.read().reports);
});

app.get('/commands', (req, res) => {
	res.json(db.read().commands);
});

app.get('/entries', (req, res) => {
	res.json(db.read().entries);
});

module.exports.start = () => {
	return new Promise(resolve => {
		app.listen(80, () => {
			debug("API listening on port 80");
			resolve();
		});
	});
}