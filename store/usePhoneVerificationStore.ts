import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface PhoneVerificationState {
    verifiedPhones: Record<string, number>; // phoneNumber -> expirationTimestamp
    isPhoneVerified: (phone: string) => boolean;
    markPhoneAsVerified: (phone: string) => Promise<void>;
    clearExpiredVerifications: () => Promise<void>;
}

export const usePhoneVerificationStore = create<PhoneVerificationState>((set, get) => ({
    verifiedPhones: {},

    isPhoneVerified: (phone: string) => {
        const state = get();
        const expiration = state.verifiedPhones[phone];
        if (!expiration) return false;
        return Date.now() < expiration;
    },

    markPhoneAsVerified: async (phone: string) => {
        const expiration = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days

        set((state) => {
            const newVerified = { ...state.verifiedPhones, [phone]: expiration };
            return { verifiedPhones: newVerified };
        });

        // Persist to AsyncStorage
        try {
            await AsyncStorage.setItem(
                '@phone_verifications',
                JSON.stringify(get().verifiedPhones)
            );
        } catch (e) {
            console.error('Failed to save phone verification', e);
        }
    },

    clearExpiredVerifications: async () => {
        const now = Date.now();
        set((state) => {
            const filtered = Object.fromEntries(
                Object.entries(state.verifiedPhones).filter(([_, exp]) => exp > now)
            );
            return { verifiedPhones: filtered };
        });

        try {
            await AsyncStorage.setItem(
                '@phone_verifications',
                JSON.stringify(get().verifiedPhones)
            );
        } catch (e) {
            console.error(e);
        }
    },
}));

// Load from storage on app start (call this in your root component)
export const loadPhoneVerifications = async () => {
    try {
        const stored = await AsyncStorage.getItem('@phone_verifications');
        if (stored) {
            const parsed = JSON.parse(stored);
            usePhoneVerificationStore.setState({ verifiedPhones: parsed });
            await usePhoneVerificationStore.getState().clearExpiredVerifications();
        }
    } catch (e) {
        console.error('Failed to load phone verifications', e);
    }
};