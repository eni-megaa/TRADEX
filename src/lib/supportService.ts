import { supabase } from './supabase';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  // Joined
  user?: { full_name: string; email: string };
  latest_message?: string;
  message_count?: number;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export interface CallbackRequest {
  id: string;
  user_id: string;
  phone_number: string;
  reason: string;
  preferred_time: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  user?: { full_name: string; email: string };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  USER-SIDE functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Create a new support ticket with its first message */
export const createTicket = async (
  userId: string,
  subject: string,
  category: string,
  priority: string,
  initialMessage: string
) => {
  // 1. Create ticket
  const { data: ticket, error: ticketErr } = await supabase
    .from('support_tickets')
    .insert([{ user_id: userId, subject, category, priority }])
    .select()
    .single();

  if (ticketErr || !ticket) throw ticketErr || new Error('Failed to create ticket');

  // 2. Attach the initial message
  const { error: msgErr } = await supabase
    .from('support_messages')
    .insert([{ ticket_id: ticket.id, sender_id: userId, message: initialMessage, is_admin: false }]);

  if (msgErr) throw msgErr;

  return ticket;
};

/** Fetch all tickets for the current user */
export const fetchUserTickets = async (userId: string): Promise<SupportTicket[]> => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/** Fetch a single ticket by ID */
export const fetchTicketById = async (ticketId: string): Promise<SupportTicket | null> => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (error) throw error;
  return data;
};

/** Fetch all messages for a ticket */
export const fetchTicketMessages = async (ticketId: string): Promise<SupportMessage[]> => {
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

/** Send a message on a ticket */
export const sendTicketMessage = async (
  ticketId: string,
  senderId: string,
  message: string,
  isAdmin: boolean = false
) => {
  const { error: msgErr } = await supabase
    .from('support_messages')
    .insert([{ ticket_id: ticketId, sender_id: senderId, message, is_admin: isAdmin }]);

  if (msgErr) throw msgErr;

  // Bounce the ticket status
  const newStatus = isAdmin ? 'pending' : 'open';
  await supabase.from('support_tickets').update({ status: newStatus }).eq('id', ticketId);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Callback Requests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const createCallbackRequest = async (
  userId: string,
  phoneNumber: string,
  reason: string,
  preferredTime: string
) => {
  const { data, error } = await supabase
    .from('callback_requests')
    .insert([{ user_id: userId, phone_number: phoneNumber, reason, preferred_time: preferredTime }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchUserCallbacks = async (userId: string): Promise<CallbackRequest[]> => {
  const { data, error } = await supabase
    .from('callback_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ADMIN-SIDE functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Admin: fetch ALL tickets */
export const fetchAllTickets = async (): Promise<SupportTicket[]> => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/** Admin: fetch ALL callback requests */
export const fetchAllCallbacks = async (): Promise<CallbackRequest[]> => {
  const { data, error } = await supabase
    .from('callback_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/** Admin: update ticket status */
export const updateTicketStatus = async (ticketId: string, status: string) => {
  const { error } = await supabase
    .from('support_tickets')
    .update({ status })
    .eq('id', ticketId);

  if (error) throw error;
};

/** Admin: update callback status and notes */
export const updateCallbackRequest = async (
  callbackId: string,
  status: string,
  adminNotes?: string
) => {
  const updateData: Record<string, any> = { status };
  if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

  const { error } = await supabase
    .from('callback_requests')
    .update(updateData)
    .eq('id', callbackId);

  if (error) throw error;
};
