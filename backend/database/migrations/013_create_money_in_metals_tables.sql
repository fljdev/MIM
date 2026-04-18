-- Migration 013: Create Money in Metals Core Tables
-- Date: April 18, 2026
-- Purpose: Create tables for Money in Metals gold/silver valuation & P2P marketplace

-- 1. PRECIOUS_METAL_TYPES TABLE (reference/lookup)
CREATE TABLE IF NOT EXISTS precious_metal_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('gold', 'silver', 'platinum', 'palladium')),
  form VARCHAR(50) NOT NULL CHECK (form IN ('bullion', 'coin', 'jewellery', 'scrap', 'numismatic', 'industrial')),
  description TEXT,
  default_purity DECIMAL(5,3), -- Default purity for this type (e.g., .999 for gold bullion)
  icon_key VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate common precious metal types
INSERT INTO precious_metal_types (name, category, form, description, default_purity, icon_key) VALUES
  -- Gold
  ('Gold Bullion Bar', 'gold', 'bullion', 'Investment-grade gold bars', 0.999, 'gold-bullion'),
  ('Gold Sovereign Coin', 'gold', 'coin', 'British gold sovereign coin', 0.916, 'gold-coin'),
  ('Gold Krugerrand', 'gold', 'coin', 'South African gold coin', 0.916, 'gold-coin'),
  ('Gold Jewellery', 'gold', 'jewellery', 'Gold jewelry of various karats', 0.750, 'gold-jewellery'),
  ('Gold Scrap', 'gold', 'scrap', 'Scrap gold for refining', 0.900, 'gold-scrap'),
  
  -- Silver
  ('Silver Bullion Bar', 'silver', 'bullion', 'Investment-grade silver bars', 0.999, 'silver-bullion'),
  ('Silver Britannia', 'silver', 'coin', 'UK silver Britannia coin', 0.999, 'silver-coin'),
  ('Silver American Eagle', 'silver', 'coin', 'US silver coin', 0.999, 'silver-coin'),
  ('Silver Jewellery', 'silver', 'jewellery', 'Sterling silver jewelry', 0.925, 'silver-jewellery'),
  ('Silverware', 'silver', 'scrap', 'Sterling silver flatware', 0.925, 'silver-scrap'),
  
  -- Numismatic/Collector
  ('Rare Gold Coin', 'gold', 'numismatic', 'Collector/rare gold coins', NULL, 'rare-coin'),
  ('Rare Silver Coin', 'silver', 'numismatic', 'Collector/rare silver coins', NULL, 'rare-coin'),
  
  -- Other
  ('Platinum Bullion', 'platinum', 'bullion', 'Platinum bars and coins', 0.999, 'platinum'),
  ('Palladium Bullion', 'palladium', 'bullion', 'Palladium bars and coins', 0.999, 'palladium')
ON CONFLICT (name) DO NOTHING;

-- 2. DEALERS TABLE (verified precious metals dealers)
CREATE TABLE IF NOT EXISTS dealers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) NOT NULL CHECK (business_type IN (
    'retail_dealer', 'wholesale_dealer', 'pawn_shop', 'auction_house', 'refiner', 'private_seller'
  )),
  description TEXT,
  registered_number VARCHAR(50), -- CRO number for Irish businesses
  website VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  verified BOOLEAN DEFAULT false,
  verification_level VARCHAR(20) DEFAULT 'unverified' CHECK (verification_level IN (
    'unverified', 'basic', 'verified', 'premium', 'institutional'
  )),
  years_in_business INTEGER,
  avg_buy_spread DECIMAL(5,2), -- Average % spread when buying from customers
  avg_sell_spread DECIMAL(5,2), -- Average % spread when selling to customers
  accepts_bullion BOOLEAN DEFAULT true,
  accepts_jewellery BOOLEAN DEFAULT true,
  accepts_coins BOOLEAN DEFAULT true,
  accepts_scrap BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT dealers_user_unique UNIQUE (user_id)
);

-- Indexes for dealers
CREATE INDEX IF NOT EXISTS idx_dealers_user ON dealers(user_id);
CREATE INDEX IF NOT EXISTS idx_dealers_verified ON dealers(verified);
CREATE INDEX IF NOT EXISTS idx_dealers_verification_level ON dealers(verification_level);
CREATE INDEX IF NOT EXISTS idx_dealers_business_type ON dealers(business_type);
CREATE INDEX IF NOT EXISTS idx_dealers_created_at ON dealers(created_at DESC);

-- Spatial index for dealers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'dealers' AND indexname = 'idx_dealers_location'
  ) THEN
    CREATE INDEX idx_dealers_location ON dealers 
    USING gist (ll_to_earth((latitude)::double precision, (longitude)::double precision));
  END IF;
END $$;

-- 3. PRECIOUS_METAL_LISTINGS TABLE (P2P marketplace listings)
CREATE TABLE IF NOT EXISTS precious_metal_listings (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  metal_type_id INTEGER NOT NULL REFERENCES precious_metal_types(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  weight NUMERIC(12, 4) NOT NULL CHECK (weight > 0),
  weight_unit VARCHAR(20) NOT NULL DEFAULT 'grams' CHECK (weight_unit IN (
    'grams', 'ounces', 'troy_ounces', 'kilograms'
  )),
  purity DECIMAL(5,3), -- e.g., .999, .925, .750 (75% = 18k gold)
  karat INTEGER CHECK (karat IN (9, 10, 14, 18, 22, 24)), -- Alternative to purity for jewellery
  mint VARCHAR(100), -- Royal Mint, US Mint, etc.
  year INTEGER,
  condition VARCHAR(50) CHECK (condition IN (
    'new', 'excellent', 'good', 'fair', 'poor', 'scrap'
  )),
  asking_price NUMERIC(12, 2), -- In EUR, nullable for trades
  price_type VARCHAR(20) NOT NULL DEFAULT 'fixed' CHECK (price_type IN (
    'fixed', 'negotiable', 'auction', 'trade_only'
  )),
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN (
    'available', 'reserved', 'pending', 'sold', 'withdrawn'
  )),
  location_address TEXT,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  collection_required BOOLEAN DEFAULT true,
  shipping_available BOOLEAN DEFAULT false,
  insurance_available BOOLEAN DEFAULT false,
  authenticity_certified BOOLEAN DEFAULT false,
  certification_body VARCHAR(100),
  certification_number VARCHAR(100),
  photos TEXT[], -- Array of photo URLs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for listings
CREATE INDEX IF NOT EXISTS idx_listings_seller ON precious_metal_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_metal_type ON precious_metal_listings(metal_type_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON precious_metal_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_price_type ON precious_metal_listings(price_type);
CREATE INDEX IF NOT EXISTS idx_listings_condition ON precious_metal_listings(condition);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON precious_metal_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON precious_metal_listings(asking_price) WHERE asking_price IS NOT NULL;

-- Composite index for common searches
CREATE INDEX IF NOT EXISTS idx_listings_metal_status 
ON precious_metal_listings(metal_type_id, status) 
WHERE status = 'available';

-- 4. VALUATION_HISTORY TABLE (store user valuation requests)
CREATE TABLE IF NOT EXISTS valuation_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100), -- For anonymous valuations
  item_description TEXT NOT NULL,
  metal_category VARCHAR(20) NOT NULL CHECK (metal_category IN ('gold', 'silver', 'platinum', 'palladium', 'unknown')),
  weight NUMERIC(12, 4),
  weight_unit VARCHAR(20) DEFAULT 'grams',
  purity DECIMAL(5,3),
  karat INTEGER,
  estimated_scrap_value NUMERIC(12, 2),
  estimated_market_value NUMERIC(12, 2),
  estimated_collector_value NUMERIC(12, 2),
  valuation_notes TEXT,
  gold_spot_price NUMERIC(10, 2), -- Spot price at time of valuation
  silver_spot_price NUMERIC(10, 2),
  dealer_margin_percent NUMERIC(5, 2) DEFAULT 5.0, -- Typical dealer margin
  photos TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for valuation history
CREATE INDEX IF NOT EXISTS idx_valuation_user ON valuation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_valuation_session ON valuation_history(session_id);
CREATE INDEX IF NOT EXISTS idx_valuation_created_at ON valuation_history(created_at DESC);

-- 5. PRECIOUS_METAL_TRANSACTIONS TABLE (P2P transactions)
CREATE TABLE IF NOT EXISTS precious_metal_transactions (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES precious_metal_listings(id) ON DELETE RESTRICT,
  buyer_id INTEGER NOT NULL REFERENCES dealers(id) ON DELETE RESTRICT,
  seller_id INTEGER NOT NULL REFERENCES dealers(id) ON DELETE RESTRICT,
  agreed_price NUMERIC(12, 2) NOT NULL,
  transaction_fee NUMERIC(10, 2) DEFAULT 0, -- Platform fee
  status VARCHAR(20) NOT NULL DEFAULT 'enquiry' CHECK (status IN (
    'enquiry', 'negotiation', 'agreed', 'payment_pending',
    'payment_received', 'collection_arranged', 'completed', 
    'cancelled', 'disputed', 'refunded'
  )),
  payment_method VARCHAR(50) CHECK (payment_method IN (
    'cash', 'bank_transfer', 'paypal', 'revolut', 'crypto', 'other'
  )),
  meetup_location_type VARCHAR(50) CHECK (meetup_location_type IN (
    'seller_premises', 'buyer_premises', 'neutral_venue', 'secure_vault', 'shipping'
  )),
  meetup_location_id INTEGER, -- Reference to accessible_venues table for safe meetup locations
  meetup_scheduled_time TIMESTAMP,
  meetup_completed_time TIMESTAMP,
  buyer_feedback TEXT,
  seller_feedback TEXT,
  buyer_rating INTEGER CHECK (buyer_rating >= 1 AND buyer_rating <= 5),
  seller_rating INTEGER CHECK (seller_rating >= 1 AND seller_rating <= 5),
  platform_escrow_used BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure buyer and seller are different
  CONSTRAINT check_buyer_seller_different CHECK (buyer_id != seller_id)
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_listing ON precious_metal_transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON precious_metal_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON precious_metal_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON precious_metal_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON precious_metal_transactions(created_at DESC);

-- 6. SPOT_PRICE_HISTORY TABLE (store gold/silver price history)
CREATE TABLE IF NOT EXISTS spot_price_history (
  id SERIAL PRIMARY KEY,
  metal VARCHAR(20) NOT NULL CHECK (metal IN ('gold', 'silver', 'platinum', 'palladium')),
  price_eur NUMERIC(10, 2) NOT NULL,
  price_usd NUMERIC(10, 2) NOT NULL,
  price_gbp NUMERIC(10, 2) NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'lbma',
  retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  price_date DATE NOT NULL,
  
  CONSTRAINT unique_metal_date_source UNIQUE (metal, price_date, source)
);

-- Index for price lookups
CREATE INDEX IF NOT EXISTS idx_spot_price_date ON spot_price_history(price_date DESC);
CREATE INDEX IF NOT EXISTS idx_spot_price_metal ON spot_price_history(metal, price_date DESC);

-- 7. COIN_DATABASE TABLE (for coin identifier feature)
CREATE TABLE IF NOT EXISTS coin_database (
  id SERIAL PRIMARY KEY,
  country VARCHAR(100) NOT NULL,
  denomination VARCHAR(100) NOT NULL,
  year_from INTEGER,
  year_to INTEGER,
  metal VARCHAR(20) NOT NULL CHECK (metal IN ('gold', 'silver', 'copper', 'nickel', 'bronze', 'billon')),
  purity DECIMAL(5,3),
  weight_grams NUMERIC(8, 3),
  diameter_mm NUMERIC(6, 1),
  thickness_mm NUMERIC(6, 2),
  mint_mark VARCHAR(20),
  catalog_number VARCHAR(50),
  description TEXT,
  common_name VARCHAR(100),
  image_url VARCHAR(255),
  scrap_value_multiplier NUMERIC(5, 2) DEFAULT 1.0, -- Multiplier over spot for common coins
  collector_value_range_low NUMERIC(10, 2),
  collector_value_range_high NUMERIC(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for coin database
CREATE INDEX IF NOT EXISTS idx_coin_country ON coin_database(country);
CREATE INDEX IF NOT EXISTS idx_coin_denomination ON coin_database(denomination);
CREATE INDEX IF NOT EXISTS idx_coin_metal ON coin_database(metal);
CREATE INDEX IF NOT EXISTS idx_coin_year ON coin_database(year_from, year_to);
CREATE INDEX IF NOT EXISTS idx_coin_catalog ON coin_database(catalog_number);

-- Add comments for documentation
COMMENT ON TABLE precious_metal_types IS 'Reference table for types of precious metals (gold bars, silver coins, etc.)';
COMMENT ON TABLE dealers IS 'Verified precious metals dealers and private sellers on platform';
COMMENT ON TABLE precious_metal_listings IS 'P2P marketplace listings for gold/silver items';
COMMENT ON TABLE valuation_history IS 'Store user valuation requests for gold/silver items';
COMMENT ON TABLE precious_metal_transactions IS 'Records P2P precious metals transactions with trust features';
COMMENT ON TABLE spot_price_history IS 'Historical gold/silver spot prices for valuation and charts';
COMMENT ON TABLE coin_database IS 'Reference database for coin identification and valuation';

-- Migration verification
DO $$ 
BEGIN
  RAISE NOTICE 'Migration 013: Money in Metals tables created successfully';
  RAISE NOTICE 'Created tables: precious_metal_types, dealers, precious_metal_listings, valuation_history, precious_metal_transactions, spot_price_history, coin_database';
  RAISE NOTICE 'Pre-populated precious_metal_types with common gold/silver items';
  RAISE NOTICE 'Ready for Money in Metals platform development';
END $$;