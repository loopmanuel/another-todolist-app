import { create } from 'zustand';
import dayjs from 'dayjs';

type DatePickerState = {
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  clearDate: () => void;
  getFormattedDate: (format?: string) => string | null;
  getTodayLocal: () => string;
};

// Helper: "YYYY-MM-DD" in LOCAL time (avoids UTC off-by-one)
function todayLocal(): string {
  return dayjs().format('YYYY-MM-DD');
}

export const useDatePickerStore = create<DatePickerState>((set, get) => ({
  selectedDate: null,

  setSelectedDate: (date) => set({ selectedDate: date }),

  clearDate: () => set({ selectedDate: null }),

  getFormattedDate: (format = 'YYYY-MM-DD') => {
    const { selectedDate } = get();
    if (!selectedDate) return null;
    return dayjs(selectedDate).format(format);
  },

  getTodayLocal: () => todayLocal(),
}));
