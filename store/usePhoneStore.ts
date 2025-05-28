import { create } from 'zustand';

interface PhoneStore {
  phoneNumber: string;
  formattedNumber: string;
  setPhoneNumber: (number: string) => void;
  setFormattedNumber: (number: string) => void;
  clearNumbers: () => void;
}

export const usePhoneStore = create<PhoneStore>((set) => ({
  phoneNumber: '', 
  formattedNumber: '',
  setPhoneNumber: (number: string) => set({ phoneNumber: number }),
  setFormattedNumber: (number: string) => set({ formattedNumber: number }),
  clearNumbers: () => set({ phoneNumber: '', formattedNumber: '' })
}));