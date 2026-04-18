-- Add stop_loss column to trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS stop_loss NUMERIC;
