ALTER TABLE transactions ADD COLUMN IF NOT EXISTS offer_amount NUMERIC(12,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn'));
