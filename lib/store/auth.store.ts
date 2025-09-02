import { create } from "zustand";
import {
  loginWithEmailAndPassword,
  logout,
  getUser,
  getProfile,
  getStores,
  signUpWithEmailAndPassword,
  sendPasswordResetEmail,
  updateUserPassword,
} from "@/app/actions";
import { User } from "@supabase/supabase-js";

// Define types based on your database schema
// You might want to move these to a central types file
export interface Profile {
  id: string;
  full_name: string;
  role: "owner" | "manager" | "staff";
  // Add other profile fields here
}

export interface Store {
  id: string;
  name: string;
  // Add other store fields here
}

export interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  stores: Store[];
  currentStore: Store | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  success: boolean;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (credentials: LoginCredentials) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  switchStore: (storeId: string) => void;
  checkUser: () => Promise<void>;
  resetStatus: () => void;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  stores: [],
  currentStore: null,
  loading: false,
  error: null,
  isLoggedIn: false,
  success: false,

  resetStatus: () => set({ error: null, success: false }),

  login: async (credentials) => {
    set({ loading: true, error: null, success: false });
    try {
      const { data, error } = await loginWithEmailAndPassword(credentials);
      if (error) throw new Error(error.message);
      if (data.user) {
        const [profile, stores] = await Promise.all([
          getProfile(data.user.id),
          getStores(),
        ]);

        set({
          user: data.user,
          profile: profile as Profile,
          stores: stores as Store[],
          currentStore: stores?.[0] || null,
          isLoggedIn: true,
        });
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null, success: false });
    try {
      await logout();
      set({
        user: null,
        profile: null,
        stores: [],
        currentStore: null,
        isLoggedIn: false,
      });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (credentials: LoginCredentials) => {
    set({ loading: true, error: null, success: false });
    try {
      const { error } = await signUpWithEmailAndPassword(credentials);
      if (error) throw new Error(error.message);
      set({ success: true });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  forgotPassword: async (email: string) => {
    set({ loading: true, error: null, success: false });
    try {
      const { error } = await sendPasswordResetEmail(email);
      if (error) throw new Error(error.message);
      set({ success: true });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updatePassword: async (password: string) => {
    set({ loading: true, error: null, success: false });
    try {
      const { error } = await updateUserPassword(password);
      if (error) throw new Error(error.message);
      set({ success: true });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  switchStore: (storeId: string) => {
    const { stores } = get();
    const store = stores.find((s) => s.id === storeId) || null;
    set({ currentStore: store });
  },

  checkUser: async () => {
    // This function can be called on app load to check for an existing session
    set({ loading: true, error: null, success: false });
    try {
      const user = await getUser();
      if (user) {
        const [profile, stores] = await Promise.all([
          getProfile(user.id),
          getStores(),
        ]);
        set({
          user,
          profile: profile as Profile,
          stores: stores as Store[],
          currentStore: stores?.[0] || null,
          isLoggedIn: true,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      // This might fail if there's no active session, which is fine
    } finally {
      set({ loading: false });
    }
  },
}));

export default useAuthStore;
