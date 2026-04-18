-- Add category column to distinguish broadcast vs admin-event notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'broadcast' 
CHECK (category IN ('broadcast', 'admin_event'));

-- Expand the type constraint to include admin event notification types
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('info', 'warning', 'urgent', 'success', 'new_user', 'kyc_submission', 'deposit_request', 'withdrawal_request', 'support_ticket'));

-- Admin events are notifications about platform activity (new users, KYC, deposits, etc.)
-- They should only be visible to admins, not regular users.
-- Broadcasts are messages sent TO users by the admin.

-- Update the user SELECT policy to exclude admin_event notifications
DROP POLICY IF EXISTS "Users can read their own or broadcast notifications" ON public.notifications;

CREATE POLICY "Users can read their own or broadcast notifications"
    ON public.notifications FOR SELECT
    USING (
        -- Regular users: see broadcasts targeted at them, only after their account was created
        (
            category = 'broadcast' 
            AND (user_id = auth.uid() OR user_id IS NULL)
            AND created_at >= (SELECT u.created_at FROM public.users u WHERE u.id = auth.uid())
        )
        OR
        -- Admins: see everything including admin_event notifications
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Allow authenticated users to INSERT admin_event notifications (for triggers from user actions)
DROP POLICY IF EXISTS "Authenticated users can insert admin event notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert admin event notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
    );
