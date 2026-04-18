import { ShieldAlert, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KYCModal = ({ isOpen, onClose }: KYCModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-navy border border-white/10 rounded-3xl p-8 max-w-sm w-full relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-white/5 hover:text-white rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto border border-orange-500/20">
            <ShieldAlert className="w-10 h-10 text-orange-500" />
          </div>
          
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Verification Required</h3>
            <p className="text-sm border border-orange-500/10 p-3 rounded-lg text-gray-400">
              Access to core financial operations is temporarily restricted. Please complete your identity verification to unlock full platform capabilities.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <button 
              onClick={() => {
                onClose();
                navigate('/dashboard/kyc');
              }}
              className="w-full py-4 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-accent/20 flex justify-center items-center"
            >
              Start Verification
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
            >
              Remind Me Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
