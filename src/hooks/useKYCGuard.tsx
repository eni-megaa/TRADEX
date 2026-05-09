import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { KYCModal } from '../components/dashboard/KYCModal';

const STAFF_ROLES = ['admin', 'moderator', 'finance_manager', 'support_agent'];

export const useKYCGuard = () => {
  const { profile } = useAuthStore();
  const { kycRequired, settingsLoaded } = useSettingsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = !!profile?.role && STAFF_ROLES.includes(profile.role);

  // Don't restrict access while settings are still loading to prevent flash
  if (!settingsLoaded) {
    return {
      canAccess: true,
      checkAccess: (callback: () => void) => callback(),
      KYCModal: () => null,
    };
  }

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
