-- Migration 009: Create MiM Town Core Tables
-- Date: March 10, 2025
-- Purpose: Create new tables for MiM Town B2B circular economy platform

-- 1. BUSINESSES TABLE
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  registered_number VARCHAR(50), -- CRO number
  website VARCHAR(255),
  phone VARCHAR(20),
  address TEXT NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verified BOOLEAN DEFAULT false,
  business_type VARCHAR(50) NOT NULL CHECK (business_type IN (
    'manufacturer', 'distributor', 'recycler', 'retailer', 'wholesaler', 'service', 'other'
  )),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT businesses_owner_unique UNIQUE (owner_id)
);

-- Indexes for businesses
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_business_type ON businesses(business_type);
CREATE INDEX IF NOT EXISTS idx_businesses_verified ON businesses(verified);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);

-- Spatial index for businesses (similar to accessible_venues pattern)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'businesses' AND indexname = 'idx_businesses_location'
  ) THEN
    CREATE INDEX idx_businesses_location ON businesses 
    USING gist (ll_to_earth((latitude)::double precision, (longitude)::double precision));
  END IF;
END $$;

-- 2. WASTE_STREAMS TABLE (reference/lookup)
CREATE TABLE IF NOT EXISTS waste_streams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  disposal_method VARCHAR(50) NOT NULL CHECK (disposal_method IN (
    'reuse', 'recycle', 'compost', 'landfill-divert', 'repurpose', 'energy-recovery'
  )),
  icon_key VARCHAR(50), -- for UI display
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate common waste streams
INSERT INTO waste_streams (name, description, disposal_method, icon_key) VALUES
  ('Plastic', 'Various plastic materials', 'recycle', 'plastic'),
  ('Metal', 'Ferrous and non-ferrous metals', 'recycle', 'metal'),
  ('Organic', 'Food waste, garden waste', 'compost', 'organic'),
  ('Textile', 'Fabric, clothing, textiles', 'reuse', 'textile'),
  ('Electronic', 'E-waste, electronic components', 'recycle', 'electronic'),
  ('Construction', 'Building materials, debris', 'reuse', 'construction'),
  ('Paper', 'Paper, cardboard, packaging', 'recycle', 'paper'),
  ('Glass', 'Glass bottles, containers', 'recycle', 'glass'),
  ('Wood', 'Timber, pallets, furniture', 'reuse', 'wood'),
  ('Hazardous', 'Chemicals, batteries, paint', 'landfill-divert', 'hazardous')
ON CONFLICT (name) DO NOTHING;

-- 3. MATERIALS TABLE (listings)
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(20) NOT NULL CHECK (unit IN (
    'kg', 'tonnes', 'litres', 'units', 'cubic-metres', 'pallets', 'bags'
  )),
  material_type INTEGER NOT NULL REFERENCES waste_streams(id) ON DELETE RESTRICT,
  condition VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (condition IN (
    'available', 'reserved', 'exchanged', 'archived'
  )),
  price_per_unit NUMERIC(12, 4), -- nullable (some materials may be free)
  latitude NUMERIC(10, 8), -- collection point (may differ from business address)
  longitude NUMERIC(11, 8),
  available_from DATE DEFAULT CURRENT_DATE,
  available_until DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for materials
CREATE INDEX IF NOT EXISTS idx_materials_business ON materials(business_id);
CREATE INDEX IF NOT EXISTS idx_materials_material_type ON materials(material_type);
CREATE INDEX IF NOT EXISTS idx_materials_condition ON materials(condition);
CREATE INDEX IF NOT EXISTS idx_materials_available_from ON materials(available_from);
CREATE INDEX IF NOT EXISTS idx_materials_available_until ON materials(available_until);
CREATE INDEX IF NOT EXISTS idx_materials_created_at ON materials(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_materials_type_condition 
ON materials(material_type, condition) 
WHERE condition = 'available';

-- Spatial index for materials (collection points)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'materials' AND indexname = 'idx_materials_location'
  ) THEN
    CREATE INDEX idx_materials_location ON materials 
    USING gist (ll_to_earth((latitude)::double precision, (longitude)::double precision));
  END IF;
END $$;

-- 4. TRANSACTIONS TABLE (material exchanges)
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
  seller_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  buyer_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  quantity_exchanged NUMERIC(12, 4) NOT NULL CHECK (quantity_exchanged > 0),
  unit VARCHAR(20) NOT NULL CHECK (unit IN (
    'kg', 'tonnes', 'litres', 'units', 'cubic-metres', 'pallets', 'bags'
  )),
  status VARCHAR(20) NOT NULL DEFAULT 'enquiry' CHECK (status IN (
    'enquiry', 'negotiation', 'agreed', 'collection-arranged',
    'collected', 'completed', 'cancelled', 'disputed'
  )),
  carbon_saved_kg NUMERIC(10, 4), -- calculated field, reuse emissions pattern (nullable until calculated)
  notes TEXT,
  agreed_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure buyer and seller are different
  CONSTRAINT check_buyer_seller_different CHECK (buyer_id != seller_id)
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_material ON transactions(material_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_completed_at ON transactions(completed_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_seller_status 
ON transactions(seller_id, status) 
WHERE status IN ('enquiry', 'negotiation', 'agreed');

CREATE INDEX IF NOT EXISTS idx_transactions_buyer_status 
ON transactions(buyer_id, status) 
WHERE status IN ('enquiry', 'negotiation', 'agreed');

-- 5. Add comments for documentation
COMMENT ON TABLE businesses IS 'Registered businesses on MiM Town platform';
COMMENT ON COLUMN businesses.registered_number IS 'Companies Registration Office (CRO) number for Irish businesses';
COMMENT ON COLUMN businesses.verified IS 'Admin-verified businesses for trust and safety';

COMMENT ON TABLE waste_streams IS 'Reference table for material categorization in circular economy';
COMMENT ON COLUMN waste_streams.disposal_method IS 'Preferred disposal/recovery method for this waste stream';
COMMENT ON COLUMN waste_streams.icon_key IS 'UI icon identifier for material type display';

COMMENT ON TABLE materials IS 'Material listings posted by businesses for exchange/reuse';
COMMENT ON COLUMN materials.price_per_unit IS 'Price per unit (nullable - some materials may be free/donation)';
COMMENT ON COLUMN materials.latitude IS 'Collection point latitude (may differ from business address)';

COMMENT ON TABLE transactions IS 'Records material exchanges between businesses with carbon savings tracking';
COMMENT ON COLUMN transactions.carbon_saved_kg IS 'Calculated carbon savings from material reuse vs. landfill (kg CO2)';
COMMENT ON COLUMN transactions.status IS 'Exchange workflow status from enquiry to completion';

-- Migration verification
DO $$ 
BEGIN
  RAISE NOTICE 'Migration 009: MiM Town core tables created successfully';
  RAISE NOTICE 'Created tables: businesses, waste_streams, materials, transactions';
  RAISE NOTICE 'Added spatial indexes using earthdistance extension';
  RAISE NOTICE 'Pre-populated waste_streams with common material types';
END $$;