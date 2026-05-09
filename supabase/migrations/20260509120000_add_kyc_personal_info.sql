ALTER TABLE public.kyc_documents
ADD COLUMN IF NOT EXISTS personal_info JSONB;
