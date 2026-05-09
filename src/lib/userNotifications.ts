import { supabase } from './supabase';

/**
 * Creates a notification targeted at a specific user.
 * These appear in the user's bell icon dropdown.
 */
export const createUserNotification = async ({
  userId,
  title,
  message,
  type = 'info',
}: {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'urgent';
}) => {
  try {
    await supabase.from('notifications').insert([{
      user_id: userId,
      title,
      message,
      type,
      target: 'user',
      category: 'direct',
    }]);
  } catch (error) {
    console.error('Failed to create user notification:', error);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  PRE-BUILT NOTIFICATION TEMPLATES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Deposit approved */
export const notifyDepositApproved = (userId: string, amount: number) =>
  createUserNotification({
    userId,
    title: 'Deposit Approved',
    message: `Your deposit of $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been approved and credited to your wallet.`,
    type: 'success',
  });

/** Deposit rejected */
export const notifyDepositRejected = (userId: string, amount: number) =>
  createUserNotification({
    userId,
    title: 'Deposit Rejected',
    message: `Your deposit of $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} was rejected. Please contact support for details.`,
    type: 'warning',
  });

/** Withdrawal approved */
export const notifyWithdrawalApproved = (userId: string, amount: number) =>
  createUserNotification({
    userId,
    title: 'Withdrawal Processed',
    message: `Your withdrawal of $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been approved and is being processed.`,
    type: 'success',
  });

/** Withdrawal rejected */
export const notifyWithdrawalRejected = (userId: string, amount: number) =>
  createUserNotification({
    userId,
    title: 'Withdrawal Rejected',
    message: `Your withdrawal of $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} was rejected. Please contact support.`,
    type: 'warning',
  });

/** KYC approved */
export const notifyKYCApproved = (userId: string) =>
  createUserNotification({
    userId,
    title: 'KYC Verified',
    message: 'Your identity verification has been approved. You now have full access to all platform features.',
    type: 'success',
  });

/** KYC rejected */
export const notifyKYCRejected = (userId: string, reason?: string) =>
  createUserNotification({
    userId,
    title: 'KYC Rejected',
    message: reason
      ? `Your identity verification was rejected: ${reason}. Please re-submit your documents.`
      : 'Your identity verification was rejected. Please re-submit your documents or contact support.',
    type: 'warning',
  });

/** Trade closed by admin */
export const notifyTradeClosed = (userId: string, asset: string, reason?: string) =>
  createUserNotification({
    userId,
    title: 'Trade Closed',
    message: reason
      ? `Your ${asset} trade was closed by the system: ${reason}`
      : `Your ${asset} trade was closed by the system.`,
    type: 'info',
  });

/** Account suspended */
export const notifyAccountSuspended = (userId: string) =>
  createUserNotification({
    userId,
    title: 'Account Suspended',
    message: 'Your account has been temporarily suspended. Please contact support for assistance.',
    type: 'urgent',
  });

/** Account unsuspended */
export const notifyAccountUnsuspended = (userId: string) =>
  createUserNotification({
    userId,
    title: 'Account Restored',
    message: 'Your account suspension has been lifted. You can now access all features again.',
    type: 'success',
  });

/** Support ticket replied */
export const notifySupportReply = (userId: string, ticketSubject: string) =>
  createUserNotification({
    userId,
    title: 'Support Reply',
    message: `An admin has replied to your support ticket: "${ticketSubject}"`,
    type: 'info',
  });

/** Tier upgrade */
export const notifyTierUpgrade = (userId: string, newTier: string) =>
  createUserNotification({
    userId,
    title: 'Account Upgraded',
    message: `Congratulations! Your account has been upgraded to ${newTier} tier.`,
    type: 'success',
  });
