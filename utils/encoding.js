const crypto = require('crypto');

module.exports.encode = (objectData) => {
	return JSON.stringify(objectData);
}

module.exports.decode = (bufferData) => {
	return JSON.parse(Buffer.from(bufferData).toString());
}

module.exports.sha256 = (data) => {
	if(typeof data === 'object') data = JSON.stringify(data);
	
	return crypto.createHash('sha256').update(data).digest('hex');
}