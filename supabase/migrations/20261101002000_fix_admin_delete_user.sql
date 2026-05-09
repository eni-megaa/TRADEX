CREATE OR REPLACE FUNCTION public.delete_user(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  caller_id UUID := auth.uid();
BEGIN
  IF caller_id IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can delete users.';
  END IF;

  IF target_user_id = caller_id THEN
    RAISE EXCEPTION 'You cannot delete your own account while signed in.';
  END IF;

  DELETE FROM storage.objects
  WHERE bucket_id = 'kyc_documents'
    AND (storage.foldername(name))[1] = target_user_id::text;

  DELETE FROM public.notification_reads WHERE user_id = target_user_id;
  DELETE FROM public.notifications WHERE user_id = target_user_id;
  DELETE FROM public.support_messages WHERE sender_id = target_user_id;
  DELETE FROM public.support_tickets WHERE user_id = target_user_id;
  DELETE FROM public.callback_requests WHERE user_id = target_user_id;
  DELETE FROM public.audit_logs WHERE user_id = target_user_id OR admin_id = target_user_id;
  DELETE FROM public.kyc_documents WHERE user_id = target_user_id;
  DELETE FROM public.trades WHERE user_id = target_user_id;
  DELETE FROM public.transactions WHERE user_id = target_user_id;
  DELETE FROM public.wallets WHERE user_id = target_user_id;

  DELETE FROM auth.users WHERE id = target_user_id;
  DELETE FROM public.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, storage, auth;

GRANT EXECUTE ON FUNCTION public.delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user(UUID) TO service_role;
