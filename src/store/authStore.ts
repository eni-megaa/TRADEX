import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  kyc_status: string;
  kyc_level: number;
  is_verified?: boolean;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
  fetchProfile: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      const profileData: UserProfile = {
        ...data,
        is_verified: data.kyc_status === 'approved' && data.kyc_level >= 2
      };
      
      set({ profile: profileData });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
