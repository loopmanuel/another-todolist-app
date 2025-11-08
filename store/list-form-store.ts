import { create } from 'zustand';

type ListFormState = {
  selectedColor: string | null;
  setSelectedColor: (color: string | null) => void;
  clearSelectedColor: () => void;
};

export const useListFormStore = create<ListFormState>((set) => ({
  selectedColor: null,
  setSelectedColor: (color) => set({ selectedColor: color }),
  clearSelectedColor: () => set({ selectedColor: null }),
}));
