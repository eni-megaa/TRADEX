CREATE OR REPLACE FUNCTION public.create_support_ticket(
  ticket_subject TEXT,
  ticket_category TEXT,
  ticket_priority TEXT,
  initial_message TEXT
)
RETURNS UUID AS $$
DECLARE
  requester_id UUID := auth.uid();
  requester public.users%ROWTYPE;
  new_ticket_id UUID;
  clean_category TEXT := COALESCE(NULLIF(TRIM(ticket_category), ''), 'general');
  clean_priority TEXT := COALESCE(NULLIF(TRIM(ticket_priority), ''), 'normal');
BEGIN
  IF requester_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to create a support ticket.';
  END IF;

  IF LENGTH(TRIM(COALESCE(ticket_subject, ''))) < 3 THEN
    RAISE EXCEPTION 'Ticket subject is too short.';
  END IF;

  IF LENGTH(TRIM(COALESCE(initial_message, ''))) < 10 THEN
    RAISE EXCEPTION 'Please describe the issue in more detail.';
  END IF;

  IF clean_category NOT IN ('general', 'account', 'trading', 'deposit', 'withdrawal', 'technical', 'other') THEN
    clean_category := 'general';
  END IF;

  IF clean_priority NOT IN ('low', 'normal', 'high', 'urgent') THEN
    clean_priority := 'normal';
  END IF;

  SELECT * INTO requester FROM public.users WHERE id = requester_id;

  INSERT INTO public.support_tickets (user_id, subject, category, priority, status)
  VALUES (requester_id, TRIM(ticket_subject), clean_category, clean_priority, 'open')
  RETURNING id INTO new_ticket_id;

  INSERT INTO public.support_messages (ticket_id, sender_id, message, is_admin)
  VALUES (new_ticket_id, requester_id, TRIM(initial_message), false);

  INSERT INTO public.notifications (user_id, title, message, type, target, category)
  VALUES (
    requester_id,
    'Support Request',
    COALESCE(requester.full_name, requester.email, 'A user') || ' opened a support ticket: "' || TRIM(ticket_subject) || '"',
    'support_ticket',
    'admins',
    'admin_event'
  );

  RETURN new_ticket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.create_callback_request(
  callback_phone_number TEXT,
  callback_reason TEXT,
  callback_preferred_time TEXT
)
RETURNS UUID AS $$
DECLARE
  requester_id UUID := auth.uid();
  requester public.users%ROWTYPE;
  new_callback_id UUID;
BEGIN
  IF requester_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to request a callback.';
  END IF;

  IF LENGTH(TRIM(COALESCE(callback_phone_number, ''))) < 7 THEN
    RAISE EXCEPTION 'Please enter a valid phone number.';
  END IF;

  IF LENGTH(TRIM(COALESCE(callback_preferred_time, ''))) < 3 THEN
    RAISE EXCEPTION 'Please select a preferred callback time.';
  END IF;

  SELECT * INTO requester FROM public.users WHERE id = requester_id;

  INSERT INTO public.callback_requests (user_id, phone_number, reason, preferred_time, status)
  VALUES (
    requester_id,
    TRIM(callback_phone_number),
    NULLIF(TRIM(COALESCE(callback_reason, '')), ''),
    TRIM(callback_preferred_time),
    'pending'
  )
  RETURNING id INTO new_callback_id;

  INSERT INTO public.notifications (user_id, title, message, type, target, category)
  VALUES (
    requester_id,
    'Callback Request',
    COALESCE(requester.full_name, requester.email, 'A user') || ' requested a callback at ' || TRIM(callback_preferred_time) || '. Phone: ' || TRIM(callback_phone_number),
    'support_ticket',
    'admins',
    'admin_event'
  );

  RETURN new_callback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.create_support_ticket(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_callback_request(TEXT, TEXT, TEXT) TO authenticated;
