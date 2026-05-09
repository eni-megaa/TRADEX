CREATE OR REPLACE FUNCTION public.notify_admins_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, target, category)
  VALUES (
    NEW.id,
    'New User Registration',
    COALESCE(NEW.full_name, NEW.email, 'A new user') || ' has registered on the platform.',
    'new_user',
    'admins',
    'admin_event'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_public_user_created_notify_admins ON public.users;
CREATE TRIGGER on_public_user_created_notify_admins
AFTER INSERT ON public.users
FOR EACH ROW EXECUTE PROCEDURE public.notify_admins_new_user();
