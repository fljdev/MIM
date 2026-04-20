-- Migration 015: Create listings table for Money in Metals marketplace
-- Date: April 19, 2026
-- Purpose: Create listings table for marketplace listings of precious metals

CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  holding_id INTEGER NOT NULL REFERENCES holdings(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asking_price NUMERIC(12,2),
  price_type VARCHAR(20) NOT NULL DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'spot_plus', 'offers')),
  spot_premium NUMERIC(6,4),
  location_county VARCHAR(50),
  postage_offered BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'under_offer', 'sold', 'withdrawn')),
  visible_to VARCHAR(20) NOT NULL DEFAULT 'all' CHECK (visible_to IN ('all', 'verified_only')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for listings table
CREATE INDEX IF NOT EXISTS idx_listings_holding_id ON listings(holding_id);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_price_type ON listings(price_type);
CREATE INDEX IF NOT EXISTS idx_listings_visible_to ON listings(visible_to);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_listings_status_visible 
ON listings(status, visible_to) 
WHERE status = 'active' AND visible_to = 'all';
