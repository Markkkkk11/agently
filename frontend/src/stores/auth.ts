import { create } from "zustand";
import { api } from "@/lib/api";
import type { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: true }),

  login: (accessToken, refreshToken, user) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    api.clearTokens();
    set({ user: null, isAuthenticated: false, isLoading: false });
    window.location.href = "/login";
  },

  fetchMe: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    const { data, error } = await api.get<User>("/me");
    if (data) {
      set({ user: data, isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
