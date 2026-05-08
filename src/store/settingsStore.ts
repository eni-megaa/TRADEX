import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface SettingsState {
  kycRequired: boolean;
  settingsLoaded: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  kycRequired: true,
  settingsLoaded: false,
  fetchSettings: async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('is_enabled')
        .eq('feature_name', 'kyc_verification')
        .single();
      
      if (data) {
        set({ kycRequired: data.is_enabled, settingsLoaded: true });
      } else {
        set({ settingsLoaded: true });
      }
    } catch (error) {
      console.error('Error fetching global settings:', error);
      set({ settingsLoaded: true });
    }
  }
}));
