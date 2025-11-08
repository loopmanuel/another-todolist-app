import { create } from 'zustand';

type TaskFormState = {
  selectedLabels: Set<string>;
  setSelectedLabels: (labels: Set<string>) => void;
  clearSelectedLabels: () => void;
};

export const useTaskFormStore = create<TaskFormState>((set) => ({
  selectedLabels: new Set(),
  setSelectedLabels: (labels) => set({ selectedLabels: labels }),
  clearSelectedLabels: () => set({ selectedLabels: new Set() }),
}));
