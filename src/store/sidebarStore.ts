import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface SidebarState {
  enabledServices: string[];
  fetchServices: () => Promise<void>;
  toggleService: (label: string) => Promise<void>;
  initRealtimeSettings: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  enabledServices: [],
  
  fetchServices: async () => {
    const { data, error } = await supabase.from('app_settings').select('enabled_services').eq('id', 1).single();
    if (error) {
      console.warn('Could not load global app_settings. Falling back to default list. (Ensure migration is pushed).', error);
      set({ enabledServices: [
        'Overview', 'Portfolio', 'Wallet',
        'Trade', 'Transactions', 'Insights', 'Analytics', 'Market Trends', 'Copy Trading',
        'Support', 'Settings'
      ] });
      return;
    }
    if (data && data.enabled_services) {
      set({ enabledServices: data.enabled_services });
    }
  },
  
  toggleService: async (label) => {
    const current = get().enabledServices;
    const isEnabled = current.includes(label);
    const newServices = isEnabled 
      ? current.filter(s => s !== label) 
      : [...current, label];

    // Optimistic UI update
    set({ enabledServices: newServices });

    // Update global remote setting for all users
    await supabase.from('app_settings').update({ enabled_services: newServices }).eq('id', 1);
  },
  
  initRealtimeSettings: () => {
    if ((window as any).__sidebarScanner) return;
    (window as any).__sidebarScanner = true;

    get().fetchServices();

    supabase.channel('app_settings_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_settings' },
        (payload) => {
          if (payload.new && payload.new.enabled_services) {
            set({ enabledServices: payload.new.enabled_services });
          }
        }
      )
      .subscribe();
  }
}));
