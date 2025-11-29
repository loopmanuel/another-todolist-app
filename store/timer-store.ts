import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'timer-storage' });

export interface TimerSession {
  id: string;
  taskId: string;
  taskTitle: string;
  startTime: number; // Unix timestamp in milliseconds
  pausedAt?: number; // Unix timestamp when paused
  accumulatedTime: number; // Total accumulated time in milliseconds
  isPaused: boolean;
}

interface TimerStore {
  sessions: TimerSession[];

  // Actions
  startTimer: (taskId: string, taskTitle: string) => void;
  pauseTimer: (sessionId: string) => void;
  resumeTimer: (sessionId: string) => void;
  stopTimer: (sessionId: string) => number; // Returns total time in minutes
  getActiveTime: (sessionId: string) => number; // Returns current elapsed time in milliseconds
  hasActiveTimer: (taskId: string) => boolean;
  getSessionByTaskId: (taskId: string) => TimerSession | undefined;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

// Helper to generate unique ID
const generateId = () => `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to load sessions from storage
const loadSessions = (): TimerSession[] => {
  try {
    const stored = storage.getString('timer-sessions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load timer sessions:', error);
    return [];
  }
};

// Helper to save sessions to storage
const saveSessions = (sessions: TimerSession[]) => {
  try {
    storage.set('timer-sessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save timer sessions:', error);
  }
};

export const useTimerStore = create<TimerStore>((set, get) => ({
  sessions: loadSessions(),

  startTimer: (taskId: string, taskTitle: string) => {
    const now = Date.now();
    const newSession: TimerSession = {
      id: generateId(),
      taskId,
      taskTitle,
      startTime: now,
      accumulatedTime: 0,
      isPaused: false,
    };

    set((state) => {
      const newSessions = [...state.sessions, newSession];
      saveSessions(newSessions);
      return { sessions: newSessions };
    });
  },

  pauseTimer: (sessionId: string) => {
    const now = Date.now();
    set((state) => {
      const newSessions = state.sessions.map((session) => {
        if (session.id === sessionId && !session.isPaused) {
          const elapsed = now - session.startTime;
          return {
            ...session,
            pausedAt: now,
            accumulatedTime: session.accumulatedTime + elapsed,
            isPaused: true,
          };
        }
        return session;
      });
      saveSessions(newSessions);
      return { sessions: newSessions };
    });
  },

  resumeTimer: (sessionId: string) => {
    const now = Date.now();
    set((state) => {
      const newSessions = state.sessions.map((session) => {
        if (session.id === sessionId && session.isPaused) {
          return {
            ...session,
            startTime: now,
            pausedAt: undefined,
            isPaused: false,
          };
        }
        return session;
      });
      saveSessions(newSessions);
      return { sessions: newSessions };
    });
  },

  stopTimer: (sessionId: string) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) return 0;

    const totalTime = get().getActiveTime(sessionId);
    const totalMinutes = Math.round(totalTime / 1000 / 60);

    set((state) => {
      const newSessions = state.sessions.filter((s) => s.id !== sessionId);
      saveSessions(newSessions);
      return { sessions: newSessions };
    });

    return totalMinutes;
  },

  getActiveTime: (sessionId: string) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) return 0;

    if (session.isPaused) {
      return session.accumulatedTime;
    }

    const now = Date.now();
    const currentElapsed = now - session.startTime;
    return session.accumulatedTime + currentElapsed;
  },

  hasActiveTimer: (taskId: string) => {
    return get().sessions.some((s) => s.taskId === taskId);
  },

  getSessionByTaskId: (taskId: string) => {
    return get().sessions.find((s) => s.taskId === taskId);
  },

  loadFromStorage: () => {
    set({ sessions: loadSessions() });
  },

  saveToStorage: () => {
    saveSessions(get().sessions);
  },
}));

// Format milliseconds to HH:MM:SS
export function formatElapsedTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
