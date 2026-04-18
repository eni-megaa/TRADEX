import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { KYCModal } from '../components/dashboard/KYCModal';

export const useKYCGuard = () => {
  const { profile } = useAuthStore();
  const { kycRequired } = useSettingsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator' || profile?.role === 'finance_manager';

  // If KYC is not required globally, or the user is an admin, or the user is fully verified, grant access.
  const canAccess = isAdmin || !kycRequired || (profile?.kyc_status === 'approved' && profile?.kyc_level >= 2);

  const checkAccess = (callback: () => void) => {
    if (canAccess) {
      callback();
    } else {
      setIsModalOpen(true);
    }
  };

  const ModalComponent = () => (
    <KYCModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
  );

  return {
    canAccess,
    checkAccess,
    KYCModal: ModalComponent,
  };
};
