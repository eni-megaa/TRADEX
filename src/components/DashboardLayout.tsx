import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './dashboard/Sidebar';
import { AdminSidebar } from './admin/AdminSidebar';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { useTradingStore } from '../store/tradingStore';
import { useSettingsStore } from '../store/settingsStore';
import { useKYCGuard } from '../hooks/useKYCGuard';
import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export const DashboardLayout = ({ isAdmin: _isAdmin }: { isAdmin?: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';
  const { initRealtimePrices } = useTradingStore();
  const { fetchSettings } = useSettingsStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { canAccess, KYCModal } = useKYCGuard();

  useEffect(() => {
    initRealtimePrices();
    fetchSettings();
  }, [initRealtimePrices, fetchSettings]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-[100dvh] bg-navy flex text-white overflow-hidden relative">
      {/* KYC Warning Banner */}
      {!canAccess && !_isAdmin && (
        <div className="absolute top-0 left-0 right-0 z-[60] bg-orange-500 text-white px-4 py-2 flex items-center justify-center space-x-2 shadow-lg cursor-pointer hover:bg-orange-600 transition-colors" onClick={() => navigate('/dashboard/kyc')}>
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold text-sm tracking-wide">
            Your account is not verified. Complete KYC to unlock all features.
          </span>
        </div>
      )}

      {/* Global KYC Modal */}
      <KYCModal />

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex shrink-0 ${!canAccess && !_isAdmin ? 'mt-10' : ''}`}>
        {_isAdmin ? <AdminSidebar /> : <Sidebar />}
      </div>

      {/* Mobile Sidebar Drawer */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-navy z-50 transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {_isAdmin ? <AdminSidebar /> : <Sidebar />}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white lg:hidden"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden ${!canAccess && !_isAdmin ? 'pt-10' : ''}`}>
        {/* Header */}
        <DashboardHeader isAdmin={_isAdmin} onMenuOpen={() => setIsMobileMenuOpen(true)} />
        
        {/* Scrollable Content */}
        <main className={`flex-1 hide-scrollbar overflow-y-auto ${isDashboard ? 'lg:overflow-hidden' : 'p-4 md:p-8'}`}>
          <Outlet />
        </main>
      </div>
      
      {/* Global CSS */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
