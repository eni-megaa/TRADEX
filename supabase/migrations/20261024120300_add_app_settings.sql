CREATE TABLE IF NOT EXISTS public.app_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    enabled_services JSONB NOT NULL DEFAULT '["Overview", "Portfolio", "Wallet", "Trade", "Transactions", "Insights", "Analytics", "Market Trends", "Copy Trading", "Support", "Settings"]'::jsonb
);

INSERT INTO public.app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app settings"
    ON public.app_settings FOR SELECT
    USING (true);

CREATE POLICY "Admins can update app settings"
    ON public.app_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE public.users.id = auth.uid() AND role = 'admin'
        )
    );
