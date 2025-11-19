import { create } from 'zustand';

type TaskFormState = {
  selectedLabels: Set<string>;
  setSelectedLabels: (labels: Set<string>) => void;
  addLabel: (labelId: string) => void;
  clearSelectedLabels: () => void;
  priority: number;
  setPriority: (priority: number) => void;
  clearPriority: () => void;
  editingTaskId: string | null;
  setEditingTaskId: (taskId: string | null) => void;
  clearAll: () => void;
};

export const useTaskFormStore = create<TaskFormState>((set) => ({
  selectedLabels: new Set(),
  setSelectedLabels: (labels) => set({ selectedLabels: labels }),
  addLabel: (labelId) =>
    set((state) => {
      const newLabels = new Set(state.selectedLabels);
      newLabels.add(labelId);
      return { selectedLabels: newLabels };
    }),
  clearSelectedLabels: () => set({ selectedLabels: new Set() }),
  priority: 0,
  setPriority: (priority) => set({ priority }),
  clearPriority: () => set({ priority: 0 }),
  editingTaskId: null,
  setEditingTaskId: (taskId) => set({ editingTaskId: taskId }),
  clearAll: () =>
    set({
      selectedLabels: new Set(),
      priority: 0,
      editingTaskId: null,
    }),
}));
