-- Modify kyc_status constraint and add kyc_level
DO $$ 
DECLARE
    chk_name text;
BEGIN
    SELECT conname INTO chk_name
    FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%kyc_status%';
    
    IF chk_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || chk_name;
    END IF;
END $$;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_level INT DEFAULT 0;

-- Migrate existing users to approved so they are not locked out
UPDATE public.users SET kyc_status = 'approved', kyc_level = 2;

ALTER TABLE public.users ALTER COLUMN kyc_status SET DEFAULT 'not_started';

ALTER TABLE public.users ADD CONSTRAINT users_kyc_status_check 
    CHECK (kyc_status IN ('not_started', 'pending', 'under_review', 'approved', 'rejected'));

-- Update trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email, full_name, role, kyc_status, kyc_level)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user', 'not_started', 0);
  
  -- Insert into public.wallets
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new.id, 0.00);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gating function
CREATE OR REPLACE FUNCTION public.can_transact(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_kyc_required BOOLEAN;
    u_status TEXT;
    u_level INT;
    u_role TEXT;
BEGIN
    -- Check if user is admin
    SELECT role INTO u_role FROM public.users WHERE id = user_uuid;
    IF u_role IN ('admin', 'moderator', 'finance_manager') THEN
        RETURN TRUE;
    END IF;

    -- Check if KYC is enabled globally
    SELECT is_enabled INTO is_kyc_required FROM public.admin_settings WHERE feature_name = 'kyc_verification';
    IF is_kyc_required IS NOT TRUE THEN
        RETURN TRUE;
    END IF;

    -- Fetch user KYC status
    SELECT kyc_status, kyc_level INTO u_status, u_level FROM public.users WHERE id = user_uuid;
    IF u_status = 'approved' AND u_level >= 2 THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can insert their own transactions." ON public.transactions;
CREATE POLICY "Users can insert their own transactions." ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id AND public.can_transact(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own trades." ON public.trades;
CREATE POLICY "Users can insert their own trades." ON public.trades
    FOR INSERT WITH CHECK (auth.uid() = user_id AND public.can_transact(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own trades." ON public.trades;
CREATE POLICY "Users can update their own trades." ON public.trades
    FOR UPDATE USING (auth.uid() = user_id AND public.can_transact(auth.uid()));

-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc_documents', 'kyc_documents', false) ON CONFLICT (id) DO NOTHING;

-- Storage RLS (Requires checking if table exists, but storage.objects is standard supabase)
-- Drop existing just in case
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own KYC docs" ON storage.objects;

CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'kyc_documents' AND auth.uid() = owner);

CREATE POLICY "Admins can view KYC documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'kyc_documents' AND public.is_admin());

CREATE POLICY "Users can view their own KYC docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'kyc_documents' AND auth.uid() = owner);
