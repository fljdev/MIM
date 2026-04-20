-- Migration 014: Create holdings table for Money in Metals
-- Date: April 19, 2026
-- Purpose: Create holdings table for user precious metal holdings

CREATE TABLE IF NOT EXISTS holdings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metal_type VARCHAR(20) NOT NULL CHECK (metal_type IN ('gold', 'silver', 'platinum', 'palladium')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('sovereign', 'coin', 'bar', 'round', 'junk', 'jewellery', 'flatware', 'other')),
  name VARCHAR(255) NOT NULL,
  quantity NUMERIC(10,4) NOT NULL DEFAULT 1,
  weight_grams NUMERIC(10,4) NOT NULL,
  purity NUMERIC(6,4) NOT NULL,
  purchase_price NUMERIC(12,2),
  purchase_date DATE,
  graded BOOLEAN NOT NULL DEFAULT FALSE,
  grade_cert VARCHAR(100),
  notes TEXT,
  is_listed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for holdings table
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_metal_type ON holdings(metal_type);
CREATE INDEX IF NOT EXISTS idx_holdings_category ON holdings(category);
CREATE INDEX IF NOT EXISTS idx_holdings_is_listed ON holdings(is_listed);
CREATE INDEX IF NOT EXISTS idx_holdings_created_at ON holdings(created_at DESC);

-- Migration verification
DO $$
BEGIN
  RAISE NOTICE 'Migration 014: holdings table created successfully';
  RAISE NOTICE 'Table holds user precious metal holdings with various attributes';
END $$;
