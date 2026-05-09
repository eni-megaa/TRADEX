DO $$
DECLARE
    chk_name text;
BEGIN
    SELECT conname INTO chk_name
    FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%kyc_status%';

    IF chk_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', chk_name);
    END IF;
END $$;

UPDATE public.users
SET kyc_status = CASE
    WHEN kyc_status = 'unverified' THEN 'not_started'
    WHEN kyc_status = 'pending' THEN 'under_review'
    ELSE kyc_status
END
WHERE kyc_status IN ('unverified', 'pending');

ALTER TABLE public.users
ALTER COLUMN kyc_status SET DEFAULT 'not_started';

ALTER TABLE public.users
ADD CONSTRAINT users_kyc_status_check
CHECK (kyc_status IN ('not_started', 'under_review', 'approved', 'rejected'));
