-- Drop existing tables if conflicts exist
DROP TABLE IF EXISTS public.trades CASCADE;
DROP TABLE IF EXISTS public.watchlists CASCADE;

-- Create wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance NUMERIC NOT NULL DEFAULT 10000,
    currency TEXT NOT NULL DEFAULT 'USD',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS for wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Create policies for wallets
CREATE POLICY "Users can view own wallet"
    ON public.wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
    ON public.wallets FOR UPDATE
    USING (auth.uid() = user_id);

-- Create watchlists table
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- Enable RLS for watchlists
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

-- Create policies for watchlists
CREATE POLICY "Users can view own watchlist items"
    ON watchlists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist items"
    ON watchlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist items"
    ON watchlists FOR DELETE
    USING (auth.uid() = user_id);

-- Create trades table
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
    order_type TEXT NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT', 'STOP')),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    entry_price NUMERIC NOT NULL CHECK (entry_price >= 0),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'PENDING')),
    pnl NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for trades
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Create policies for trades
CREATE POLICY "Users can view own trades"
    ON trades FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
    ON trades FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
    ON trades FOR UPDATE
    USING (auth.uid() = user_id);
