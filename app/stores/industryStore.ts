import { create } from 'zustand';
import { Industry } from '../types';

interface IndustryStore {
  selectedIndustry: Industry | null;
  setSelectedIndustry: (industry: Industry | null) => void;
}

export const useIndustryStore = create<IndustryStore>((set) => ({
  selectedIndustry: null,
  setSelectedIndustry: (industry) => set({ selectedIndustry: industry }),
}));
