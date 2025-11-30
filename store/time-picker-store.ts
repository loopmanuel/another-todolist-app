import { create } from 'zustand';

type TimePickerState = {
  selectedTime: number | null; // Time in minutes
  context: string | null; // 'estimated' or 'actual' or any other identifier
  setSelectedTime: (minutes: number | null, context?: string) => void;
  clearTime: () => void;
  getFormattedTime: () => string | null;
  getContext: () => string | null;
};

// Helper: Format minutes to "Xh Ym" format
function formatMinutes(minutes?: number | null): string | null {
  if (!minutes || minutes === 0) return null;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export const useTimePickerStore = create<TimePickerState>((set, get) => ({
  selectedTime: null,
  context: null,

  setSelectedTime: (minutes, context = null) =>
    set({ selectedTime: minutes, context: context }),

  clearTime: () => set({ selectedTime: null, context: null }),

  getFormattedTime: () => {
    const { selectedTime } = get();
    return formatMinutes(selectedTime);
  },

  getContext: () => {
    const { context } = get();
    return context;
  },
}));
