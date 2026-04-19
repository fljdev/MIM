const express = require('express');
const router = express.Router();

console.log('Prices router loaded');

// In-memory cache with 5-minute TTL
let cache = {
  gold: null,
  silver: null,
  goldPerOz: null,
  silverPerOz: null,
  timestamp: null,
  eurRate: 0.92, // Fallback rate
  source: null,
  error: null
};

// Cache duration: 5 minutes (300,000 ms)
const CACHE_DURATION = 5 * 60 * 1000;

// Helper function to get EUR rate from ECB API
async function getEURRate() {
  try {
    // Try ECB API first (free tier)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!response.ok) {
      throw new Error(`ECB API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    const eurRate = data.rates?.EUR;
    
    if (eurRate && typeof eurRate === 'number') {
      console.log(`Got EUR rate from ECB: ${eurRate}`);
      return eurRate;
    } else {
      throw new Error('EUR rate not found in ECB response');
    }
  } catch (error) {
    console.warn(`Failed to fetch EUR rate from ECB: ${error.message}. Using fallback 0.92`);
    return 0.92; // Fallback rate
  }
}

// Helper function to fetch price from gold-api.com
async function fetchMetalPrice(metalCode) {
  try {
    const response = await fetch(`https://api.gold-api.com/price/${metalCode}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MiM-App/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Gold-API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.price && typeof data.price === 'number') {
      return data.price;
    } else {
      throw new Error(`Invalid price data received for ${metalCode}`);
    }
  } catch (error) {
    console.error(`Error fetching ${metalCode} price:`, error.message);
    throw error;
  }
}

// Helper function to get fallback prices (from existing valuation route)
function getFallbackPrices() {
  // Mock prices (in USD per troy ounce) as last resort
  return {
    gold: 1950.75, // USD per troy ounce
    silver: 24.50,  // USD per troy ounce
    source: 'fallback',
    timestamp: Date.now()
  };
}

// Test endpoint
router.get('/test', (req, res) => {
  console.log('Prices test endpoint hit');
  res.json({ message: 'Prices router is working' });
});

// Main endpoint: GET /api/prices
router.get('/', async (req, res) => {
  try {
    console.log('Prices endpoint hit');
    // Check if cache is valid (less than 5 minutes old)
    const now = Date.now();
    if (cache.timestamp && (now - cache.timestamp) < CACHE_DURATION && !cache.error) {
      console.log('Returning cached prices');
      return res.json({
        gold: cache.gold,
        silver: cache.silver,
        goldPerOz: cache.goldPerOz,
        silverPerOz: cache.silverPerOz,
        eurRate: cache.eurRate,
        source: cache.source,
        cached: true,
        timestamp: cache.timestamp,
        retrievedAt: new Date(cache.timestamp).toISOString()
      });
    }
    
    console.log('Fetching fresh prices from gold-api.com');
    
    let goldPriceUSD, silverPriceUSD, eurRate;
    let source = 'gold-api.com';
    
    try {
      // Get EUR rate first
      eurRate = await getEURRate();
      
      // Fetch gold and silver prices in parallel
      const [goldResult, silverResult] = await Promise.allSettled([
        fetchMetalPrice('XAU'),
        fetchMetalPrice('XAG')
      ]);
      
      // Handle gold price
      if (goldResult.status === 'fulfilled') {
        goldPriceUSD = goldResult.value;
      } else {
        console.error('Gold price fetch failed:', goldResult.reason.message);
        // Try to use cached gold price if available
        if (cache.goldPerOz) {
          goldPriceUSD = cache.goldPerOz / cache.eurRate;
          source = 'cache-fallback';
          console.log('Using cached gold price due to fetch failure');
        } else {
          const fallback = getFallbackPrices();
          goldPriceUSD = fallback.gold;
          source = 'fallback';
          console.log('Using fallback gold price');
        }
      }
      
      // Handle silver price
      if (silverResult.status === 'fulfilled') {
        silverPriceUSD = silverResult.value;
      } else {
        console.error('Silver price fetch failed:', silverResult.reason.message);
        // Try to use cached silver price if available
        if (cache.silverPerOz) {
          silverPriceUSD = cache.silverPerOz / cache.eurRate;
          source = 'cache-fallback';
          console.log('Using cached silver price due to fetch failure');
        } else {
          const fallback = getFallbackPrices();
          silverPriceUSD = fallback.silver;
          source = 'fallback';
          console.log('Using fallback silver price');
        }
      }
      
      // Convert USD to EUR
      const goldPriceEUR = goldPriceUSD * eurRate;
      const silverPriceEUR = silverPriceUSD * eurRate;
      
      // Convert to per gram for easier frontend calculations
      const goldPerGram = goldPriceEUR / 31.1035;
      const silverPerGram = silverPriceEUR / 31.1035;
      
      // Update cache
      cache = {
        gold: goldPerGram,
        silver: silverPerGram,
        goldPerOz: goldPriceEUR,
        silverPerOz: silverPriceEUR,
        timestamp: now,
        eurRate: eurRate,
        source: source,
        error: null
      };
      
      console.log(`Prices updated: Gold €${goldPriceEUR.toFixed(2)}/oz, Silver €${silverPriceEUR.toFixed(2)}/oz`);
      
      // Return fresh prices
      res.json({
        gold: goldPerGram,
        silver: silverPerGram,
        goldPerOz: goldPriceEUR,
        silverPerOz: silverPriceEUR,
        eurRate: eurRate,
        source: source,
        cached: false,
        timestamp: now,
        retrievedAt: new Date(now).toISOString()
      });
      
    } catch (fetchError) {
      console.error('Error in price fetching process:', fetchError);
      
      // Return cached data even if expired (as requested)
      if (cache.timestamp) {
        console.log('Returning expired cached prices due to fetch error');
        res.json({
          gold: cache.gold,
          silver: cache.silver,
          goldPerOz: cache.goldPerOz,
          silverPerOz: cache.silverPerOz,
          eurRate: cache.eurRate,
          source: cache.source + ' (expired)',
          cached: true,
          timestamp: cache.timestamp,
          retrievedAt: new Date(cache.timestamp).toISOString(),
          error: fetchError.message
        });
      } else {
        // No cache available, use fallback
        const fallback = getFallbackPrices();
        const eurRateFallback = 0.92;
        const goldPriceEUR = fallback.gold * eurRateFallback;
        const silverPriceEUR = fallback.silver * eurRateFallback;
        const goldPerGram = goldPriceEUR / 31.1035;
        const silverPerGram = silverPriceEUR / 31.1035;
        
        res.json({
          gold: goldPerGram,
          silver: silverPerGram,
          goldPerOz: goldPriceEUR,
          silverPerOz: silverPriceEUR,
          eurRate: eurRateFallback,
          source: 'fallback',
          cached: false,
          timestamp: now,
          retrievedAt: new Date(now).toISOString(),
          error: fetchError.message
        });
      }
    }
    
  } catch (error) {
    console.error('Unexpected error in /api/prices:', error);
    res.status(500).json({
      error: 'Failed to fetch prices',
      details: error.message,
      timestamp: Date.now()
    });
  }
});

// Health check endpoint for prices service
router.get('/health', (req, res) => {
  const now = Date.now();
  const cacheAge = cache.timestamp ? now - cache.timestamp : null;
  const isCacheValid = cacheAge && cacheAge < CACHE_DURATION;
  
  res.json({
    status: 'ok',
    cache: {
      hasData: !!cache.timestamp,
      ageMs: cacheAge,
      isValid: isCacheValid,
      source: cache.source,
      gold: cache.goldPerOz ? `€${cache.goldPerOz.toFixed(2)}/oz` : null,
      silver: cache.silverPerOz ? `€${cache.silverPerOz.toFixed(2)}/oz` : null
    },
    timestamp: now
  });
});

module.exports = router;