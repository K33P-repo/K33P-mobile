import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';

/**
 * Derive encryption keys from user-specific data
 * No hardcoded keys in the app!
 */
export class UserKeyManager {
  private static readonly ITERATIONS = 100000;
  private static readonly KEY_SIZE = 256 / 32;

  /**
   * Generate a user-specific encryption key from their credentials
   * This creates a unique key per user that's never stored in plain text
   */
  static deriveUserKey(
    userId: string,
    userPassword: string,
    purpose: 'phone' | 'pin'
  ): string {
    // Use different salts for different purposes
    const salt = CryptoJS.SHA256(`${userId}:${purpose}:salt`).toString();
    
    const key = CryptoJS.PBKDF2(userPassword, salt, {
      keySize: this.KEY_SIZE,
      iterations: this.ITERATIONS,
    });

    return key.toString();
  }

  /**
   * Store a derived key securely on the device
   * Only accessible when device is unlocked
   */
  static async storeDerivedKey(
    userId: string,
    purpose: 'phone' | 'pin',
    key: string
  ): Promise<void> {
    const keyName = `user_${userId}_${purpose}_key`;
    await SecureStore.setItemAsync(keyName, key, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  }

  /**
   * Retrieve a stored derived key
   */
  static async getDerivedKey(
    userId: string,
    purpose: 'phone' | 'pin'
  ): Promise<string | null> {
    const keyName = `user_${userId}_${purpose}_key`;
    return await SecureStore.getItemAsync(keyName);
  }

  /**
   * Clear all keys for a user (on logout)
   */
  static async clearUserKeys(userId: string): Promise<void> {
    await SecureStore.deleteItemAsync(`user_${userId}_phone_key`);
    await SecureStore.deleteItemAsync(`user_${userId}_pin_key`);
  }
}