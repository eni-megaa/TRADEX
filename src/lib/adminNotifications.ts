import { supabase } from './supabase';

/**
 * Creates an admin-event notification that appears in the admin's bell icon.
 * These are NOT broadcast notifications — they are system events about user activity.
 */
export const createAdminNotification = async ({
  title,
  message,
  type,
}: {
  title: string;
  message: string;
  type: 'new_user' | 'kyc_submission' | 'deposit_request' | 'withdrawal_request' | 'support_ticket';
}) => {
  try {
    await supabase.from('notifications').insert([{
      title,
      message,
      type,
      target: 'admins',
      category: 'admin_event',
      // user_id is null — it's a system-level notification for all admins
    }]);
  } catch (error) {
    console.error('Failed to create admin notification:', error);
  }
};

/**
 * Specifically for support requests from users
 */
export const sendSupportRequestNotification = async (userName: string, userEmail: string, subject: string) => {
  return createAdminNotification({
    title: 'Support Request',
    message: `${userName} (${userEmail}) has sent a support inquiry: "${subject}"`,
    type: 'support_ticket'
  });
};
