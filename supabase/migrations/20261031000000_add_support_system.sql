-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'account', 'trading', 'deposit', 'withdrawal', 'technical', 'other')),
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Messages (thread within a ticket)
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Callback Requests
CREATE TABLE IF NOT EXISTS callback_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number VARCHAR(30) NOT NULL,
    reason TEXT,
    preferred_time VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_messages_ticket ON support_messages(ticket_id);
CREATE INDEX idx_callback_requests_user ON callback_requests(user_id);
CREATE INDEX idx_callback_requests_status ON callback_requests(status);

-- RLS: support_tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
ON support_tickets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tickets"
ON support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets"
ON support_tickets FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'support_agent')));

CREATE POLICY "Admins can update all tickets"
ON support_tickets FOR UPDATE
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'support_agent')));

-- RLS: support_messages
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages on own tickets"
ON support_messages FOR SELECT
USING (EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = ticket_id AND support_tickets.user_id = auth.uid()));

CREATE POLICY "Admins can view all messages"
ON support_messages FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'support_agent')));

CREATE POLICY "Users can insert messages on own tickets"
ON support_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = ticket_id AND support_tickets.user_id = auth.uid())
);

CREATE POLICY "Admins can insert messages on any ticket"
ON support_messages FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'support_agent')));

-- RLS: callback_requests
ALTER TABLE callback_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own callback requests"
ON callback_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own callback requests"
ON callback_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all callback requests"
ON callback_requests FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'support_agent')));

CREATE POLICY "Admins can update all callback requests"
ON callback_requests FOR UPDATE
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'support_agent')));

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_support_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_support_updated_at();

CREATE TRIGGER set_callback_updated_at
    BEFORE UPDATE ON callback_requests
    FOR EACH ROW EXECUTE FUNCTION update_support_updated_at();
