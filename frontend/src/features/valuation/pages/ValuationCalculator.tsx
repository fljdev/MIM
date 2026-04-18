import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';
import { Calculator, Scale, TrendingUp, Euro, Shield, AlertCircle, Info } from 'lucide-react';

const ValuationCalculator: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [metal, setMetal] = useState<'gold' | 'silver'>('gold');
  const [weight, setWeight] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<'grams' | 'ounces' | 'troy_ounces' | 'kilograms'>('grams');
  const [purity, setPurity] = useState<string>('');
  const [karat, setKarat] = useState<string>('');
  const [country, setCountry] = useState<string>('IE');
  const [includeVAT, setIncludeVAT] = useState<boolean>(false);
  const [dealerMargin, setDealerMargin] = useState<string>('5.0');
  
  // Results state
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [spotPrices, setSpotPrices] = useState<{ gold: number; silver: number } | null>(null);
  
  // EU countries with VAT rates
  const euCountries = [
    { code: 'IE', name: 'Ireland', vatRate: 0.23 },
    { code: 'DE', name: 'Germany', vatRate: 0.19 },
    { code: 'FR', name: 'France', vatRate: 0.20 },
    { code: 'IT', name: 'Italy', vatRate: 0.22 },
    { code: 'ES', name: 'Spain', vatRate: 0.21 },
    { code: 'NL', name: 'Netherlands', vatRate: 0.21 },
    { code: 'BE', name: 'Belgium', vatRate: 0.21 },
    { code: 'AT', name: 'Austria', vatRate: 0.20 },
    { code: 'PT', name: 'Portugal', vatRate: 0.23 },
    { code: 'GR', name: 'Greece', vatRate: 0.24 },
    { code: 'FI', name: 'Finland', vatRate: 0.24 },
    { code: 'SE', name: 'Sweden', vatRate: 0.25 },
    { code: 'DK', name: 'Denmark', vatRate: 0.25 },
    { code: 'PL', name: 'Poland', vatRate: 0.23 },
    { code: 'CZ', name: 'Czech Republic', vatRate: 0.21 },
    { code: 'HU', name: 'Hungary', vatRate: 0.27 }
  ];

  // Karat to purity mapping
  const karatOptions = [
    { value: '24', label: '24k (99.9% pure)', purity: '0.999' },
    { value: '22', label: '22k (91.6% pure)', purity: '0.916' },
    { value: '18', label: '18k (75.0% pure)', purity: '0.750' },
    { value: '14', label: '14k (58.3% pure)', purity: '0.583' },
    { value: '10', label: '10k (41.7% pure)', purity: '0.417' },
    { value: '9', label: '9k (37.5% pure)', purity: '0.375' }
  ];

  // Default purities
  const defaultPurities = {
    gold: '0.999', // 99.9% pure gold
    silver: '0.925' // 92.5% sterling silver
  };

  // Fetch spot prices on mount
  useEffect(() => {
    const fetchSpotPrices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/valuation/spot-prices`);
        if (response.ok) {
          const data = await response.json();
          if (data.prices) {
            setSpotPrices({
              gold: data.prices.gold?.eur || 1800.50,
              silver: data.prices.silver?.eur || 22.75
            });
          }
        }
      } catch (error) {
        console.error('Error fetching spot prices:', error);
        // Fallback prices
        setSpotPrices({ gold: 1800.50, silver: 22.75 });
      }
    };

    fetchSpotPrices();
  }, []);

  // Handle karat selection
  const handleKaratChange = (selectedKarat: string) => {
    setKarat(selectedKarat);
    const selectedKaratOption = karatOptions.find(k => k.value === selectedKarat);
    if (selectedKaratOption && metal === 'gold') {
      setPurity(selectedKaratOption.purity);
    }
  };

  // Handle metal change
  const handleMetalChange = (selectedMetal: 'gold' | 'silver') => {
    setMetal(selectedMetal);
    setKarat('');
    setPurity('');
  };

  // Calculate valuation
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate inputs
    if (!weight || parseFloat(weight) <= 0) {
      setError('Please enter a valid weight');
      setLoading(false);
      return;
    }

    if (metal === 'gold' && !karat && !purity) {
      // Use default purity for gold
      setPurity(defaultPurities.gold);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/valuation/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metal,
          weight: parseFloat(weight),
          weight_unit: weightUnit,
          purity: purity ? parseFloat(purity) : undefined,
          karat: karat ? parseInt(karat) : undefined,
          country,
          include_vat: includeVAT,
          dealer_margin_percent: parseFloat(dealerMargin)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate valuation');
      }

      setCalculationResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setMetal('gold');
    setWeight('');
    setWeightUnit('grams');
    setPurity('');
    setKarat('');
    setCountry('IE');
    setIncludeVAT(false);
    setDealerMargin('5.0');
    setCalculationResult(null);
    setError(null);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
            <Calculator className="inline-block mr-3" />
            Gold & Silver Valuation Calculator
          </h1>
          <p className="text-lg text-amber-800 max-w-3xl mx-auto">
            Find out what your gold and silver items are really worth. Get accurate scrap value, market value, and collector value estimates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Calculator Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
              <Scale className="mr-3 text-amber-600" />
              Enter Your Item Details
            </h2>

            <form onSubmit={handleCalculate}>
              {/* Metal Selection */}
              <div className="mb-6">
                <label className="block text-amber-900 font-semibold mb-2">
                  What type of metal do you have?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleMetalChange('gold')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${metal === 'gold' ? 'border-amber-500 bg-amber-50' : 'border-amber-200 hover:border-amber-300'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 flex items-center justify-center mb-2">
                      <span className="text-white text-xl">Au</span>
                    </div>
                    <span className="font-bold text-amber-900">Gold</span>
                    <span className="text-sm text-amber-700">
                      {spotPrices ? `€${spotPrices.gold.toFixed(2)}/oz` : 'Loading...'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMetalChange('silver')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${metal === 'silver' ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-400 to-slate-300 flex items-center justify-center mb-2">
                      <span className="text-white text-xl">Ag</span>
                    </div>
                    <span className="font-bold text-gray-900">Silver</span>
                    <span className="text-sm text-gray-700">
                      {spotPrices ? `€${spotPrices.silver.toFixed(2)}/oz` : 'Loading...'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Weight Input */}
              <div className="mb-6">
                <label className="block text-amber-900 font-semibold mb-2">
                  Weight
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    step="0.01"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="flex-1 p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                    placeholder="Enter weight"
                    required
                  />
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value as any)}
                    className="p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                  >
                    <option value="grams">Grams</option>
                    <option value="ounces">Ounces</option>
                    <option value="troy_ounces">Troy Ounces</option>
                    <option value="kilograms">Kilograms</option>
                  </select>
                </div>
                <p className="text-sm text-amber-700 mt-2">
                  Common weights: Ring (2-10g), Chain (10-50g), Coin (7-31g), Bar (1-1000g)
                </p>
              </div>

              {/* Purity/Karat Selection */}
              <div className="mb-6">
                <label className="block text-amber-900 font-semibold mb-2">
                  {metal === 'gold' ? 'Karat/Purity' : 'Purity'}
                </label>
                
                {metal === 'gold' ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-amber-800 mb-2">Select Karat:</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {karatOptions.map((option) => (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => handleKaratChange(option.value)}
                            className={`p-3 rounded-lg border transition-all ${karat === option.value ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-amber-200 hover:border-amber-300 text-amber-800'}`}
                          >
                            <div className="font-bold">{option.value}k</div>
                            <div className="text-xs">{option.label.split('(')[1]?.replace(')', '')}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-amber-800 mb-2">Or Enter Custom Purity:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          max="1"
                          value={purity}
                          onChange={(e) => {
                            setPurity(e.target.value);
                            setKarat('');
                          }}
                          className="flex-1 p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                          placeholder="e.g., 0.999 for 99.9% pure"
                        />
                        <span className="text-amber-700">({purity ? (parseFloat(purity) * 100).toFixed(1) : '0'}%)</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <select
                      value={purity}
                      onChange={(e) => setPurity(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                    >
                      <option value="">Select purity...</option>
                      <option value="0.999">0.999 (99.9% Pure Silver)</option>
                      <option value="0.925">0.925 (92.5% Sterling Silver)</option>
                      <option value="0.900">0.900 (90% Coin Silver)</option>
                      <option value="0.800">0.800 (80% Silver)</option>
                      <option value="0.500">0.500 (50% Silver)</option>
                    </select>
                    <p className="text-sm text-gray-700 mt-2">
                      Sterling silver is 92.5% pure. Most silverware and jewellery is sterling.
                    </p>
                  </div>
                )}
              </div>

              {/* Advanced Options */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-amber-900">Advanced Options</h3>
                  <Info className="text-amber-600" size={20} />
                </div>
                
                {/* Country Selection */}
                <div className="mb-4">
                  <label className="block text-amber-800 mb-2">Country (for VAT calculation):</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                  >
                    {euCountries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} (VAT: {(country.vatRate * 100).toFixed(0)}%)
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Dealer Margin */}
                <div className="mb-4">
                  <label className="block text-amber-800 mb-2">
                    Dealer Margin (for scrap value):
                    <span className="ml-2 font-bold text-amber-600">{dealerMargin}%</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={dealerMargin}
                    onChange={(e) => setDealerMargin(e.target.value)}
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-amber-700 mt-1">
                    <span>1% (Best)</span>
                    <span>10% (Average)</span>
                    <span>20% (Worst)</span>
                  </div>
                  <p className="text-sm text-amber-700 mt-2">
                    Dealers typically pay spot price minus 5-15% for scrap gold/silver.
                  </p>
                </div>
                
                {/* VAT Toggle */}
                <div className="mb-6">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={includeVAT}
                        onChange={(e) => setIncludeVAT(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`block w-14 h-8 rounded-full ${includeVAT ? 'bg-amber-500' : 'bg-amber-200'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${includeVAT ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div className="ml-3">
                      <span className="text-amber-900 font-semibold">Include VAT in calculation</span>
                      <p className="text-sm text-amber-700">
                        {metal === 'gold' && purity && parseFloat(purity) >= 0.995 
                          ? 'Gold with purity ≥99.5% is VAT-exempt across the EU.'
                          : 'Silver is always subject to VAT. Gold jewellery (purity &lt; 99.5%) is subject to VAT.'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Calculating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Calculator className="mr-2" />
                      Calculate Value
                    </span>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-4 border-2 border-amber-300 text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center text-red-800">
                  <AlertCircle className="mr-2" />
                  <span className="font-bold">Error:</span>
                </div>
                <p className="mt-2 text-red-700">{error}</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <Shield className="inline-block mr-2" size={16} />
                <strong>Disclaimer:</strong> Valuations are estimates based on current spot prices. Actual dealer prices may vary based on market conditions, item condition, and dealer policies. Gold with purity ≥99.5% is VAT-exempt across EU. This tool is for informational purposes only.
              </p>
            </div>
          </div>

          {/* Right Column: Results Display */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
              <TrendingUp className="mr-3 text-amber-600" />
              Valuation Results
            </h2>

            {calculationResult ? (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-6 text-white">
                  <div className="text-center mb-4">
                    <div className="text-sm opacity-90">Estimated Value</div>
                    <div className="text-4xl font-bold">
                      {formatCurrency(calculationResult.valuation.values.pure_metal_value_eur)}
                    </div>
                    <div className="text-sm opacity-90 mt-2">
                      Pure Metal Value
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-sm opacity-90">Scrap Value</div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(calculationResult.valuation.values.scrap_value_eur)}
                      </div>
                      <div className="text-xs opacity-80">What dealers typically pay</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm opacity-90">With VAT</div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(calculationResult.valuation.values.total_with_vat_eur)}
                      </div>
                      <div className="text-xs opacity-80">If applicable</div>
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-amber-900">Detailed Breakdown</h3>
                  
                  {/* Item Details */}
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-amber-900 mb-2">Item Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-amber-700">Metal</div>
                        <div className="font-bold text-amber-900 capitalize">{calculationResult.valuation.metal}</div>
                      </div>
                      <div>
                        <div className="text-sm text-amber-700">Weight</div>
                        <div className="font-bold text-amber-900">
                          {calculationResult.valuation.weight.input} {calculationResult.valuation.weight.unit}
                          <div className="text-xs text-amber-700">
                            ({calculationResult.valuation.weight.grams.toFixed(2)}g / {calculationResult.valuation.weight.troy_ounces.toFixed(3)} troy oz)
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-amber-700">Purity</div>
                        <div className="font-bold text-amber-900">
                          {calculationResult.valuation.purity.percentage}
                          {calculationResult.valuation.purity.karat && ` (${calculationResult.valuation.purity.karat}k)`}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-amber-700">Spot Price</div>
                        <div className="font-bold text-amber-900">
                          €{calculationResult.valuation.spot_price.eur_per_troy_ounce.toFixed(2)}/oz
                          <div className="text-xs text-amber-700">
                            Source: {calculationResult.valuation.spot_price.source}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Value Breakdown */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Value Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Pure Metal Value:</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(calculationResult.valuation.values.pure_metal_value_eur)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Scrap Value (Dealer Price):</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(calculationResult.valuation.values.scrap_value_eur)}
                          <div className="text-xs text-gray-600">
                            After {calculationResult.valuation.values.dealer_margin_percent}% dealer margin
                          </div>
                        </span>
                      </div>
                      
                      {/* VAT Section */}
                      {calculationResult.valuation.values.vat.applicable && (
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">VAT ({country}):</span>
                            <span className="font-bold text-red-600">
                              + {formatCurrency(calculationResult.valuation.values.vat.amount_eur)}
                              <div className="text-xs text-gray-600">
                                Rate: {(calculationResult.valuation.values.vat.rate * 100).toFixed(0)}%
                              </div>
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-gray-700 font-semibold">Total with VAT:</span>
                            <span className="font-bold text-gray-900">
                              {formatCurrency(calculationResult.valuation.values.total_with_vat_eur)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Currency Conversions */}
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-amber-900 mb-2">Currency Conversions</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-amber-700">USD</div>
                        <div className="font-bold text-amber-900">
                          ${calculationResult.valuation.conversions.usd.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-amber-700">GBP</div>
                        <div className="font-bold text-amber-900">
                          £{calculationResult.valuation.conversions.gbp.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-amber-700">Bitcoin</div>
                        <div className="font-bold text-amber-900">
                          {calculationResult.valuation.conversions.bitcoin.toFixed(6)} BTC
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
                    <h4 className="font-bold text-white mb-4">What Next?</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => navigate('/marketplace')}
                        className="w-full p-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Sell on Marketplace
                      </button>
                      <button
                        onClick={() => navigate('/dealers')}
                        className="w-full p-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
                      >
                        Find Trusted Dealers
                      </button>
                      <button
                        onClick={() => navigate('/valuation/history')}
                        className="w-full p-3 border-2 border-amber-500 text-amber-400 font-bold rounded-lg hover:bg-amber-500/10 transition-colors"
                      >
                        Save This Valuation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <Euro className="w-12 h-12 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-amber-900 mb-2">No Valuation Yet</h3>
                <p className="text-amber-700 max-w-md mx-auto">
                  Enter your gold or silver details in the calculator to see its estimated value.
                  Get accurate scrap value, market value, and VAT calculations.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center text-amber-800">
                    <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center mr-3">
                      <span className="font-bold">1</span>
                    </div>
                    <span>Enter weight and purity of your item</span>
                  </div>
                  <div className="flex items-center text-amber-800">
                    <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center mr-3">
                      <span className="font-bold">2</span>
                    </div>
                    <span>Get instant valuation based on live spot prices</span>
                  </div>
                  <div className="flex items-center text-amber-800">
                    <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center mr-3">
                      <span className="font-bold">3</span>
                    </div>
                    <span>See scrap value (what dealers actually pay)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-amber-900 mb-2">Understanding Scrap Value</h3>
            <p className="text-amber-700 text-sm">
              Scrap value is what dealers typically pay for your gold/silver. It's spot price minus dealer margin (5-15%). Dealers need to cover refining costs, overhead, and make a profit.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-amber-900 mb-2">VAT Rules in EU</h3>
            <p className="text-amber-700 text-sm">
              Investment gold (≥99.5% purity) is VAT-exempt across EU. Silver is always subject to VAT. Gold jewellery (&lt; 99.5% purity) is also subject to VAT at your country's standard rate.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-amber-900 mb-2">Get the Best Price</h3>
            <p className="text-amber-700 text-sm">
              Shop around multiple dealers. Consider P2P marketplace for better prices. Get items professionally appraised if you suspect collector value. Always meet at safe, verified locations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuationCalculator;