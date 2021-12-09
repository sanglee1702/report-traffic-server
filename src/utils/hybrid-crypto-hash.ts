import { envConfig } from '../config/env.config';
import { Crypt } from 'hybrid-crypto-js';
import { HYBRID_CRYTO_RSA_STANDARD } from '../config';

const privateKey = envConfig.PRIVATE_KEY_PAYMENT;
const publicKey = envConfig.PUPLIC_KEY_PAYMENT;

// Select AES or RSA standard
const crypt = new Crypt({
  // Default RSA standard is RSA-OAEP. Options are:
  // RSA-OAEP, RSAES-PKCS1-V1_5
  rsaStandard: HYBRID_CRYTO_RSA_STANDARD,
});

const encryption = (data: Object): string => {
  try {
    // Encryption with one public RSA key
    const encrypted = crypt.encrypt(publicKey, JSON.stringify(data));

    return encrypted;
  } catch (err) {
    return null;
  }
};
const decryption = (value: string): any => {
  try {
    const decrypted = crypt.decrypt(privateKey, value);

    const message = decrypted.message;

    return JSON.parse(message);
  } catch (err) {
    return null;
  }
};
const HybridCryptoHash = {
  encryption,
  decryption,
};

export default HybridCryptoHash;
