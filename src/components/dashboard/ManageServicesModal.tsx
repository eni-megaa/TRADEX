import React from 'react';
import { X, Check } from 'lucide-react';
import { useSidebarStore } from '../../store/sidebarStore';

interface ManageServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_SERVICES = [
  { group: 'MENU', items: ['Overview', 'Portfolio', 'Wallet', 'Watchlist'] },
  { group: 'MARKETS', items: ['Trade', 'Transactions', 'Insights', 'Analytics', 'Market Trends', 'Copy Trading'] },
  { group: 'SYSTEM', items: ['Support', 'Settings'] }
];

export const ManageServicesModal: React.FC<ManageServicesModalProps> = ({ isOpen, onClose }) => {
  const { enabledServices, toggleService } = useSidebarStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-navy-light/90 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 pb-4 flex justify-between items-center border-b border-white/5">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Manage Services</h2>
            <p className="text-sm text-gray-400 mt-1">Customize your side navigation</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto hide-scrollbar space-y-8">
          {ALL_SERVICES.map((group) => (
            <div key={group.group}>
              <h3 className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase mb-4 px-2">
                {group.group}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {group.items.map((service) => {
                  const isEnabled = enabledServices.includes(service);
                  return (
                    <button
                      key={service}
                      onClick={() => toggleService(service)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isEnabled 
                          ? 'bg-accent/10 border-accent/20 text-white' 
                          : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-bold">{service}</span>
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                        isEnabled ? 'bg-accent border-accent' : 'bg-transparent border-white/10'
                      }`}>
                        {isEnabled && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 pt-4 border-t border-white/5 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-accent hover:bg-accent-hover text-white font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(176,107,255,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
