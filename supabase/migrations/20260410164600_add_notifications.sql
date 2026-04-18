-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL means broadcast
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'urgent', 'success')),
    target TEXT NOT NULL DEFAULT 'all', -- all, active, verified, admins
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notification_reads table to track who has read what
CREATE TABLE IF NOT EXISTS public.notification_reads (
    notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (notification_id, user_id)
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can read their own or broadcast notifications"
    ON public.notifications FOR SELECT
    USING (
        user_id = auth.uid() OR user_id IS NULL
    );

CREATE POLICY "Admins can manage all notifications"
    ON public.notifications FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Policies for notification_reads
CREATE POLICY "Users can manage their own notification reads"
    ON public.notification_reads FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all notification reads"
    ON public.notification_reads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
