-- Create Payment Providers table
CREATE TABLE IF NOT EXISTS payment_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('fiat', 'crypto')),
    status VARCHAR(50) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'maintenance')),
    supported_countries JSONB DEFAULT '[]'::jsonb, -- Array of ISO codes e.g. ["US", "NG", "GB"], or ["GLOBAL"]
    deposit_fee_percentage NUMERIC(5,2) DEFAULT 0.00,
    withdrawal_fee_percentage NUMERIC(5,2) DEFAULT 0.00,
    min_deposit_limit NUMERIC(15,2) DEFAULT 10.00,
    max_deposit_limit NUMERIC(15,2) DEFAULT 10000.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial providers
INSERT INTO payment_providers (name, type, status, supported_countries) VALUES
('Stripe', 'fiat', 'inactive', '["US", "GB", "CA", "AU"]'),
('Paystack', 'fiat', 'inactive', '["NG", "GH", "ZA", "KE"]'),
('Flutterwave', 'fiat', 'inactive', '["NG", "GH", "ZA", "KE", "RW", "UG"]'),
('Coinbase Commerce (Mock)', 'crypto', 'inactive', '["GLOBAL"]'),
('Adyen', 'fiat', 'inactive', '["EU", "GLOBAL"]');

-- RLS for Payment Providers
ALTER TABLE payment_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active payment providers" 
ON payment_providers FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can view and manage all providers"
ON payment_providers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'finance_manager', 'support_agent')
  )
);

-- Create Double Entry Ledger Tables
CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id), -- Null for system accounts
    name VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    type VARCHAR(50) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed core system accounts
INSERT INTO financial_accounts (name, type, currency) VALUES 
('System Hot Wallet', 'asset', 'USD'),
('System Revenue (Fees)', 'revenue', 'USD'),
('External Bank Reserve', 'asset', 'USD');

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id), -- Links back to existing transactions table
    description TEXT NOT NULL,
    posted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES financial_accounts(id),
    amount NUMERIC(19,4) NOT NULL CHECK (amount > 0),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('DEBIT', 'CREDIT')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Views for easier ledger balance calculations
CREATE VIEW account_balances AS
SELECT 
    a.id as account_id,
    a.name,
    a.type,
    a.currency,
    a.user_id,
    COALESCE(SUM(CASE WHEN l.direction = 'DEBIT' THEN l.amount ELSE 0 END), 0) as total_debits,
    COALESCE(SUM(CASE WHEN l.direction = 'CREDIT' THEN l.amount ELSE 0 END), 0) as total_credits,
    CASE 
        WHEN a.type IN ('asset', 'expense') THEN 
            COALESCE(SUM(CASE WHEN l.direction = 'DEBIT' THEN l.amount ELSE -l.amount END), 0)
        ELSE 
            COALESCE(SUM(CASE WHEN l.direction = 'CREDIT' THEN l.amount ELSE -l.amount END), 0)
    END as current_balance
FROM financial_accounts a
LEFT JOIN ledger_lines l ON a.id = l.account_id
GROUP BY a.id, a.name, a.type, a.currency, a.user_id;

-- Ledger RLS: Extremely strict. Only backend edge functions and admins can touch this.
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view ledger accounts" ON financial_accounts FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'finance_manager', 'support_agent')));
CREATE POLICY "Admins can view journals" ON journal_entries FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'finance_manager', 'support_agent')));
CREATE POLICY "Admins can view ledger lines" ON ledger_lines FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'finance_manager', 'support_agent')));

-- System backend (service role) can bypass RLS anyway, so no insert policies needed for anon/authenticated.

-- Trigger to validate ledger integrity (Debits == Credits)
CREATE OR REPLACE FUNCTION check_ledger_balance()
RETURNS TRIGGER AS $$
DECLARE
    total_debits NUMERIC;
    total_credits NUMERIC;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_debits FROM ledger_lines WHERE journal_id = NEW.journal_id AND direction = 'DEBIT';
    SELECT COALESCE(SUM(amount), 0) INTO total_credits FROM ledger_lines WHERE journal_id = NEW.journal_id AND direction = 'CREDIT';

    IF total_debits != total_credits THEN
        RAISE EXCEPTION 'Ledger out of balance for journal %: Debits (%), Credits (%)', NEW.journal_id, total_debits, total_credits;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- We run this as a deferrable constraint trigger so it checks at the end of the transaction
CREATE CONSTRAINT TRIGGER ensure_ledger_balance
    AFTER INSERT OR UPDATE ON ledger_lines
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION check_ledger_balance();
