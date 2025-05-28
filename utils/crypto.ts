import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';

// Hash phone number to get key
const getAesKey = async (phone: string) => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    phone,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  return CryptoJS.enc.Hex.parse(hash);
};

// Convert random bytes from Expo to WordArray
const getRandomIV = async () => {
  const ivBytes = await Crypto.getRandomBytesAsync(16); // 16 bytes = 128 bits
  return CryptoJS.lib.WordArray.create(ivBytes);
};

export const encryptPhrases = async (phrases: string, phone: string) => {
  const key = await getAesKey(phone);
  const iv = await getRandomIV();

  const encrypted = CryptoJS.AES.encrypt(phrases, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Prepend IV to ciphertext (Base64 encode both)
  const result = iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.toString();
  return result;
};

export const decryptPhrases = async (data: string, phone: string) => {
  const key = await getAesKey(phone);
  const [ivHex, cipherText] = data.split(':');
  const iv = CryptoJS.enc.Hex.parse(ivHex);

  const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};
