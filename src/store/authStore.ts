import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/services/api";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.login(email, password);
          if (response.success && response.data) {
            const { token, ...user } = response.data;
            api.setToken(token);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          } else {
            set({
              error: response.error || "Login failed",
              isLoading: false,
            });
            return false;
          }
        } catch (error) {
          set({
            error: "An unexpected error occurred",
            isLoading: false,
          });
          return false;
        }
      },

      signup: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.register(username, email, password);
          if (response.success && response.data) {
            const { token, ...user } = response.data;
            api.setToken(token);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          } else {
            set({
              error: response.error || "Signup failed",
              isLoading: false,
            });
            return false;
          }
        } catch (error) {
          set({
            error: "An unexpected error occurred",
            isLoading: false,
          });
          return false;
        }
      },

      logout: () => {
        api.setToken(null);
        set({ user: null, token: null, isAuthenticated: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state && state.token) {
          api.setToken(state.token);
        }
      },
    }
  )
);
