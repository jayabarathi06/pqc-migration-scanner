/**
 * Signature Verifier Module (JavaScript Sample)
 * Demonstrates ECDSA, RSA verification, and Web Cryptography patterns.
 */
const crypto = require('crypto');

function signPayloadECDSA(privateKey, data) {
  // Digital signature using ECDSA with prime256v1 curve
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(privateKey);
}

function verifyPayloadRSA(publicKey, data, signature) {
  // Digital signature verification using RSA-PSS
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  return verify.verify({
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING
  }, signature);
}

const jwtOptions = {
  algorithm: 'ES256',
  expiresIn: '1h'
};

module.exports = {
  signPayloadECDSA,
  verifyPayloadRSA,
  jwtOptions
};
