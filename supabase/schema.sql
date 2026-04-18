-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role text default 'user' check (role in ('user', 'admin', 'moderator', 'finance_manager', 'support_agent')),
  kyc_status text default 'unverified' check (kyc_status in ('unverified', 'pending', 'verified', 'rejected')),
  tier text default 'Standard' check (tier in ('Standard', 'Premium', 'VIP', 'Institutional')),
  is_suspended boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WALLETS TABLE
create table public.wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null unique,
  balance numeric default 0.00 not null,
  currency text default 'USD' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRANSACTIONS TABLE
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  type text not null check (type in ('deposit', 'withdrawal')),
  amount numeric not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  payment_method text,
  reference_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRADES TABLE
create table public.trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  asset text not null,
  side text not null check (side in ('buy', 'sell')),
  lot_size numeric not null,
  entry_price numeric not null,
  current_price numeric not null,
  take_profit numeric,
  stop_loss numeric,
  pnl numeric default 0.00 not null,
  status text default 'open' check (status in ('open', 'closed')),
  leverage integer default 100 not null,
  closed_by_admin boolean default false not null,
  closing_reason text,
  opened_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone
);

-- ASSETS TABLE
create table public.assets (
  id uuid default uuid_generate_v4() primary key,
  symbol text unique not null,
  name text not null,
  type text not null check (type in ('Crypto', 'Forex', 'Stock', 'Index', 'Commodity')),
  base_price numeric not null,
  is_enabled boolean default true not null,
  spread_multiplier numeric default 1.0 not null,
  fee_multiplier numeric default 1.0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- KYC DOCUMENTS TABLE
create table public.kyc_documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  document_type text not null,
  document_url text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AUDIT LOGS TABLE
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.users on delete set null,
  action text not null,
  target_id uuid,
  target_type text,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ADMIN SETTINGS TABLE
create table public.admin_settings (
  id uuid default uuid_generate_v4() primary key,
  feature_name text unique not null,
  is_enabled boolean default false not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default admin settings
insert into public.admin_settings (feature_name, is_enabled) values
  ('referral_system', false),
  ('bonus_system', false),
  ('copy_trading', false),
  ('kyc_verification', true),
  ('global_trading', true),
  ('automated_withdrawals', false);

-- TRIGGERS
-- Create a wallet automatically when a new user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert into public.users
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  
  -- Insert into public.wallets
  insert into public.wallets (user_id, balance)
  values (new.id, 0.00);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_users before update on public.users for each row execute procedure public.handle_updated_at();
create trigger set_updated_at_wallets before update on public.wallets for each row execute procedure public.handle_updated_at();
create trigger set_updated_at_transactions before update on public.transactions for each row execute procedure public.handle_updated_at();
create trigger set_updated_at_assets before update on public.assets for each row execute procedure public.handle_updated_at();
create trigger set_updated_at_kyc_documents before update on public.kyc_documents for each row execute procedure public.handle_updated_at();

-- ROW LEVEL SECURITY (RLS)

alter table public.users enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.trades enable row level security;
alter table public.admin_settings enable row level security;
alter table public.assets enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.audit_logs enable row level security;

-- Admin Check Function (Bypasses RLS to prevent infinite recursion)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin', 'moderator', 'finance_manager', 'support_agent')
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Role specific checks
create or replace function public.has_role(required_roles text[])
returns boolean as $$
begin
  return exists (
    select 1 from public.users
    where id = auth.uid() and role = any(required_roles)
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Users policies
create policy "Users can view their own profile." on public.users for select using ( auth.uid() = id );
create policy "Users can update their own profile." on public.users for update using ( auth.uid() = id );
create policy "Admins can view all profiles." on public.users for select using ( public.is_admin() );
create policy "Admins can update all profiles." on public.users for update using ( public.is_admin() );

-- Wallets policies
create policy "Users can view their own wallet." on public.wallets for select using ( auth.uid() = user_id );
create policy "Admins can view all wallets." on public.wallets for select using ( public.is_admin() );
create policy "Admins can update all wallets." on public.wallets for update using ( public.is_admin() );

-- Transactions policies
create policy "Users can view their own transactions." on public.transactions for select using ( auth.uid() = user_id );
create policy "Users can insert their own transactions." on public.transactions for insert with check ( auth.uid() = user_id );
create policy "Admins can view all transactions." on public.transactions for select using ( public.is_admin() );
create policy "Admins can update all transactions." on public.transactions for update using ( public.is_admin() );

-- Trades policies
create policy "Users can view their own trades." on public.trades for select using ( auth.uid() = user_id );
create policy "Users can insert their own trades." on public.trades for insert with check ( auth.uid() = user_id );
create policy "Users can update their own trades." on public.trades for update using ( auth.uid() = user_id );
create policy "Admins can view all trades." on public.trades for select using ( public.is_admin() );

-- Admin settings policies
create policy "Anyone can view admin settings." on public.admin_settings for select using ( true );
create policy "Admins can update settings." on public.admin_settings for update using ( public.is_admin() );

-- Assets policies
create policy "Anyone can view enabled assets." on public.assets for select using ( is_enabled = true or public.is_admin() );
create policy "Admins can manage assets." on public.assets for all using ( public.is_admin() );

-- KYC policies
create policy "Users can view their own documents." on public.kyc_documents for select using ( auth.uid() = user_id );
create policy "Users can insert their own documents." on public.kyc_documents for insert with check ( auth.uid() = user_id );
create policy "Admins can view and manage all KYC documents." on public.kyc_documents for all using ( public.is_admin() );

-- Audit logs policies
create policy "Only admins can view audit logs." on public.audit_logs for select using ( public.is_admin() );

-- Insert initial assets
insert into public.assets (symbol, name, type, base_price) values
  ('BTCUSDT', 'Bitcoin', 'Crypto', 66473.42),
  ('ETHUSDT', 'Ethereum', 'Crypto', 3439.90),
  ('SOLUSDT', 'Solana', 'Crypto', 157.76),
  ('BNBUSDT', 'BNB', 'Crypto', 347.08),
  ('EURUSD', 'EUR/USD', 'Forex', 1.0845),
  ('GBPUSD', 'GBP/USD', 'Forex', 1.2630),
  ('USDJPY', 'USD/JPY', 'Forex', 150.25),
  ('AAPL', 'Apple Inc.', 'Stock', 173.50),
  ('MSFT', 'Microsoft', 'Stock', 405.20),
  ('XAUUSD', 'Gold', 'Commodity', 2150.30);
