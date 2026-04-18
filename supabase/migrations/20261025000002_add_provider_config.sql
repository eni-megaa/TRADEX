-- Add a secure config column to store API details per provider
ALTER TABLE payment_providers
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

-- Optional: If the table was empty due to previous issues, ensure we re-insert the base gateways
INSERT INTO payment_providers (name, type, status, supported_countries)
VALUES
('Stripe', 'fiat', 'inactive', '["US", "GB", "CA", "AU"]')
ON CONFLICT (name) DO NOTHING;

INSERT INTO payment_providers (name, type, status, supported_countries)
VALUES
('Paystack', 'fiat', 'inactive', '["NG", "GH", "ZA", "KE"]')
ON CONFLICT (name) DO NOTHING;

INSERT INTO payment_providers (name, type, status, supported_countries)
VALUES
('Flutterwave', 'fiat', 'inactive', '["NG", "GH", "ZA", "KE", "RW", "UG"]')
ON CONFLICT (name) DO NOTHING;

INSERT INTO payment_providers (name, type, status, supported_countries)
VALUES
('Coinbase Commerce', 'crypto', 'inactive', '["GLOBAL"]')
ON CONFLICT (name) DO NOTHING;

INSERT INTO payment_providers (name, type, status, supported_countries)
VALUES
('Adyen', 'fiat', 'inactive', '["EU", "GLOBAL"]')
ON CONFLICT (name) DO NOTHING;
