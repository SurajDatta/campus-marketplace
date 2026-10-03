// used to generate the private key used to encrypt/decrypt the data sent in hashes
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');
console.log(secretKey);
