import AsyncStorage from '@react-native-async-storage/async-storage';

const ALL_USERS_WALLETS_STORAGE_KEY = 'all_users_wallets'; // New key for the global storage

interface Wallet {
  id: string;
  name: string;
  keyType?: '12' | '24';
  fileId?: string;
}

// Helper to generate a unique key for a user (phone number + pin hash)
const getUserStorageKey = (phoneNumber: string, pin: string): string => {
  return `${phoneNumber}_${pin}`; 
};

export const getStoredWallets = async (phoneNumber: string, pin: string): Promise<Wallet[]> => {
  if (!phoneNumber || !pin) {
    console.error('getStoredWallets: Phone number or PIN is missing.');
    return [];
  }
  const userKey = getUserStorageKey(phoneNumber, pin);
  const json = await AsyncStorage.getItem(ALL_USERS_WALLETS_STORAGE_KEY);
  const allUsersWallets: Record<string, Wallet[]> = json ? JSON.parse(json) : {};
  return allUsersWallets[userKey] || [];
};

export const storeWallets = async (wallets: Wallet[], phoneNumber: string, pin: string) => {
  if (!phoneNumber || !pin) {
    console.error('storeWallets: Phone number or PIN is missing. Wallets not stored.');
    return;
  }
  const userKey = getUserStorageKey(phoneNumber, pin);
  const json = await AsyncStorage.getItem(ALL_USERS_WALLETS_STORAGE_KEY);
  const allUsersWallets: Record<string, Wallet[]> = json ? JSON.parse(json) : {};

  allUsersWallets[userKey] = wallets; // Store wallets specific to this user key
  await AsyncStorage.setItem(ALL_USERS_WALLETS_STORAGE_KEY, JSON.stringify(allUsersWallets));
};

export const addWallets = async (newWallets: Wallet[], phoneNumber: string, pin: string) => {
  if (!phoneNumber || !pin) {
    console.error('addWallets: Phone number or PIN is missing. Wallets not added.');
    return [];
  }
  const current = await getStoredWallets(phoneNumber, pin);
  const unique = [
    ...current,
    ...newWallets.filter(w => !current.some(c => c.id === w.id)),
  ];
  await storeWallets(unique, phoneNumber, pin);
  return unique;
};