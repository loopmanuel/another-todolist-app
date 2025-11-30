import { create } from 'zustand';

type PatternSuggestionsState = {
  // Track which patterns have been dismissed by the user
  dismissedPatterns: Set<string>;

  // Actions
  dismissPattern: (patternKey: string) => void;
  dismissAllCurrentPatterns: (patternKeys: string[]) => void;
  clearDismissedPatterns: () => void;
};

export const usePatternSuggestionsStore = create<PatternSuggestionsState>((set) => ({
  dismissedPatterns: new Set(),

  dismissPattern: (patternKey) =>
    set((state) => {
      const newDismissed = new Set(state.dismissedPatterns);
      newDismissed.add(patternKey);
      return { dismissedPatterns: newDismissed };
    }),

  dismissAllCurrentPatterns: (patternKeys) =>
    set((state) => {
      const newDismissed = new Set(state.dismissedPatterns);
      patternKeys.forEach((key) => newDismissed.add(key));
      return { dismissedPatterns: newDismissed };
    }),

  clearDismissedPatterns: () => set({ dismissedPatterns: new Set() }),
}));
