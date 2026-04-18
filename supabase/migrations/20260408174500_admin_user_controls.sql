-- Add trading suspension flag to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_trading_suspended BOOLEAN DEFAULT false;

-- Function to delete user from both auth.users and public.users
-- This must be called as a security definer function to have permissions on auth.users
CREATE OR REPLACE FUNCTION public.delete_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Only allow admins to call this
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only administrators can delete users.';
    END IF;

    -- Delete from auth.users (cascades to public.users and everything else due to the references)
    DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user(UUID) TO service_role;
