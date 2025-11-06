import { supabase } from '@/utils/supabase';
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  initialized: boolean;
  submitting: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (credentials: { email: string; password: string }) => Promise<{ error?: string }>;
  signUp: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ error?: string; requiresConfirmation?: boolean }>;
  signOut: () => Promise<{ error?: string }>;
  clearError: () => void;
};

let authSubscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | null =
  null;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  status: 'loading',
  initialized: false,
  submitting: false,
  error: null,
  initialize: async () => {
    if (get().initialized) {
      return;
    }

    try {
      set({ status: 'loading', error: null });
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        set({ error: error.message });
      }

      set({
        session: session ?? null,
        user: session?.user ?? null,
        status: session ? 'authenticated' : 'unauthenticated',
        initialized: true,
      });

      if (!authSubscription) {
        const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          set({
            session: nextSession ?? null,
            user: nextSession?.user ?? null,
            status: nextSession ? 'authenticated' : 'unauthenticated',
          });
        });

        authSubscription = data?.subscription ?? null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to initialize auth';
      set({ error: message, status: 'unauthenticated', initialized: true });
    }
  },
  signIn: async ({ email, password }) => {
    set({ submitting: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ submitting: false, status: 'unauthenticated', error: error.message });
        return { error: error.message };
      }

      set({
        submitting: false,
        session: data.session ?? null,
        user: data.user ?? null,
        status: data.session ? 'authenticated' : 'unauthenticated',
      });
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in';
      set({ submitting: false, status: 'unauthenticated', error: message });
      return { error: message };
    }
  },
  signUp: async ({ email, password }) => {
    set({ submitting: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        set({ submitting: false, status: 'unauthenticated', error: error.message });
        return { error: error.message };
      }

      const requiresConfirmation = !data.session;

      set({
        submitting: false,
        session: data.session ?? null,
        user: data.user ?? null,
        status: data.session ? 'authenticated' : 'unauthenticated',
      });

      return { requiresConfirmation };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign up';
      set({ submitting: false, status: 'unauthenticated', error: message });
      return { error: message };
    }
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        set({ error: error.message });
        return { error: error.message };
      }

      set({ session: null, user: null, status: 'unauthenticated' });
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign out';
      set({ error: message });
      return { error: message };
    }
  },
  clearError: () => set({ error: null }),
}));
