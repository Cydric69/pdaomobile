import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface User {
  _id: string;
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  sex: "Male" | "Female" | "Other";
  age: number;
  date_of_birth: string;
  address: {
    street: string;
    barangay: string;
    city_municipality: string;
    province: string;
    region: string;
    zip_code?: string;
    country: string;
    type: "Permanent" | "Temporary" | "Present";
  };
  contact_number: string;
  avatar_url?: string;
  email: string;
  role: "User" | "Admin" | "Supervisor" | "Staff";
  status: "Active" | "Inactive" | "Suspended" | "Pending";
  is_verified: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (user: User, token: string) => void;
  register: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (user: User, token: string) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }),

      register: (user: User, token: string) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),

      updateUser: (updatedUser: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
