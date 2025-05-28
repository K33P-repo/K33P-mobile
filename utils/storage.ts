// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const WALLET_STORAGE_KEY = 'selected_wallets';

interface Wallet {
    id: string;
    name: string;
    keyType?: '12' | '24';
    fileId?: string;
  }
  
export const getStoredWallets = async (): Promise<Wallet[]> => {
  const json = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const storeWallets = async (wallets: Wallet[]) => {
  await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallets));
};

export const addWallets = async (newWallets: Wallet[]) => {
  const current = await getStoredWallets();
  const unique = [
    ...current,
    ...newWallets.filter(w => !current.some(c => c.id === w.id)),
  ];
  await storeWallets(unique);
  return unique;
};
