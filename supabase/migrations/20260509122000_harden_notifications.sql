ALTER TABLE public.notifications
ALTER COLUMN category SET DEFAULT 'broadcast',
ALTER COLUMN target SET DEFAULT 'all';

UPDATE public.notifications
SET category = 'broadcast'
WHERE category IS NULL OR category = 'general';

UPDATE public.notifications
SET target = 'all'
WHERE target IS NULL;

UPDATE public.notifications
SET target = 'specific'
WHERE target ILIKE 'Specific (%';

ALTER TABLE public.notifications
ALTER COLUMN category SET NOT NULL,
ALTER COLUMN target SET NOT NULL;

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
CHECK (type IN ('info', 'warning', 'urgent', 'success', 'new_user', 'kyc_submission', 'deposit_request', 'withdrawal_request', 'support_ticket'));

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_category_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_category_check
CHECK (category IN ('broadcast', 'direct', 'admin_event'));

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_target_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_target_check
CHECK (target IN ('all', 'active', 'verified', 'admins', 'specific', 'user'));

DROP POLICY IF EXISTS "Users can view their own notifications." ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications." ON public.notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications." ON public.notifications;
DROP POLICY IF EXISTS "Users can read their own or broadcast notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert admin event notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications." ON public.notifications;
DROP POLICY IF EXISTS "Users can view visible notifications." ON public.notifications;
DROP POLICY IF EXISTS "Admins can insert user and broadcast notifications." ON public.notifications;
DROP POLICY IF EXISTS "Users can create their own admin events." ON public.notifications;

CREATE POLICY "Users can view visible notifications."
ON public.notifications FOR SELECT
USING (
  public.is_admin()
  OR (category = 'direct' AND user_id = auth.uid())
  OR (category = 'broadcast' AND target IN ('all', 'active') AND user_id IS NULL)
  OR (
    category = 'broadcast'
    AND target = 'verified'
    AND user_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.kyc_status = 'approved'
        AND users.kyc_level >= 2
    )
  )
);

CREATE POLICY "Admins can insert user and broadcast notifications."
ON public.notifications FOR INSERT
WITH CHECK (
  public.is_admin() AND category IN ('broadcast', 'direct')
);

CREATE POLICY "Users can create their own admin events."
ON public.notifications FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND category = 'admin_event'
  AND target = 'admins'
  AND user_id = auth.uid()
);

CREATE POLICY "Admins can delete notifications."
ON public.notifications FOR DELETE
USING (public.is_admin());
