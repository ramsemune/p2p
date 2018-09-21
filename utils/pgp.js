const debug = require('debug')('openpgp');
const openpgp = require('openpgp');
const config = require('./config');
const {encode,decode} = require('./encoding');
const fs = require('fs-extra');

let pubKey = undefined;
let privKey = undefined;
let privKeyObj = undefined;

module.exports.init = async () => {
	pubKey = await fs.readFile('./pub.key','utf8');
	privKey = await fs.readFile('./priv.key','utf8');
	privKeyObj = (await openpgp.key.readArmored(privKey)).keys[0];
	await privKeyObj.decrypt(config.pgp.passphrase);
}

module.exports.sign = async (data) => {
	const signed = await openpgp.sign({
		message: openpgp.cleartext.fromText(encode(data)),
		privateKeys: [privKeyObj]
	});
	
	return signed.data;
}

module.exports.verify = async (data,signature) => {
	const verified = await openpgp.verify({
		message: openpgp.cleartext.fromText(encode(data)),
		signature: await openpgp.signature.readArmored(signature),
		publicKeys: (await openpgp.key.readArmored(pubKey)).keys
	});
	
	const validity = verified.signatures[0].valid;
	
	if (validity) {
		console.log('signed by key id ' + verified.signatures[0].keyid.toHex());
	}
	
	return validity;
}