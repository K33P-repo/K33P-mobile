import CryptoJS from 'crypto-js';

const derivePinKey = (pin: string, userId: string): string => {
  const combined = `${pin}:${userId}`;
  const derived = CryptoJS.PBKDF2(combined, userId, {
    keySize: 256 / 32,
    iterations: 1000, // was 100000
  });
  return derived.toString(CryptoJS.enc.Hex);
};

export const encryptPinData = (pin: string, userId: string): string => {
  try {
    const encryptionKey = derivePinKey(pin, userId);
    const key = CryptoJS.enc.Hex.parse(encryptionKey);
    
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(pin),
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    
    return encrypted.toString();
  } catch (error) {
    throw new Error('Failed to encrypt PIN');
  }
};

export const decryptPinData = (encryptedData: string, pin: string, userId: string): string => {
  try {
    const encryptionKey = derivePinKey(pin, userId);
    const key = CryptoJS.enc.Hex.parse(encryptionKey);
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      throw new Error('Decryption failed');
    }
    
    return decryptedText;
  } catch (error) {
    throw new Error('Failed to decrypt PIN');
  }
};

export const hashPin = (pin: string, userId: string): string => {
  try {
    const hash = CryptoJS.PBKDF2(pin, userId, {
      keySize: 512 / 32,
      iterations: 1000, // was 150000
    });
    
    return hash.toString(CryptoJS.enc.Hex);
  } catch (error) {
    throw new Error('Failed to hash PIN');
  }
};