CREATE TABLE IF NOT EXISTS crypto_holdings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coin_id VARCHAR(100) NOT NULL,
  coin_symbol VARCHAR(20) NOT NULL,
  coin_name VARCHAR(100) NOT NULL,
  quantity NUMERIC(20, 8) NOT NULL,
  purchase_price_eur NUMERIC(12, 2),
  purchase_date DATE,
  wallet_type VARCHAR(50),
  institution VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
