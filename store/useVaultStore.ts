import { create } from 'zustand';

interface VaultState {
  fileId: string | null;
  setFileId: (id: string) => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  fileId: null,
  setFileId: (id) => set({ fileId: id }),
}));
