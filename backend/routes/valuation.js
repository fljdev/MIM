const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

console.log('Valuation router loaded');

const JWT_SECRET = process.env.JWT_SECRET || 'mimapp-dev-secret-2025';

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Valuation router is working' });
});

// GET /api/valuation/spot-prices - Get current gold/silver spot prices
router.get('/spot-prices', async (req, res) => {
  const pool = req.app.locals.pool;
  
  try {
    // In production: Fetch from external API (Metals-API, Xignite, etc.)
    // For now: Return mock data or fetch latest from spot_price_history
    
    const result = await pool.query(`
      SELECT 
        metal,
        price_eur,
        price_usd,
        price_gbp,
        price_date,
        retrieved_at
      FROM spot_price_history
      WHERE price_date = (
        SELECT MAX(price_date) FROM spot_price_history WHERE metal IN ('gold', 'silver')
      )
      AND metal IN ('gold', 'silver')
      ORDER BY metal;
    `);
    
    if (result.rows.length > 0) {
      // Format prices from database
      const prices = {};
      result.rows.forEach(row => {
        prices[row.metal] = {
          eur: parseFloat(row.price_eur),
          usd: parseFloat(row.price_usd),
          gbp: parseFloat(row.price_gbp),
          date: row.price_date,
          retrieved_at: row.retrieved_at,
          currency: 'EUR' // Primary currency for Ireland/EU
        };
      });
      
      res.json({ 
        prices,
        source: 'database',
        timestamp: new Date().toISOString()
      });
    } else {
      // Fallback: Mock prices (in EUR per troy ounce)
      const mockPrices = {
        gold: {
          eur: 1800.50,
          usd: 1950.75,
          gbp: 1550.25,
          date: new Date().toISOString().split('T')[0],
          retrieved_at: new Date().toISOString(),
          currency: 'EUR',
          source: 'mock'
        },
        silver: {
          eur: 22.75,
          usd: 24.50,
          gbp: 19.25,
          date: new Date().toISOString().split('T')[0],
          retrieved_at: new Date().toISOString(),
          currency: 'EUR',
          source: 'mock'
        }
      };
      
      res.json({ 
        prices: mockPrices,
        source: 'mock',
        timestamp: new Date().toISOString(),
        note: 'Using mock data. Set up Metals-API integration for live prices.'
      });
    }
    
  } catch (error) {
    console.error('Error fetching spot prices:', error);
    
    // Always return something, even if database fails
    const fallbackPrices = {
      gold: {
        eur: 1800.50,
        usd: 1950.75,
        gbp: 1550.25,
        date: new Date().toISOString().split('T')[0],
        currency: 'EUR',
        source: 'fallback'
      },
      silver: {
        eur: 22.75,
        usd: 24.50,
        gbp: 19.25,
        date: new Date().toISOString().split('T')[0],
        currency: 'EUR',
        source: 'fallback'
      }
    };
    
    res.json({ 
      prices: fallbackPrices,
      source: 'fallback',
      timestamp: new Date().toISOString(),
      error: 'Database error, using fallback prices'
    });
  }
});

// POST /api/valuation/calculate - Calculate gold/silver value
router.post('/calculate', async (req, res) => {
  const pool = req.app.locals.pool;
  const {
    metal,
    weight,
    weight_unit = 'grams',
    purity,
    karat,
    country = 'IE', // Default Ireland
    include_vat = false,
    dealer_margin_percent = 5.0
  } = req.body;

  try {
    // Validate required fields
    if (!metal || !weight) {
      return res.status(400).json({ 
        error: 'Metal and weight are required' 
      });
    }

    if (metal !== 'gold' && metal !== 'silver') {
      return res.status(400).json({ 
        error: 'Metal must be "gold" or "silver"' 
      });
    }

    // Convert weight to grams (standard unit for calculations)
    let weightInGrams;
    switch (weight_unit) {
      case 'grams':
        weightInGrams = parseFloat(weight);
        break;
      case 'ounces':
        weightInGrams = parseFloat(weight) * 28.3495;
        break;
      case 'troy_ounces':
        weightInGrams = parseFloat(weight) * 31.1035;
        break;
      case 'kilograms':
        weightInGrams = parseFloat(weight) * 1000;
        break;
      default:
        return res.status(400).json({ 
          error: 'Invalid weight_unit. Use: grams, ounces, troy_ounces, kilograms' 
        });
    }

    // Calculate purity from karat if provided
    let calculatedPurity = purity;
    if (karat && !purity) {
      // Convert karat to decimal purity
      const karatMap = {
        24: 0.999,  // 24k = 99.9% pure
        22: 0.916,  // 22k = 91.6% pure
        18: 0.750,  // 18k = 75.0% pure
        14: 0.583,  // 14k = 58.3% pure
        10: 0.417,  // 10k = 41.7% pure
        9: 0.375    // 9k = 37.5% pure
      };
      
      if (karatMap[karat]) {
        calculatedPurity = karatMap[karat];
      } else {
        return res.status(400).json({ 
          error: 'Invalid karat. Use: 9, 10, 14, 18, 22, 24' 
        });
      }
    }

    // Use default purity if not provided
    if (!calculatedPurity) {
      calculatedPurity = metal === 'gold' ? 0.999 : 0.925; // Default: .999 gold, .925 silver
    }

    // Validate purity
    if (calculatedPurity < 0 || calculatedPurity > 1) {
      return res.status(400).json({ 
        error: 'Purity must be between 0 and 1 (e.g., .999 for 99.9% pure)' 
      });
    }

    // Get current spot price
    const spotPriceResult = await pool.query(`
      SELECT price_eur, price_usd, price_gbp
      FROM spot_price_history
      WHERE metal = $1
      AND price_date = (
        SELECT MAX(price_date) FROM spot_price_history WHERE metal = $1
      )
      LIMIT 1;
    `, [metal]);

    let spotPriceEUR;
    if (spotPriceResult.rows.length > 0) {
      spotPriceEUR = parseFloat(spotPriceResult.rows[0].price_eur);
    } else {
      // Fallback spot prices (EUR per troy ounce)
      spotPriceEUR = metal === 'gold' ? 1800.50 : 22.75;
    }

    // Convert spot price from EUR/troy ounce to EUR/gram
    const spotPricePerGram = spotPriceEUR / 31.1035;

    // Calculate pure metal value
    const pureMetalValue = weightInGrams * spotPricePerGram * calculatedPurity;

    // Calculate scrap value (what dealers typically pay)
    const dealerMargin = dealer_margin_percent / 100;
    const scrapValue = pureMetalValue * (1 - dealerMargin);

    // Calculate VAT if applicable
    let vatAmount = 0;
    let vatRate = 0;
    
    if (include_vat && country) {
      // VAT rates by country (as of 2026)
      const vatRates = {
        'IE': 0.23,  // Ireland: 23% for silver
        'DE': 0.19,  // Germany: 19%
        'FR': 0.20,  // France: 20%
        'IT': 0.22,  // Italy: 22%
        'ES': 0.21,  // Spain: 21%
        'NL': 0.21,  // Netherlands: 21%
        'BE': 0.21,  // Belgium: 21%
        'AT': 0.20,  // Austria: 20%
        'PT': 0.23,  // Portugal: 23%
        'GR': 0.24,  // Greece: 24%
        'FI': 0.24,  // Finland: 24%
        'SE': 0.25,  // Sweden: 25%
        'DK': 0.25,  // Denmark: 25%
        'PL': 0.23,  // Poland: 23%
        'CZ': 0.21,  // Czech Republic: 21%
        'HU': 0.27   // Hungary: 27%
      };
      
      // Gold investment items are VAT-exempt across EU (99.5%+ purity)
      // Silver is always subject to VAT
      if (metal === 'silver') {
        vatRate = vatRates[country] || 0.23; // Default to Irish VAT
        vatAmount = pureMetalValue * vatRate;
      }
      // Gold with purity >= 99.5% is VAT-exempt
      else if (metal === 'gold' && calculatedPurity >= 0.995) {
        vatRate = 0; // VAT-exempt
        vatAmount = 0;
      }
      // Gold jewellery (< 99.5% purity) is subject to VAT
      else if (metal === 'gold') {
        vatRate = vatRates[country] || 0.23;
        vatAmount = pureMetalValue * vatRate;
      }
    }

    // Calculate total value with VAT
    const totalValueWithVAT = pureMetalValue + vatAmount;

    // Store valuation in history (optional, for analytics)
    const userId = req.user ? req.user.userId : null;
    const sessionId = req.headers['x-session-id'] || null;
    
    if (userId || sessionId) {
      try {
        await pool.query(`
          INSERT INTO valuation_history (
            user_id, session_id, item_description, metal_category,
            weight, weight_unit, purity, karat,
            estimated_scrap_value, estimated_market_value,
            gold_spot_price, silver_spot_price, dealer_margin_percent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          userId,
          sessionId,
          `${weight}${weight_unit} ${metal} at ${(calculatedPurity * 100).toFixed(1)}% purity`,
          metal,
          weightInGrams,
          'grams',
          calculatedPurity,
          karat || null,
          scrapValue,
          pureMetalValue,
          metal === 'gold' ? spotPriceEUR : null,
          metal === 'silver' ? spotPriceEUR : null,
          dealer_margin_percent
        ]);
      } catch (historyError) {
        console.warn('Failed to save valuation history:', historyError.message);
        // Don't fail the request if history save fails
      }
    }

    // Return comprehensive valuation
    res.json({
      valuation: {
        metal,
        weight: {
          input: parseFloat(weight),
          unit: weight_unit,
          grams: weightInGrams,
          troy_ounces: weightInGrams / 31.1035
        },
        purity: {
          decimal: calculatedPurity,
          percentage: (calculatedPurity * 100).toFixed(1),
          karat: karat || null
        },
        spot_price: {
          eur_per_troy_ounce: spotPriceEUR,
          eur_per_gram: spotPricePerGram,
          source: spotPriceResult.rows.length > 0 ? 'database' : 'fallback',
          date: spotPriceResult.rows.length > 0 ? spotPriceResult.rows[0].price_date : new Date().toISOString().split('T')[0]
        },
        values: {
          pure_metal_value_eur: parseFloat(pureMetalValue.toFixed(2)),
          scrap_value_eur: parseFloat(scrapValue.toFixed(2)), // What dealers pay
          dealer_margin_percent: dealer_margin_percent,
          vat: {
            applicable: include_vat && (metal === 'silver' || (metal === 'gold' && calculatedPurity < 0.995)),
            rate: vatRate,
            amount_eur: parseFloat(vatAmount.toFixed(2)),
            country
          },
          total_with_vat_eur: parseFloat(totalValueWithVAT.toFixed(2))
        },
        conversions: {
          usd: parseFloat((pureMetalValue * 1.08).toFixed(2)), // Approx EUR to USD conversion
          gbp: parseFloat((pureMetalValue * 0.86).toFixed(2)), // Approx EUR to GBP conversion
          bitcoin: parseFloat((pureMetalValue / 45000).toFixed(8)) // Approx BTC price
        }
      },
      timestamp: new Date().toISOString(),
      disclaimer: 'Valuations are estimates. Actual dealer prices may vary. Gold with purity ≥99.5% is VAT-exempt in EU.'
    });

  } catch (error) {
    console.error('Error calculating valuation:', error);
    res.status(500).json({ 
      error: 'Failed to calculate valuation',
      details: error.message 
    });
  }
});

// GET /api/valuation/history - Get user's valuation history
router.get('/history', async (req, res) => {
  const pool = req.app.locals.pool;
  
  // Check for authentication
  const authHeader = req.headers.authorization;
  let userId = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      // Invalid token, continue as anonymous
    }
  }
  
  const sessionId = req.headers['x-session-id'];
  
  if (!userId && !sessionId) {
    return res.status(400).json({ 
      error: 'Either authentication or session ID required' 
    });
  }
  
  try {
    let query;
    let params;
    
    if (userId) {
      query = `
        SELECT 
          id, item_description, metal_category, weight, weight_unit,
          purity, estimated_scrap_value, estimated_market_value,
          created_at
        FROM valuation_history
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50;
      `;
      params = [userId];
    } else {
      query = `
        SELECT 
          id, item_description, metal_category, weight, weight_unit,
          purity, estimated_scrap_value, estimated_market_value,
          created_at
        FROM valuation_history
        WHERE session_id = $1
        ORDER BY created_at DESC
        LIMIT 50;
      `;
      params = [sessionId];
    }
    
    const result = await pool.query(query, params);
    
    res.json({
      valuations: result.rows,
      count: result.rows.length,
      user_id: userId,
      session_id: sessionId
    });
    
  } catch (error) {
    console.error('Error fetching valuation history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch valuation history',
      details: error.message 
    });
  }
});

// GET /api/valuation/karat-conversion - Get karat to purity conversion table
router.get('/karat-conversion', (req, res) => {
  const karatTable = {
    '24k': { purity: 0.999, percentage: '99.9%', description: 'Pure gold' },
    '22k': { purity: 0.916, percentage: '91.6%', description: 'Standard for gold coins (Sovereign, Krugerrand)' },
    '18k': { purity: 0.750, percentage: '75.0%', description: 'Common for high-end jewellery' },
    '14k': { purity: 0.583, percentage: '58.3%', description: 'Common for jewellery in US/Canada' },
    '10k': { purity: 0.417, percentage: '41.7%', description: 'Minimum karat for gold in many countries' },
    '9k': { purity: 0.375, percentage: '37.5%', description: 'Common in UK/Ireland' }
  };
  
  res.json({
    karat_table: karatTable,
    note: 'Gold purity standards vary by country. Investment gold (≥99.5% purity) is VAT-exempt in EU.',
    timestamp: new Date().toISOString()
  });
});

// GET /api/valuation/vat-rates - Get VAT rates by EU country
router.get('/vat-rates', (req, res) => {
  const vatRates = {
    'IE': { rate: 0.23, country: 'Ireland', gold_vat_exempt: true, silver_vat_applicable: true },
    'DE': { rate: 0.19, country: 'Germany', gold_vat_exempt: true, silver_vat_applicable: true },
    'FR': { rate: 0.20, country: 'France', gold_vat_exempt: true, silver_vat_applicable: true },
    'IT': { rate: 0.22, country: 'Italy', gold_vat_exempt: true, silver_vat_applicable: true },
    'ES': { rate: 0.21, country: 'Spain', gold_vat_exempt: true, silver_vat_applicable: true },
    'NL': { rate: 0.21, country: 'Netherlands', gold_vat_exempt: true, silver_vat_applicable: true },
    'BE': { rate: 0.21, country: 'Belgium', gold_vat_exempt: true, silver_vat_applicable: true },
    'AT': { rate: 0.20, country: 'Austria', gold_vat_exempt: true, silver_vat_applicable: true },
    'PT': { rate: 0.23, country: 'Portugal', gold_vat_exempt: true, silver_vat_applicable: true },
    'GR': { rate: 0.24, country: 'Greece', gold_vat_exempt: true, silver_vat_applicable: true },
    'FI': { rate: 0.24, country: 'Finland', gold_vat_exempt: true, silver_vat_applicable: true },
    'SE': { rate: 0.25, country: 'Sweden', gold_vat_exempt: true, silver_vat_applicable: true },
    'DK': { rate: 0.25, country: 'Denmark', gold_vat_exempt: true, silver_vat_applicable: true },
    'PL': { rate: 0.23, country: 'Poland', gold_vat_exempt: true, silver_vat_applicable: true },
    'CZ': { rate: 0.21, country: 'Czech Republic', gold_vat_exempt: true, silver_vat_applicable: true },
    'HU': { rate: 0.27, country: 'Hungary', gold_vat_exempt: true, silver_vat_applicable: true }
  };
  
  res.json({
    vat_rates: vatRates,
    disclaimer: 'Gold investment items (≥99.5% purity) are VAT-exempt across EU. Silver is always subject to VAT.',
    source: 'EU VAT Directive 2006/112/EC',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;