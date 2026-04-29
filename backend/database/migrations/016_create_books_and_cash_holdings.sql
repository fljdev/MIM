-- Migration 016: Create books and cash_holdings tables, extend holdings with subcategory
-- Date: April 28, 2026
-- Purpose: Add book collection tracking, cash holdings tracking, and subcategory field for holdings

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  year_published INTEGER,
  edition TEXT,
  is_signed BOOLEAN DEFAULT FALSE,
  condition TEXT,
  estimated_value_eur NUMERIC(12,2),
  purchase_price_eur NUMERIC(12,2),
  purchase_date DATE,
  notes TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cash_holdings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank_account', 'cash_physical', 'savings', 'overdraft', 'loan', 'other')),
  currency TEXT NOT NULL DEFAULT 'EUR',
  amount NUMERIC(12,2) NOT NULL,
  institution TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE holdings ADD COLUMN IF NOT EXISTS subcategory TEXT DEFAULT 'bullion';

-- Indexes for books table
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);

-- Indexes for cash_holdings table
CREATE INDEX IF NOT EXISTS idx_cash_holdings_user_id ON cash_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_holdings_type ON cash_holdings(type);

-- Migration verification
DO $$
BEGIN
  RAISE NOTICE 'Migration 016: books, cash_holdings tables created and holdings.subcategory added';
END $$;
