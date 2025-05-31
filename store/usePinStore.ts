import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PinState {
  pin: string | null;
  hasPin: boolean;
  setPin: (pin: string) => void;
  clearPin: () => void;
}

export const usePinStore = create<PinState>()(
  persist(
    (set) => ({
      pin: null,
      hasPin: false,
      setPin: (newPin: string) => set({ pin: newPin, hasPin: true }),
      clearPin: () => set({ pin: null, hasPin: false }),
    }),
    {
      name: 'pin-storage',
      storage: createJSONStorage(() => AsyncStorage), 
    }
  )
);