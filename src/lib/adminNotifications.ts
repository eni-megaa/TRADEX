import { supabase } from './supabase';

/**
 * Creates an admin-event notification that appears in the admin bell.
 * These are system events about user activity, not broadcasts to users.
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
    const { data: authData } = await supabase.auth.getUser();
    const actorId = authData.user?.id;
    if (!actorId) return;

    await supabase.from('notifications').insert([{
      user_id: actorId,
      title,
      message,
      type,
      target: 'admins',
      category: 'admin_event',
    }]);
  } catch (error) {
    console.error('Failed to create admin notification:', error);
  }
};

/**
 * Specifically for support requests from users.
 */
export const sendSupportRequestNotification = async (userName: string, userEmail: string, subject: string) => {
  return createAdminNotification({
    title: 'Support Request',
    message: `${userName} (${userEmail}) has sent a support inquiry: "${subject}"`,
    type: 'support_ticket'
  });
};
