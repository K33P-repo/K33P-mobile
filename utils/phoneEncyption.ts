import CryptoJS from 'crypto-js';

const deriveKeyFromPhone = (phoneNumber: string): string => {
  const normalizedPhone = phoneNumber.replace(/\D/g, '');
  const salt = CryptoJS.SHA512(`phone-key-salt:${normalizedPhone}`).toString();
  const derivedKey = CryptoJS.PBKDF2(normalizedPhone, salt, {
    keySize: 256 / 32,
    iterations: 1000, // was 100000
  });
  return derivedKey.toString(CryptoJS.enc.Hex);
};

export const encryptPhoneData = (phoneNumber: string): string => {
  try {
    const encryptionKey = deriveKeyFromPhone(phoneNumber);
    const key = CryptoJS.enc.Hex.parse(encryptionKey);
    
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(phoneNumber),
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    
    return encrypted.toString();
  } catch (error) {
    throw new Error('Failed to encrypt phone data');
  }
};

export const decryptPhoneData = (encryptedData: string, phoneNumber: string): string => {
  try {
    const encryptionKey = deriveKeyFromPhone(phoneNumber);
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
    throw new Error('Failed to decrypt phone data');
  }
};