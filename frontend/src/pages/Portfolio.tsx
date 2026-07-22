import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { API_BASE_URL } from '../Config';
import { Calculator, Scale, TrendingUp, Shield, AlertCircle, Info, Edit, List, Plus, X, Check, Lock, Upload, Loader2, ChevronDown } from 'lucide-react';
import HoldingImageUpload from '../components/HoldingImageUpload';
import CryptoSection from '../components/CryptoSection';

// TypeScript interfaces
interface SpotPrices {
  gold: number;
  silver: number;
}

interface Holding {
  id: number;
  user_id: number;
  metal_type: 'gold' | 'silver' | 'platinum' | 'palladium';
  category: 'sovereign' | 'coin' | 'bar' | 'round' | 'junk' | 'jewellery' | 'flatware' | 'other';
  subcategory?: string;
  name: string;
  quantity: number;
  weight_grams: number;
  purity: number;
  purchase_price: number | null;
  purchase_date: string | null;
  graded: boolean;
  grade_cert: string | null;
  notes: string | null;
  images: string[];
  is_listed: boolean;
  created_at: string;
  updated_at: string;
  listing_id?: number;
  asking_price?: number;
  price_type?: string;
  listing_status?: string;
}

interface AddHoldingFormData {
  name: string;
  metal_type: 'gold' | 'silver' | 'platinum' | 'palladium';
  category: 'sovereign' | 'bar' | 'coin';
  subcategory: string;
  denomination: string;
  quantity: number;
  weight_grams: number;
  purity: number | string;
  purchase_price: string;
  purchase_date: string;
  graded: boolean;
  grade_cert: string;
  notes: string;
}

interface EditHoldingFormData extends AddHoldingFormData {
  id: number;
  is_listed: boolean;
}

// Book interface
interface Book {
  id: number;
  user_id: number;
  title: string;
  author: string | null;
  year_published: number | null;
  edition: string | null;
  is_signed: boolean;
  condition: string | null;
  estimated_value_eur: number | null;
  purchase_price_eur: number | null;
  purchase_date: string | null;
  notes: string | null;
  images: string[];
  created_at: string;
}

// Cash holding interface
interface CashHolding {
  id: number;
  user_id: number;
  label: string;
  type: 'bank_account' | 'cash_physical' | 'savings' | 'overdraft' | 'loan' | 'other';
  currency: string;
  amount: number;
  institution: string | null;
  notes: string | null;
  created_at: string;
}

// Add Book form data
interface AddBookFormData {
  title: string;
  author: string;
  year_published: string;
  edition: string;
  is_signed: boolean;
  condition: string;
  estimated_value_eur: string;
  purchase_price_eur: string;
  purchase_date: string;
  notes: string;
}

// Edit Book form data
interface EditBookFormData extends AddBookFormData {
  id: number;
}

// Add Cash form data
interface AddCashFormData {
  label: string;
  type: string;
  currency: string;
  amount: string;
  institution: string;
  notes: string;
}

// Edit Cash form data
interface EditCashFormData extends AddCashFormData {
  id: number;
}

// Metal section grouping
interface MetalSection {
  key: string;
  label: string;
  icon: string; // 'Au' or 'Ag'
  iconColor: string; // badge bg color
  match: (h: Holding) => boolean;
}

interface MetalSectionData {
  section: MetalSection;
  holdings: Holding[];
  subtotals: {
    fineOz: number;
    spotValue: number;
    purchasePrice: number;
    pl: number;
  };
}

// Metal section definitions for grouping holdings
const METAL_SECTIONS: MetalSection[] = [
  {
    key: 'gold_sovereigns',
    label: 'Gold Sovereigns',
    icon: 'Au',
    iconColor: 'bg-amber-500',
    match: (h) => h.metal_type === 'gold' && h.category === 'sovereign' && !h.graded,
  },
  {
    key: 'graded_sovereigns',
    label: 'Graded Sovereigns',
    icon: 'Au',
    iconColor: 'bg-amber-600',
    match: (h) => h.metal_type === 'gold' && h.category === 'sovereign' && h.graded === true,
  },
  {
    key: 'gold_coins',
    label: 'Gold Coins',
    icon: 'Au',
    iconColor: 'bg-amber-500',
    match: (h) => h.metal_type === 'gold' && h.category === 'coin',
  },
  {
    key: 'gold_bars',
    label: 'Gold Bars',
    icon: 'Au',
    iconColor: 'bg-amber-500',
    match: (h) => h.metal_type === 'gold' && (h.category === 'bar' || h.category === 'round'),
  },
  {
    key: 'silver_bullion',
    label: 'Silver Bullion',
    icon: 'Ag',
    iconColor: 'bg-gray-400',
    match: (h) => h.metal_type === 'silver' && (h.subcategory || 'bullion') === 'bullion',
  },
  {
    key: 'silver_coins',
    label: 'Silver Coins',
    icon: 'Ag',
    iconColor: 'bg-gray-400',
    match: (h) => h.metal_type === 'silver' && h.category === 'coin' && (h.subcategory || '') === 'collectible',
  },
  {
    key: 'silver_jewellery',
    label: 'Silver Jewellery',
    icon: 'Ag',
    iconColor: 'bg-gray-400',
    match: (h) => h.metal_type === 'silver' && (h.subcategory || '') === 'jewellery',
  },
  {
    key: 'other_metals',
    label: 'Other Metals',
    icon: 'M',
    iconColor: 'bg-teal-500',
    match: (h) => {
      const isGoldSovereign = h.metal_type === 'gold' && h.category === 'sovereign';
      const isGoldCoin = h.metal_type === 'gold' && h.category === 'coin';
      const isGoldBar = h.metal_type === 'gold' && (h.category === 'bar' || h.category === 'round');
      const isSilverBullion = h.metal_type === 'silver' && (h.subcategory || 'bullion') === 'bullion';
      const isSilverCoin = h.metal_type === 'silver' && h.category === 'coin' && (h.subcategory || '') === 'collectible';
      const isSilverJewellery = h.metal_type === 'silver' && (h.subcategory || '') === 'jewellery';
      return !(isGoldSovereign || isGoldCoin || isGoldBar || isSilverBullion || isSilverCoin || isSilverJewellery);
    },
  },
];

// Group holdings into sections, computing subtotals
function getMetalSections(holdings: Holding[], spotPrices: SpotPrices | null): MetalSectionData[] {
  return METAL_SECTIONS.map(section => {
    const sectionHoldings = holdings.filter(section.match);
    if (sectionHoldings.length === 0) return null;
    const subtotals = sectionHoldings.reduce((acc, h) => {
      const fineOz = (Number(h.weight_grams) * Number(h.purity)) / 31.1035 * Number(h.quantity);
      const spotPrice = h.metal_type === 'gold' ? (spotPrices?.gold || 0) : (spotPrices?.silver || 0);
      const spotValue = fineOz * spotPrice;
      const purchasePrice = Number(h.purchase_price) || 0;
      const pl = h.subcategory === 'numismatic' ? 0 : (spotValue - purchasePrice);
      return {
        fineOz: acc.fineOz + fineOz,
        spotValue: acc.spotValue + spotValue,
        purchasePrice: acc.purchasePrice + purchasePrice,
        pl: acc.pl + pl,
      };
    }, { fineOz: 0, spotValue: 0, purchasePrice: 0, pl: 0 });
    return { section, holdings: sectionHoldings, subtotals };
  }).filter((s): s is MetalSectionData => s !== null);
}

const Portfolio: React.FC = () => {

  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for holdings and spot prices
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [spotPrices, setSpotPrices] = useState<SpotPrices | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [cashHoldings, setCashHoldings] = useState<any[]>([]);
  const [cryptoTotal, setCryptoTotal] = useState<number>(0);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showListingModal, setShowListingModal] = useState<boolean>(false);
  
  // Form states
  const [addFormData, setAddFormData] = useState<AddHoldingFormData>({
    name: '',
    metal_type: 'gold',
    category: 'sovereign',
    subcategory: 'bullion',
    denomination: '1oz',
    quantity: 1,
    weight_grams: 7.98805,
    purity: '0.9167',
    purchase_price: '',
    purchase_date: '',
    graded: false,
    grade_cert: '',
    notes: ''
  });

  const [editFormData, setEditFormData] = useState<EditHoldingFormData>({
    id: 0,
    name: '',
    metal_type: 'gold',
    category: 'sovereign',
    subcategory: 'bullion',
    denomination: '1oz',
    quantity: 1,
    weight_grams: 7.98805,
    purity: '0.9167',
    purchase_price: '',
    purchase_date: '',
    graded: false,
    grade_cert: '',
    notes: '',
    is_listed: false
  });

  const [selectedHoldingForListing, setSelectedHoldingForListing] = useState<Holding | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [customPurity, setCustomPurity] = useState<boolean>(false);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editHoldingId, setEditHoldingId] = useState<number>(0);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [imageUploading, setImageUploading] = useState<boolean>(false);

  // New cascading form state
  const [holdingType, setHoldingType] = useState<string>('');
  const [holdingTypeOther, setHoldingTypeOther] = useState<string>('');
  const [collectorsPieceMint, setCollectorsPieceMint] = useState<string>('');

  // Listing form states
  const [listingFormData, setListingFormData] = useState({
    price_type: 'fixed',
    asking_price: '',
    spot_premium: '',
    location_county: '',
    postage_offered: false,
    visible_to: 'all'
  });
  const [listingFormError, setListingFormError] = useState<string | null>(null);
  const [listingSubmitting, setListingSubmitting] = useState<boolean>(false);

  // Book modal states
  const [showAddBookModal, setShowAddBookModal] = useState<boolean>(false);
  const [showEditBookModal, setShowEditBookModal] = useState<boolean>(false);
  const [addBookFormData, setAddBookFormData] = useState<AddBookFormData>({
    title: '',
    author: '',
    year_published: '',
    edition: '',
    is_signed: false,
    condition: '',
    estimated_value_eur: '',
    purchase_price_eur: '',
    purchase_date: '',
    notes: ''
  });
  const [editBookFormData, setEditBookFormData] = useState<EditBookFormData>({
    id: 0,
    title: '',
    author: '',
    year_published: '',
    edition: '',
    is_signed: false,
    condition: '',
    estimated_value_eur: '',
    purchase_price_eur: '',
    purchase_date: '',
    notes: ''
  });
  const [bookPendingImages, setBookPendingImages] = useState<File[]>([]);
  const [bookImageUploading, setBookImageUploading] = useState<boolean>(false);

  // Cash modal states
  const [showAddCashModal, setShowAddCashModal] = useState<boolean>(false);
  const [showEditCashModal, setShowEditCashModal] = useState<boolean>(false);
  const [addCashFormData, setAddCashFormData] = useState<AddCashFormData>({
    label: '',
    type: 'bank_account',
    currency: 'EUR',
    amount: '',
    institution: '',
    notes: ''
  });
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // Track viewport size for responsive collapse behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On mobile -> collapse all; on desktop -> expand all
      setExpandedSections(prev => {
        const allKeys = METAL_SECTIONS.map(s => s.key);
        const next: Record<string, boolean> = {};
        allKeys.forEach(key => { next[key] = !mobile; });
        return { ...prev, ...next };
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle a single section open/closed
  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [editCashFormData, setEditCashFormData] = useState<EditCashFormData>({
    id: 0,
    label: '',
    type: 'bank_account',
    currency: 'EUR',
    amount: '',
    institution: '',
    notes: ''
  });

  // Check for token on mount

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchHoldings();
    fetchSpotPrices();
    fetchBooks();
    fetchCash();
  }, [navigate]);

  // — DENOMINATION CONFIG LOOKUP —
  // Each entry: value, label (for dropdown), grams (per unit), purity
  interface DenomOption {
    value: string;
    label: string;
    grams: number;
    purity: number;
  }

  const denominationConfig: Record<string, DenomOption[]> = {
    sovereign: [
      { value: 'full_sovereign', label: 'Full Sovereign (7.98805g, 0.9167)', grams: 7.98805, purity: 0.9167 },
      { value: 'half_sovereign', label: 'Half Sovereign (3.99g, 0.9167)', grams: 3.99, purity: 0.9167 },
      { value: 'double_sovereign', label: 'Double Sovereign (15.976g, 0.9167)', grams: 15.976, purity: 0.9167 },
      { value: 'five_sovereign_set', label: 'Five Sovereign Set (39.94g, 0.9167)', grams: 39.94, purity: 0.9167 },
    ],
    gold_coin: [
      { value: '1oz', label: '1 oz (31.1035g, 0.9999)', grams: 31.1035, purity: 0.9999 },
      { value: 'half_oz', label: '1/2 oz (15.5518g, 0.9999)', grams: 15.5518, purity: 0.9999 },
      { value: 'quarter_oz', label: '1/4 oz (7.7759g, 0.9999)', grams: 7.7759, purity: 0.9999 },
      { value: 'tenth_oz', label: '1/10 oz (3.1104g, 0.9999)', grams: 3.1104, purity: 0.9999 },
    ],
    silver_coin_britannia: [
      { value: 'single_1oz', label: 'Single 1 oz (31.1035g, 0.999)', grams: 31.1035, purity: 0.999 },
      { value: '2oz', label: '2 oz (62.207g, 0.999)', grams: 62.207, purity: 0.999 },
      { value: '10oz', label: '10 oz (311.035g, 0.999)', grams: 311.035, purity: 0.999 },
      { value: 'kilo', label: 'Kilo (1000g, 0.999)', grams: 1000, purity: 0.999 },
      { value: 'tube_25', label: 'Tube of 25 (777.5875g, 0.999)', grams: 777.5875, purity: 0.999 },
    ],
    silver_coin_philharmonic: [
      { value: 'single_1oz', label: 'Single 1 oz (31.1035g, 0.999)', grams: 31.1035, purity: 0.999 },
      { value: '2oz', label: '2 oz (62.207g, 0.999)', grams: 62.207, purity: 0.999 },
      { value: 'tube_20', label: 'Tube of 20 (622.07g, 0.999)', grams: 622.07, purity: 0.999 },
    ],
    silver_coin_eagle: [
      { value: 'single_1oz', label: 'Single 1 oz (31.1035g, 0.999)', grams: 31.1035, purity: 0.999 },
      { value: '2oz', label: '2 oz (62.207g, 0.999)', grams: 62.207, purity: 0.999 },
      { value: '10oz', label: '10 oz (311.035g, 0.999)', grams: 311.035, purity: 0.999 },
      { value: 'tube_25', label: 'Tube of 25 (777.5875g, 0.999)', grams: 777.5875, purity: 0.999 },
    ],
    silver_coin_maple: [
      { value: 'single_1oz', label: 'Single 1 oz (31.1035g, 0.999)', grams: 31.1035, purity: 0.999 },
      { value: '2oz', label: '2 oz (62.207g, 0.999)', grams: 62.207, purity: 0.999 },
      { value: '10oz', label: '10 oz (311.035g, 0.999)', grams: 311.035, purity: 0.999 },
      { value: 'kilo', label: 'Kilo (1000g, 0.999)', grams: 1000, purity: 0.999 },
      { value: 'tube_25', label: 'Tube of 25 (777.5875g, 0.999)', grams: 777.5875, purity: 0.999 },
    ],
    silver_coin_kraken: [
      { value: '2oz', label: '2 oz (62.207g, 0.9999)', grams: 62.207, purity: 0.9999 },
      { value: 'custom', label: 'Custom (manual weight entry)', grams: 0, purity: 0 },
    ],
    silver_coin_collectors_piece: [],
    silver_coin_other: [
      { value: 'single_1oz', label: 'Single 1 oz (31.1035g, 0.999)', grams: 31.1035, purity: 0.999 },
      { value: '2oz', label: '2 oz (62.207g, 0.999)', grams: 62.207, purity: 0.999 },
      { value: '10oz', label: '10 oz (311.035g, 0.999)', grams: 311.035, purity: 0.999 },
      { value: 'kilo', label: 'Kilo (1000g, 0.999)', grams: 1000, purity: 0.999 },
      { value: 'tube_20', label: 'Tube of 20 (622.07g, 0.999)', grams: 622.07, purity: 0.999 },
      { value: 'tube_25', label: 'Tube of 25 (777.5875g, 0.999)', grams: 777.5875, purity: 0.999 },
      { value: 'custom', label: 'Custom (manual weight entry)', grams: 0, purity: 0 },
    ],
    silver_bar: [
      { value: '10oz', label: '10 oz (311.035g, 0.999)', grams: 311.035, purity: 0.999 },
      { value: '100oz', label: '100 oz (3110.35g, 0.999)', grams: 3110.35, purity: 0.999 },
      { value: 'kilo', label: 'Kilo (1000g, 0.999)', grams: 1000, purity: 0.999 },
    ],
    gold_bar: [
      { value: '1g', label: '1g (1g, 0.9999)', grams: 1, purity: 0.9999 },
      { value: '5g', label: '5g (5g, 0.9999)', grams: 5, purity: 0.9999 },
      { value: '10g', label: '10g (10g, 0.9999)', grams: 10, purity: 0.9999 },
      { value: '1oz', label: '1 oz (31.1035g, 0.9999)', grams: 31.1035, purity: 0.9999 },
      { value: '100g', label: '100g (100g, 0.9999)', grams: 100, purity: 0.9999 },
    ],
  };

  // Determine config key for denomination lookup based on selections
  const getDenomConfigKey = (metal: string, category: string, type: string): string | null => {
    if (category === 'sovereign') return 'sovereign';
    if (category === 'bar' && metal === 'gold') return 'gold_bar';
    if (category === 'bar' && metal === 'silver') return 'silver_bar';
    // For platinum/palladium bars or coins — no standard denominations
    if (metal === 'platinum' || metal === 'palladium') return null;
    if (category === 'coin' && metal === 'gold') return 'gold_coin';
    if (category === 'coin' && metal === 'silver') {
      switch (type) {
        case 'britannia': return 'silver_coin_britannia';
        case 'philharmonic': return 'silver_coin_philharmonic';
        case 'eagle': return 'silver_coin_eagle';
        case 'maple': return 'silver_coin_maple';
        case 'kraken': return 'silver_coin_kraken';
        case 'collectors_piece': return 'silver_coin_collectors_piece';
        default: return 'silver_coin_other';
      }
    }
    return null;
  };

  // Get denomination options for current context
  const getDenomOptions = (): DenomOption[] => {
    const key = getDenomConfigKey(addFormData.metal_type, addFormData.category, holdingType);
    return key ? denominationConfig[key] || [] : [];
  };

  // Find denomination option by value
  const findDenomOption = (value: string): DenomOption | undefined => {
    const options = getDenomOptions();
    return options.find(o => o.value === value);
  };

  // Auto-suggest name based on selections
  const autoSuggestName = (): string => {
    const { metal_type, category } = addFormData;
    const capitalizedMetal = metal_type.charAt(0).toUpperCase() + metal_type.slice(1);
    
    if (category === 'sovereign') {
      switch (addFormData.denomination) {
        case 'full_sovereign': return `Full Gold Sovereign`;
        case 'half_sovereign': return `Half Gold Sovereign`;
        case 'double_sovereign': return `Double Gold Sovereign`;
        case 'five_sovereign_set': return `Five Gold Sovereign Set`;
        default: return `${capitalizedMetal} Sovereign`;
      }
    }
    
    if (!addFormData.denomination && !holdingType) return '';
    
    const denom = findDenomOption(addFormData.denomination);
    if (!denom) return '';
    
    // Extract clean label prefix (everything before the first '('
    const cleanLabel = denom.label.split(' (')[0].trim();
    
    // Build type name
    let typeName = '';
    if (holdingType) {
      typeName = holdingType.charAt(0).toUpperCase() + holdingType.slice(1);
      // Handle special display names
      if (holdingType === 'kraken') typeName = 'Kraken (Creatures of the North)';
    }
    
    return `${cleanLabel} ${capitalizedMetal} ${typeName}`.trim();
  };

  // Get type options for Step 3 dropdown
  const getTypeOptions = (): { value: string; label: string }[] => {
    const { metal_type, category } = addFormData;
    if (category === 'sovereign') return [];
    if (category === 'coin' && metal_type === 'gold') {
      return [
        { value: 'britannia', label: 'Britannia' },
        { value: 'krugerrand', label: 'Krugerrand' },
        { value: 'maple', label: 'Maple' },
        { value: 'eagle', label: 'Eagle' },
        { value: 'philharmonic', label: 'Philharmonic' },
        { value: 'other', label: 'Other' },
      ];
    }
    if (category === 'bar' && metal_type === 'gold') {
      return [
        { value: 'pamp', label: 'PAMP' },
        { value: 'heraeus', label: 'Heraeus' },
        { value: 'royal_mint', label: 'Royal Mint' },
        { value: 'other', label: 'Other' },
      ];
    }
    if (category === 'coin' && metal_type === 'silver') {
      return [
        { value: 'britannia', label: 'Britannia' },
        { value: 'philharmonic', label: 'Philharmonic' },
        { value: 'eagle', label: 'Eagle' },
        { value: 'maple', label: 'Maple' },
        { value: 'kraken', label: 'Kraken (Creatures of the North)' },
        { value: 'collectors_piece', label: "Collector's Piece" },
        { value: 'other', label: 'Other' },
      ];
    }
    if (category === 'bar' && metal_type === 'silver') {
      return [
        { value: '10oz_bar', label: '10 oz Bar' },
        { value: '100oz_bar', label: '100 oz Bar' },
        { value: 'kilo_bar', label: 'Kilo Bar' },
        { value: 'other', label: 'Other' },
      ];
    }
    // Platinum or Palladium — free-text, so return empty
    return [];
  };

  // Reset downstream fields when an upstream field changes
  const resetDownstreamFields = (fromStep: number) => {
    if (fromStep <= 2) {
      setHoldingType('');
      setHoldingTypeOther('');
      setCollectorsPieceMint('');
    }
    if (fromStep <= 3) {
      setAddFormData(prev => ({
        ...prev,
        denomination: '',
        name: '',
        weight_grams: 0,
        purity: '0.999',
        graded: false,
        grade_cert: '',
      }));
    }
    if (fromStep <= 4) {
      setAddFormData(prev => ({
        ...prev,
        weight_grams: 0,
        purity: '0.999',
      }));
    }
  };


  // Fetch holdings from API
  const fetchHoldings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/holdings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHoldings(data);
        setError(null);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to fetch holdings');
      }
    } catch (err) {
      console.error('Error fetching holdings:', err);
      setError('Failed to fetch holdings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch spot prices
  const fetchSpotPrices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/prices`);
      if (response.ok) {
        const data = await response.json();
        setSpotPrices({
          gold: data.goldPerOz || 1800.50,
          silver: data.silverPerOz || 22.75
        });
      } else {
        // Fallback prices
        setSpotPrices({ gold: 1800.50, silver: 22.75 });
      }
    } catch (error) {
      console.error('Error fetching spot prices:', error);
      setSpotPrices({ gold: 1800.50, silver: 22.75 });
    }
  };

  // Fetch books from API
  const fetchBooks = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/books`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  // Fetch cash holdings from API
  const fetchCash = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/cash`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCashHoldings(data);
      }
    } catch (err) {
      console.error('Error fetching cash holdings:', err);
    }
  };

  // Calculate holding details
  const calculateHoldingDetails = (holding: Holding) => {
    const fineOz = (Number(holding.weight_grams) * Number(holding.purity)) / 31.1035 * Number(holding.quantity);
    const spotPrice = holding.metal_type === 'gold' 
      ? (spotPrices?.gold || 0) 
      : (spotPrices?.silver || 0);
    const spotValueEUR = fineOz * spotPrice;
    const purchasePrice = Number(holding.purchase_price) || 0;
    const pl = spotValueEUR - purchasePrice;

    return {
      fineOz,
      spotValueEUR,
      purchasePrice,
      pl,
      spotPrice
    };
  };

  // Format currency — always show exactly 2 decimal places
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(amount));
  };

  // Handle add file selection for pending images
  const handleAddFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files);
    setPendingImages(prev => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 3);
    });
    
    // Reset input value so the same files can be selected again
    e.target.value = '';
  };

  // Handle remove pending file
  const handleRemovePendingFile = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle add holding form submission
  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const purityValue = typeof addFormData.purity === 'string' 
        ? parseFloat(addFormData.purity) 
        : addFormData.purity;

      const response = await fetch(`${API_BASE_URL}/api/holdings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: addFormData.name,
          metal_type: addFormData.metal_type,
          category: addFormData.category,
          subcategory: addFormData.subcategory,
          quantity: addFormData.quantity,
          weight_grams: addFormData.weight_grams,
          purity: purityValue,
          purchase_price: addFormData.purchase_price ? parseFloat(addFormData.purchase_price) : null,
          purchase_date: addFormData.purchase_date || null,
          graded: addFormData.graded,
          grade_cert: addFormData.graded ? addFormData.grade_cert : null,
          notes: addFormData.notes || null
        })
      });

      if (response.ok) {
        const holdingData = await response.json();
        const holdingId = holdingData.id || holdingData.holding?.id;

        // Upload any pending images now that we have a holding ID
        if (holdingId && pendingImages.length > 0) {
          setImageUploading(true);
          try {
            const formData = new FormData();
            pendingImages.forEach(file => {
              formData.append('images', file);
            });
            await fetch(`${API_BASE_URL}/api/holdings/${holdingId}/images`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });
          } catch (imgErr) {
            console.error('Error uploading images:', imgErr);
            // Non-fatal: holding was created, just images failed
          } finally {
            setImageUploading(false);
          }
        }

        setShowAddModal(false);
        resetAddForm();
        fetchHoldings();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add holding');
      }
    } catch (err) {
      console.error('Error adding holding:', err);
      setError('Failed to add holding');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit holding form submission
  const handleEditHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const purityValue = typeof editFormData.purity === 'string' 
        ? parseFloat(editFormData.purity) 
        : editFormData.purity;

      const response = await fetch(`${API_BASE_URL}/api/holdings/${editFormData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editFormData.name,
          metal_type: editFormData.metal_type,
          category: editFormData.category,
          subcategory: editFormData.subcategory,
          quantity: editFormData.quantity,
          weight_grams: editFormData.weight_grams,
          purity: purityValue,
          purchase_price: editFormData.purchase_price ? parseFloat(editFormData.purchase_price) : null,
          purchase_date: editFormData.purchase_date || null,
          graded: editFormData.graded,
          grade_cert: editFormData.graded ? editFormData.grade_cert : null,
          notes: editFormData.notes || null,
          is_listed: editFormData.is_listed
        })
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchHoldings();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update holding');
      }
    } catch (err) {
      console.error('Error updating holding:', err);
      setError('Failed to update holding');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle unlist holding
  const handleUnlistHolding = async (holdingId: number, listingId?: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!listingId) {
      setError('No listing found to unlist');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update holding to set is_listed = false
        await fetch(`${API_BASE_URL}/api/holdings/${holdingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ is_listed: false })
        });
        
        fetchHoldings();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to unlist holding');
      }
    } catch (err) {
      console.error('Error unlisting holding:', err);
      setError('Failed to unlist holding');
    }
  };

  // Reset add form
  const resetAddForm = () => {
    setAddFormData({
      name: '',
      metal_type: 'gold',
      category: 'sovereign',
      subcategory: 'bullion',
      denomination: '',
      quantity: 1,
      weight_grams: 0,
      purity: '0.9167',
      purchase_price: '',
      purchase_date: '',
      graded: false,
      grade_cert: '',
      notes: ''
    });
    setHoldingType('');
    setHoldingTypeOther('');
    setCollectorsPieceMint('');
    setCustomPurity(false);
    setPendingImages([]);
  };

  // Open edit modal
  const openEditModal = (holding: Holding) => {
    setEditFormData({
      id: holding.id,
      name: holding.name,
      metal_type: holding.metal_type,
      category: holding.category as any,
      subcategory: holding.subcategory ?? 'bullion',
      denomination: '1oz',
      quantity: holding.quantity,
      weight_grams: holding.weight_grams,
      purity: holding.purity.toString(),
      purchase_price: holding.purchase_price?.toString() || '',
      purchase_date: holding.purchase_date || '',
      graded: holding.graded,
      grade_cert: holding.grade_cert || '',
      notes: holding.notes || '',
      is_listed: holding.is_listed
    });
    setEditImages(holding.images ?? []);
    setEditHoldingId(holding.id);
    setShowEditModal(true);
  };

  // Open listing modal
  const openListingModal = (holding: Holding) => {
    setSelectedHoldingForListing(holding);
    setListingFormData({
      price_type: 'fixed',
      asking_price: '',
      spot_premium: '',
      location_county: '',
      postage_offered: false,
      visible_to: 'all'
    });
    setListingFormError(null);
    setShowListingModal(true);
  };

  // Handle delete holding
  const handleDeleteHolding = async (holdingId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!window.confirm('Are you sure you want to delete this holding?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/holdings/${holdingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setHoldings(prev => prev.filter(h => h.id !== holdingId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete holding');
      }
    } catch (err) {
      console.error('Error deleting holding:', err);
      setError('Failed to delete holding');
    }
  };

  // Handle listing form submission
  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!selectedHoldingForListing) {
      setListingFormError('No holding selected');
      return;
    }

    // Validate required fields
    if (!listingFormData.price_type) {
      setListingFormError('Price type is required');
      return;
    }

    if (!listingFormData.location_county) {
      setListingFormError('Location county is required');
      return;
    }

    // Validate conditional fields
    if (listingFormData.price_type === 'fixed' && !listingFormData.asking_price) {
      setListingFormError('Asking price is required for fixed price listings');
      return;
    }

    if (listingFormData.price_type === 'spot_plus' && !listingFormData.spot_premium) {
      setListingFormError('Spot premium is required for spot plus listings');
      return;
    }

    setListingSubmitting(true);
    setListingFormError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/listings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          holding_id: selectedHoldingForListing.id,
          price_type: listingFormData.price_type,
          asking_price: listingFormData.price_type === 'fixed' ? parseFloat(listingFormData.asking_price) : null,
          spot_premium: listingFormData.price_type === 'spot_plus' ? parseFloat(listingFormData.spot_premium) : null,
          location_county: listingFormData.location_county,
          postage_offered: listingFormData.postage_offered,
          visible_to: listingFormData.visible_to
        })
      });

      if (response.ok) {
        // Success
        fetchHoldings(); // Refresh holdings to update is_listed status
        setShowListingModal(false);
        setListingFormError(null);
      } else {
        const errorData = await response.json();
        setListingFormError(errorData.error || 'Failed to create listing');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      setListingFormError('Failed to create listing');
    } finally {
      setListingSubmitting(false);
    }
  };

  // Calculate fine oz for a holding
  const calculateFineOz = (holding: Holding) => {
    return (Number(holding.weight_grams) * Number(holding.purity)) / 31.1035 * Number(holding.quantity);
  };

  // Calculate spot plus price
  const calculateSpotPlusPrice = () => {
    if (!selectedHoldingForListing) return null;
    if (!listingFormData.spot_premium) return null;
    
    const fineOz = calculateFineOz(selectedHoldingForListing);
    const premium = parseFloat(listingFormData.spot_premium) || 0;
    
    // Get spot price based on metal type
    let spotPrice = 0;
    if (selectedHoldingForListing.metal_type === 'gold' && spotPrices?.gold) {
      spotPrice = spotPrices.gold;
    } else if (selectedHoldingForListing.metal_type === 'silver' && spotPrices?.silver) {
      spotPrice = spotPrices.silver;
    } else {
      // Platinum or palladium - spot price not available
      return null;
    }
    
    const calculatedPrice = fineOz * spotPrice * (1 + premium / 100);
    return calculatedPrice;
  };

  // Metal type options
  const metalTypeOptions = [
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'palladium', label: 'Palladium' }
  ];

  // Category options — reduced to three
  const categoryOptions = [
    { value: 'sovereign', label: 'Sovereign' },
    { value: 'bar', label: 'Bar' },
    { value: 'coin', label: 'Coin' }
  ];

  // Should the denomination step be shown?
  const showDenominationStep = (): boolean => {
    if (addFormData.category === 'sovereign') return true;
    // category is bar or coin
    if (addFormData.metal_type === 'platinum' || addFormData.metal_type === 'palladium') {
      return !!holdingTypeOther;
    }
    return !!holdingType;
  };

  // ===== BOOK HANDLERS =====

  const resetAddBookForm = () => {
    setAddBookFormData({
      title: '',
      author: '',
      year_published: '',
      edition: '',
      is_signed: false,
      condition: '',
      estimated_value_eur: '',
      purchase_price_eur: '',
      purchase_date: '',
      notes: ''
    });
    setBookPendingImages([]);
  };

  const openEditBookModal = (book: any) => {
    setEditBookFormData({
      id: book.id,
      title: book.title,
      author: book.author || '',
      year_published: book.year_published ? String(book.year_published) : '',
      edition: book.edition || '',
      is_signed: book.is_signed,
      condition: book.condition || '',
      estimated_value_eur: book.estimated_value_eur ? String(book.estimated_value_eur) : '',
      purchase_price_eur: book.purchase_price_eur ? String(book.purchase_price_eur) : '',
      purchase_date: book.purchase_date || '',
      notes: book.notes || ''
    });
    setShowEditBookModal(true);
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/books`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: addBookFormData.title,
          author: addBookFormData.author || null,
          year_published: addBookFormData.year_published ? parseInt(addBookFormData.year_published) : null,
          edition: addBookFormData.edition || null,
          is_signed: addBookFormData.is_signed,
          condition: addBookFormData.condition || null,
          estimated_value_eur: addBookFormData.estimated_value_eur ? parseFloat(addBookFormData.estimated_value_eur) : null,
          purchase_price_eur: addBookFormData.purchase_price_eur ? parseFloat(addBookFormData.purchase_price_eur) : null,
          purchase_date: addBookFormData.purchase_date || null,
          notes: addBookFormData.notes || null
        })
      });

      if (response.ok) {
        const bookData = await response.json();
        const bookId = bookData.id;

        // Upload pending book images
        if (bookId && bookPendingImages.length > 0) {
          setBookImageUploading(true);
          try {
            const formData = new FormData();
            bookPendingImages.forEach(file => formData.append('images', file));
            await fetch(`${API_BASE_URL}/api/books/${bookId}/images`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: formData
            });
          } catch (imgErr) {
            console.error('Error uploading book images:', imgErr);
          } finally {
            setBookImageUploading(false);
          }
        }

        setShowAddBookModal(false);
        resetAddBookForm();
        fetchBooks();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add book');
      }
    } catch (err) {
      console.error('Error adding book:', err);
      setError('Failed to add book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${editBookFormData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editBookFormData.title,
          author: editBookFormData.author || null,
          year_published: editBookFormData.year_published ? parseInt(editBookFormData.year_published) : null,
          edition: editBookFormData.edition || null,
          is_signed: editBookFormData.is_signed,
          condition: editBookFormData.condition || null,
          estimated_value_eur: editBookFormData.estimated_value_eur ? parseFloat(editBookFormData.estimated_value_eur) : null,
          purchase_price_eur: editBookFormData.purchase_price_eur ? parseFloat(editBookFormData.purchase_price_eur) : null,
          purchase_date: editBookFormData.purchase_date || null,
          notes: editBookFormData.notes || null
        })
      });

      if (response.ok) {
        setShowEditBookModal(false);
        fetchBooks();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update book');
      }
    } catch (err) {
      console.error('Error updating book:', err);
      setError('Failed to update book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchBooks();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete book');
      }
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Failed to delete book');
    }
  };

  // Book pending image handlers
  const handleAddBookFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    setBookPendingImages(prev => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 3);
    });
    e.target.value = '';
  };

  const handleRemoveBookPendingFile = (index: number) => {
    setBookPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  // ===== CASH HANDLERS =====

  const openEditCashModal = (cash: any) => {
    setEditCashFormData({
      id: cash.id,
      label: cash.label,
      type: cash.type,
      currency: cash.currency || 'EUR',
      amount: String(cash.amount || ''),
      institution: cash.institution || '',
      notes: cash.notes || ''
    });
    setShowEditCashModal(true);
  };

  const handleAddCash = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cash`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          label: addCashFormData.label,
          type: addCashFormData.type,
          currency: addCashFormData.currency,
          amount: parseFloat(addCashFormData.amount) || 0,
          institution: addCashFormData.institution || null,
          notes: addCashFormData.notes || null
        })
      });

      if (response.ok) {
        setShowAddCashModal(false);
        setAddCashFormData({
          label: '',
          type: 'bank_account',
          currency: 'EUR',
          amount: '',
          institution: '',
          notes: ''
        });
        fetchCash();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add cash holding');
      }
    } catch (err) {
      console.error('Error adding cash:', err);
      setError('Failed to add cash holding');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCash = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cash/${editCashFormData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          label: editCashFormData.label,
          type: editCashFormData.type,
          currency: editCashFormData.currency,
          amount: parseFloat(editCashFormData.amount) || 0,
          institution: editCashFormData.institution || null,
          notes: editCashFormData.notes || null
        })
      });

      if (response.ok) {
        setShowEditCashModal(false);
        fetchCash();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update cash holding');
      }
    } catch (err) {
      console.error('Error updating cash:', err);
      setError('Failed to update cash holding');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCash = async (cashId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!window.confirm('Are you sure you want to delete this cash holding?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/cash/${cashId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchCash();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete cash holding');
      }
    } catch (err) {
      console.error('Error deleting cash:', err);
      setError('Failed to delete cash holding');
    }
  };

  const cashTypeOptions = [
    { value: 'bank_account', label: 'Bank Account' },
    { value: 'cash_physical', label: 'Physical Cash' },
    { value: 'savings', label: 'Savings' },
    { value: 'overdraft', label: 'Overdraft' },
    { value: 'loan', label: 'Loan' },
    { value: 'other', label: 'Other' }
  ];

  const currencyOptions = [
    { value: 'EUR', label: 'EUR' },
    { value: 'USD', label: 'USD' },
    { value: 'GBP', label: 'GBP' },
    { value: 'CHF', label: 'CHF' }
  ];

  const formatCashAmount = (type: string, amount: number) => {
    const isNegative = type === 'overdraft' || type === 'loan';
    return (isNegative ? '-' : '+') + formatCurrency(Math.abs(amount));
  };

  const bookConditionOptions = ['Mint', 'Near Mint', 'Very Good', 'Good', 'Fair', 'Poor'];

  const resetAddCashForm = () => {
    setAddCashFormData({
      label: '',
      type: 'bank_account',
      currency: 'EUR',
      amount: '',
      institution: '',
      notes: ''
    });
  };

  if (loading && holdings.length === 0) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-bold text-amber-900">
              <Scale className="inline-block mr-3" />
              {user?.name ? `${user.name}'s Portfolio` : 'Your Portfolio'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100/70 text-amber-600 border border-amber-200/50">
              <Lock className="w-3 h-3" />
              Private
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Only you can see this. Your holdings are never visible to other users.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center text-red-800">
              <AlertCircle className="mr-2" />
              <span className="font-bold">Error:</span>
            </div>
            <p className="mt-2 text-red-700">{error}</p>
          </div>
        )}

        {/* Portfolio Summary Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
            <Calculator className="mr-3 text-amber-600" />
            Portfolio Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 — Precious Metals */}
            <div className="bg-gradient-to-br from-amber-700 via-amber-600 to-yellow-500 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Scale className="mr-2" size={22} />
                Precious Metals
              </h3>
              {/* Gold */}
              <div className="mb-3">
                <div className="flex justify-between items-center font-bold text-base">
                  <span>Gold</span>
                  <span>{holdings.filter(h => h.metal_type === 'gold').reduce((sum, h) => sum + (Number(h.weight_grams) * Number(h.purity)) / 31.1035 * Number(h.quantity), 0).toFixed(3)} oz</span>
                  <span>{formatCurrency(holdings.filter(h => h.metal_type === 'gold').reduce((sum, h) => sum + ((Number(h.weight_grams) * Number(h.purity)) / 31.1035) * Number(h.quantity) * (spotPrices?.gold || 0), 0))}</span>
                </div>
                {/* Gold subcategories */}
                {['bullion', 'collectible', 'jewellery'].map(sub => {
                  const subHoldings = holdings.filter(h => h.metal_type === 'gold' && (h.subcategory || 'bullion') === sub);
                  if (subHoldings.length === 0) return null;
                  const subOz = subHoldings.reduce((sum, h) => sum + (Number(h.weight_grams) * Number(h.purity)) / 31.1035 * Number(h.quantity), 0);
                  const subVal = subOz * (spotPrices?.gold || 0);
                  return (
                    <div key={sub} className="flex justify-between text-sm opacity-80 ml-4 mt-1">
                      <span className="capitalize">{sub}</span>
                      <span>{subOz.toFixed(3)} oz</span>
                      <span>{formatCurrency(subVal)}</span>
                    </div>
                  );
                })}
              </div>
              {/* Silver */}
              <div className="mb-3">
                <div className="flex justify-between items-center font-bold text-base">
                  <span>Silver</span>
                  <span>{holdings.filter(h => h.metal_type === 'silver').reduce((sum, h) => sum + (Number(h.weight_grams) * Number(h.purity)) / 31.1035 * Number(h.quantity), 0).toFixed(3)} oz</span>
                  <span>{formatCurrency(holdings.filter(h => h.metal_type === 'silver').reduce((sum, h) => sum + ((Number(h.weight_grams) * Number(h.purity)) / 31.1035) * Number(h.quantity) * (spotPrices?.silver || 0), 0))}</span>
                </div>
                {/* Silver subcategories */}
                {['bullion', 'collectible', 'jewellery'].map(sub => {
                  const subHoldings = holdings.filter(h => h.metal_type === 'silver' && (h.subcategory || 'bullion') === sub);
                  if (subHoldings.length === 0) return null;
                  const subOz = subHoldings.reduce((sum, h) => sum + (Number(h.weight_grams) * Number(h.purity)) / 31.1035 * Number(h.quantity), 0);
                  const subVal = subOz * (spotPrices?.silver || 0);
                  return (
                    <div key={sub} className="flex justify-between text-sm opacity-80 ml-4 mt-1">
                      <span className="capitalize">{sub}</span>
                      <span>{subOz.toFixed(3)} oz</span>
                      <span>{formatCurrency(subVal)}</span>
                    </div>
                  );
                })}
              </div>
              {/* Precious Metals subtotal */}
              <div className="border-t border-white/30 pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Precious Metals Total</span>
                <span>{formatCurrency(
                  holdings.filter(h => h.metal_type === 'gold' || h.metal_type === 'silver').reduce((sum, h) => {
                    const oz = (Number(h.weight_grams) * Number(h.purity)) / 31.1035 * Number(h.quantity);
                    const price = h.metal_type === 'gold' ? (spotPrices?.gold || 0) : (spotPrices?.silver || 0);
                    return sum + oz * price;
                  }, 0)
                )}</span>
              </div>
            </div>

            {/* Card 2 — Books */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <svg className="mr-2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                Books

              </h3>
              {books.length === 0 ? (
                <p className="text-white/70 italic">— No books added yet —</p>
              ) : (
                <div>
                  <div className="flex justify-between text-base mb-2">
                    <span>Total books</span>
                    <span className="font-bold">{books.length}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span>Total estimated value</span>
                    <span className="font-bold">{formatCurrency(books.reduce((sum: number, b: any) => sum + (parseFloat(b.estimated_value_eur) || 0), 0))}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3 — Cash & Fiat */}
            <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <svg className="mr-2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Cash & Fiat
              </h3>
              {cashHoldings.length === 0 ? (
                <p className="text-white/70 italic">— No cash holdings added yet —</p>
              ) : (
                <div>
                  {cashHoldings.map((c: any) => {
                    const isNegative = c.type === 'overdraft' || c.type === 'loan';
                    return (
                      <div key={c.id} className="flex justify-between text-sm mb-1">
                        <span className="truncate mr-2">
                          {c.label}
                          <span className="opacity-70 text-xs ml-1">({c.type}{c.currency ? `, ${c.currency}` : ''})</span>
                        </span>
                        <span className={isNegative ? 'text-red-300 font-bold' : 'font-bold'}>
                          {isNegative ? '-' : '+'}{formatCurrency(Math.abs(parseFloat(c.amount) || 0))}
                        </span>
                      </div>
                    );
                  })}
                  {/* Net cash position */}
                  <div className="border-t border-white/30 pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Net Cash Position</span>
                    <span>{formatCurrency(
                      cashHoldings.reduce((sum: number, c: any) => {
                        const amt = parseFloat(c.amount) || 0;
                        return c.type === 'overdraft' || c.type === 'loan' ? sum - Math.abs(amt) : sum + amt;
                      }, 0)
                    )}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 4 — Crypto */}
            <div className="bg-gradient-to-br from-teal-500 to-emerald-700 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <svg className="mr-2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                Crypto
              </h3>
              <div className="flex justify-between text-base">
                <span>Total crypto value</span>
                <span className="font-bold">{formatCurrency(cryptoTotal)}</span>
              </div>
            </div>

            {/* Card 5 — Total Net Worth */}
            <div className="bg-gradient-to-r from-brand-turquoise to-brand-turquoise-dark rounded-xl p-6 text-white flex flex-col justify-center">
              <div className="text-center">
                <div className="text-sm opacity-90 mb-1">Total Net Worth</div>
                <div className="text-3xl font-bold">
                  {formatCurrency(
                    // Precious metals EUR value
                    holdings.filter(h => h.metal_type === 'gold' || h.metal_type === 'silver').reduce((sum, h) => {
                      const oz = (Number(h.weight_grams) * Number(h.purity)) / 31.1035 * Number(h.quantity);
                      const price = h.metal_type === 'gold' ? (spotPrices?.gold || 0) : (spotPrices?.silver || 0);
                      return sum + oz * price;
                    }, 0)
                    // Books estimated value

                    + books.reduce((sum: number, b: any) => sum + (parseFloat(b.estimated_value_eur) || 0), 0)
                    // Net cash position
                    + cashHoldings.reduce((sum: number, c: any) => {
                      const amt = parseFloat(c.amount) || 0;
                      return c.type === 'overdraft' || c.type === 'loan' ? sum - Math.abs(amt) : sum + amt;
                    }, 0)
                    // Crypto total
                    + cryptoTotal
                  )}
                </div>
                <div className="text-xs opacity-70 mt-1">Precious Metals + Books + Cash + Crypto</div>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Table Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-amber-900 flex items-center">
              <TrendingUp className="mr-3 text-amber-600" />
              Your Holdings
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
            >
              <Plus className="mr-2" />
              Add Holding
            </button>
          </div>

          {holdings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
                <Scale className="w-12 h-12 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">No Holdings Yet</h3>
              <p className="text-amber-700 max-w-md mx-auto">
                Start building your portfolio by adding your first gold or silver holding.
              </p>
            </div>
          ) : (
            <>
              {getMetalSections(holdings, spotPrices).map((metalSection, sIdx) => {
                const { section, holdings: sectionHoldings, subtotals } = metalSection;
                const isExpanded = expandedSections[section.key] !== false;
                return (
                  <div key={section.key} className={`${sIdx > 0 ? 'mt-8' : ''} mb-6`}>
                    {/* Section header */}
                    <button
                      onClick={() => toggleSection(section.key)}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors mb-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${section.iconColor} text-white font-bold text-sm`}>
                          {section.icon}
                        </span>
                        <h3 className="text-lg font-bold text-[#00A693]">{section.label}</h3>
                        <span className="text-sm text-gray-500">({sectionHoldings.length})</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {/* Section body */}
                    {isExpanded && (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-amber-200">
                              <th className="text-left py-3 px-4 text-amber-900 font-bold">Image</th>
                              <th className="text-left py-3 px-4 text-amber-900 font-bold">Name</th>
                              <th className="text-left py-3 px-4 text-amber-900 font-bold">Metal</th>
                              <th className="text-left py-3 px-4 text-amber-900 font-bold">Category</th>
                              <th className="text-left py-3 px-4 text-amber-900 font-bold">Qty</th>
                              <th className="text-left py-3 px-4 text-amber-900 font-bold">Fine Oz</th>
                              <th className="text-left py-3 px-4 text-amber-900 font-bold">Spot Value</th>
                              <th className="text-left py-3 px-4 text-amber-900 font-bold">Purchase Price</th>
                              <th className="text-left py-3 px-4 text-amber-900 font-bold">P&L</th>
                              <th className="text-left py-3 px-4 text-amber-900 font-bold">Status</th>
                              <th className="text-left py-3 px-4 text-amber-900 font-bold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sectionHoldings.map((holding) => {
                              const details = calculateHoldingDetails(holding);
                              return (
                                <tr key={holding.id} className="border-b border-amber-100 hover:bg-amber-50">
                                  <td className="py-3 px-4">
                                    {holding.images && holding.images.length > 0 ? (
                                      <button
                                        onClick={() => navigate(`/portfolio/${holding.id}`)}
                                        className="block w-12 h-12 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-500"
                                      >
                                        <img
                                          src={holding.images[0]}
                                          alt={holding.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => navigate(`/portfolio/${holding.id}`)}
                                        className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                                      >
                                        <Scale className="w-5 h-5 text-gray-400" />
                                      </button>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <button
                                      onClick={() => navigate(`/portfolio/${holding.id}`)}
                                      className="text-left font-medium text-amber-900 hover:text-amber-600 hover:underline focus:outline-none"
                                    >
                                      {holding.name}
                                    </button>
                                  </td>
                                  <td className="py-3 px-4 capitalize">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${holding.metal_type === 'gold' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                                      {holding.metal_type}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 capitalize">{holding.category}</td>
                                  <td className="py-3 px-4">{holding.quantity}</td>
                                  <td className="py-3 px-4">{details.fineOz.toFixed(3)}</td>
                                  <td className="py-3 px-4 font-bold">{formatCurrency(details.spotValueEUR)}</td>
                                  <td className="py-3 px-4">
                                    {holding.purchase_price ? formatCurrency(holding.purchase_price) : '—'}
                                  </td>
                                  <td className="py-3 px-4">
                                    {(() => { console.log('holding subcategory:', holding.subcategory, 'name:', holding.name); return null; })()}
                                    {holding.subcategory === 'numismatic' ? (
                                      <span className="text-gray-400 font-medium">Numismatic</span>
                                    ) : holding.purchase_price ? (
                                      <span className={`font-bold ${details.pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(details.pl)}
                                      </span>
                                    ) : '—'}
                                  </td>
                                  <td className="py-3 px-4">
                                    {holding.is_listed ? (
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                        Listed
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                                        Private
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => openEditModal(holding)}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center text-sm"
                                      >
                                        <Edit className="w-3 h-3 mr-1" />
                                        Edit
                                      </button>
                                      {holding.is_listed ? (
                                        <button
                                          onClick={() => handleUnlistHolding(holding.id, holding.listing_id)}
                                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center text-sm"
                                        >
                                          <X className="w-3 h-3 mr-1" />
                                          Unlist
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => openListingModal(holding)}
                                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center text-sm"
                                        >
                                          <List className="w-3 h-3 mr-1" />
                                          List
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDeleteHolding(holding.id)}
                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center text-sm"
                                      >
                                        <X className="w-3 h-3 mr-1" />
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {/* Subtotal row */}
                            <tr className="bg-gray-100 font-bold">
                              <td colSpan={5} className="py-3 px-4 text-right text-sm text-gray-700">Section Total</td>
                              <td className="py-3 px-4 text-right">{subtotals.fineOz.toFixed(3)}</td>
                              <td className="py-3 px-4 text-right">{formatCurrency(subtotals.spotValue)}</td>
                              <td className="py-3 px-4 text-right">
                                {subtotals.purchasePrice > 0 ? formatCurrency(subtotals.purchasePrice) : '—'}
                              </td>
                              <td className={`py-3 px-4 text-right ${subtotals.pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {subtotals.purchasePrice > 0 ? formatCurrency(subtotals.pl) : '—'}
                              </td>
                              <td colSpan={2}></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Spot Prices Info */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <Info className="inline-block mr-2" size={16} />
              <strong>Live Spot Prices:</strong> Gold: €{spotPrices?.gold?.toFixed(2) || '—'}/oz • 
              Silver: €{spotPrices?.silver?.toFixed(2) || '—'}/oz • 
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Books Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-indigo-900 flex items-center">
              <svg className="mr-3 text-indigo-600" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Books
            </h2>
            <button
              onClick={() => {
                resetAddBookForm();
                setShowAddBookModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
            >
              <Plus className="mr-2" />
              Add Book
            </button>
          </div>

          {books.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-indigo-900 mb-2">No Books Added Yet</h3>
              <p className="text-indigo-700 max-w-md mx-auto">Track your collection of rare and valuable books.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-indigo-200">
                    <th className="text-left py-3 px-4 text-indigo-900 font-bold">Title</th>
                    <th className="text-left py-3 px-4 text-indigo-900 font-bold">Author</th>
                    <th className="text-left py-3 px-4 text-indigo-900 font-bold">Edition</th>
                    <th className="text-left py-3 px-4 text-indigo-900 font-bold">Signed</th>
                    <th className="text-left py-3 px-4 text-indigo-900 font-bold">Condition</th>
                    <th className="text-left py-3 px-4 text-indigo-900 font-bold">Est. Value</th>
                    <th className="text-left py-3 px-4 text-indigo-900 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book: any) => (
                    <tr key={book.id} className="border-b border-indigo-100 hover:bg-indigo-50">
                      <td className="py-3 px-4 font-medium text-indigo-900">{book.title}</td>
                      <td className="py-3 px-4">{book.author || '—'}</td>
                      <td className="py-3 px-4">{book.edition || '—'}</td>
                      <td className="py-3 px-4">{book.is_signed ? '✓' : '—'}</td>
                      <td className="py-3 px-4">
                        {book.condition ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                            {book.condition}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {book.estimated_value_eur ? formatCurrency(parseFloat(book.estimated_value_eur)) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditBookModal(book)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center text-sm"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center text-sm"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cash & Fiat Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              <svg className="mr-3 text-slate-600" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Cash & Fiat
            </h2>
            <button
              onClick={() => {
                resetAddCashForm();
                setShowAddCashModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-700 text-white font-bold rounded-xl hover:from-slate-600 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
            >
              <Plus className="mr-2" />
              Add Cash
            </button>
          </div>

          {cashHoldings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Cash Holdings Added Yet</h3>
              <p className="text-slate-700 max-w-md mx-auto">Track bank accounts, physical cash, savings, and liabilities.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Label</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Type</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Institution</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Currency</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-900 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cashHoldings.map((cash: any) => {
                    const isNegative = cash.type === 'overdraft' || cash.type === 'loan';
                    return (
                      <tr key={cash.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-900">{cash.label}</td>
                        <td className="py-3 px-4 capitalize">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                            {cash.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">{cash.institution || '—'}</td>
                        <td className="py-3 px-4">{cash.currency || 'EUR'}</td>
                        <td className={`py-3 px-4 font-bold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCashAmount(cash.type, parseFloat(cash.amount) || 0)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditCashModal(cash)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center text-sm"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCash(cash.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center text-sm"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Crypto Section */}
        <CryptoSection onTotalChange={setCryptoTotal} />

        {/* Disclaimer */}

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            <Shield className="inline-block mr-2" size={16} />
            <strong>Disclaimer:</strong> Valuations are estimates based on current spot prices. Actual market values may vary. 
            This portfolio tool is for informational purposes only and does not constitute financial advice.
          </p>
        </div>
      </div>

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-amber-900">Add New Holding</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                  className="p-2 hover:bg-amber-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-amber-700" />
                </button>
              </div>

              <form onSubmit={handleAddHolding}>
                <div className="space-y-6">
                  {/* ===== STEP 1: METAL TYPE ===== */}
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <label className="block text-amber-900 font-bold mb-2">Step 1: Metal Type *</label>
                    <select
                      value={addFormData.metal_type}
                      onChange={(e) => {
                        const newMetal = e.target.value;
                        setAddFormData(prev => ({
                          ...prev,
                          metal_type: newMetal as any,
                          category: 'sovereign',
                          denomination: '',
                          name: '',
                          weight_grams: 0,
                          purity: '0.999',
                          quantity: 1,
                          graded: false,
                          grade_cert: '',
                        }));
                        setHoldingType('');
                        setHoldingTypeOther('');
                        setCollectorsPieceMint('');
                        setCustomPurity(false);
                      }}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white"
                    >
                      {metalTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ===== STEP 2: CATEGORY ===== */}
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <label className="block text-amber-900 font-bold mb-2">Step 2: Category *</label>
                    <select
                      value={addFormData.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setAddFormData(prev => ({
                          ...prev,
                          category: newCat as any,
                          denomination: '',
                          name: '',
                          weight_grams: 0,
                          purity: '0.999',
                          quantity: 1,
                          graded: false,
                          grade_cert: '',
                        }));
                        setHoldingType('');
                        setHoldingTypeOther('');
                        setCollectorsPieceMint('');
                        setCustomPurity(false);
                      }}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ===== SUBCATEGORY ===== */}
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <label className="block text-amber-900 font-bold mb-2">Subcategory *</label>
                    <select
                      value={addFormData.subcategory}
                      onChange={(e) => setAddFormData({...addFormData, subcategory: e.target.value})}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white"
                    >
                      <option value="bullion">Bullion</option>
                      <option value="collectible">Collectible</option>
                      <option value="jewellery">Jewellery</option>
                    </select>
                  </div>

                  {/* ===== STEP 3: TYPE (skip for Sovereign) ===== */}
                  {addFormData.category !== 'sovereign' && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <label className="block text-amber-900 font-bold mb-2">Step 3: Type</label>
                      {addFormData.metal_type === 'platinum' || addFormData.metal_type === 'palladium' ? (
                        <input
                          type="text"
                          value={holdingTypeOther}
                          onChange={(e) => {
                            setHoldingType('other');
                            setHoldingTypeOther(e.target.value);
                            setAddFormData(prev => ({
                              ...prev,
                              denomination: '',
                              name: '',
                              weight_grams: 0,
                              purity: '0.999',
                              quantity: 1,
                              graded: false,
                              grade_cert: '',
                            }));
                          }}
                          placeholder="Enter type (e.g., Valcambi, Engelhard)"
                          className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white"
                        />
                      ) : (
                        <div>
                          <select
                            value={holdingType}
                            onChange={(e) => {
                              const newType = e.target.value;
                              setHoldingType(newType);
                              setHoldingTypeOther('');
                              setAddFormData(prev => ({
                                ...prev,
                                denomination: '',
                                name: '',
                                weight_grams: 0,
                                purity: newType === 'collectors_piece' ? '0.925' : '0.999',
                                quantity: 1,
                                graded: false,
                                grade_cert: '',
                              }));
                            }}
                            className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white"
                          >
                            <option value="">-- Select Type --</option>
                            {getTypeOptions().map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {/* "Other" type free-text */}
                          {holdingType === 'other' && (
                            <input
                              type="text"
                              value={holdingTypeOther}
                              onChange={(e) => setHoldingTypeOther(e.target.value)}
                              placeholder="Describe this item"
                              className="w-full mt-2 p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white"
                            />
                          )}
                          {/* Collector's Piece Mint/Series */}
                          {holdingType === 'collectors_piece' && (
                            <input
                              type="text"
                              value={collectorsPieceMint}
                              onChange={(e) => setCollectorsPieceMint(e.target.value)}
                              placeholder="Mint / Series (e.g. Irish Mint — Limited Edition)"
                              className="w-full mt-2 p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== STEP 4: DENOMINATION ===== */}
                  {showDenominationStep() && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <label className="block text-amber-900 font-bold mb-2">
                        Step 4: Denomination / Format
                      </label>
                      {(addFormData.category as string) === 'sovereign' ? (
                        <select
                          value={addFormData.denomination}
                          onChange={(e) => {
                            const val = e.target.value;
                            const opt = findDenomOption(val);
                            setAddFormData(prev => ({
                              ...prev,
                              denomination: val,
                              weight_grams: opt ? (opt.grams * prev.quantity) : 0,
                              purity: opt ? opt.purity.toString() : prev.purity,
                              name: autoSuggestName() || prev.name,
                            }));
                          }}
                          className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white"
                        >
                          <option value="">-- Select Denomination --</option>
                          {denominationConfig.sovereign.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : addFormData.metal_type === 'platinum' || addFormData.metal_type === 'palladium' ? (
                        <p className="text-sm text-amber-700">Enter weight and purity manually below.</p>
                      ) : holdingType === 'collectors_piece' ? (
                        <p className="text-sm text-amber-700">Enter weight and purity manually below. Purity defaults to 0.925 (sterling silver).</p>
                      ) : (
                        <select
                          value={addFormData.denomination}
                          onChange={(e) => {
                            const val = e.target.value;
                            const opt = findDenomOption(val);
                            if (val === 'custom') {
                              setAddFormData(prev => ({
                                ...prev,
                                denomination: 'custom',
                                weight_grams: 0,
                                purity: opt ? opt.purity.toString() : prev.purity,
                                name: autoSuggestName() || prev.name,
                              }));
                            } else {
                              setAddFormData(prev => ({
                                ...prev,
                                denomination: val,
                                weight_grams: opt ? (opt.grams * prev.quantity) : 0,
                                purity: opt ? opt.purity.toString() : prev.purity,
                                name: autoSuggestName() || prev.name,
                              }));
                            }
                          }}
                          className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-white"
                        >
                          <option value="">-- Select Denomination --</option>
                          {getDenomOptions().map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* ===== STEP 5: NAME (auto-suggested) ===== */}
                  <div>
                    <label className="block text-amber-900 font-semibold mb-2">Name *</label>
                    <input
                      type="text"
                      value={addFormData.name}
                      onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
                      placeholder="Auto-suggested — you can overwrite"
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      required
                    />
                  </div>

                  {/* ===== STEP 6: QUANTITY (always visible) ===== */}
                  <div>
                    <label className="block text-amber-900 font-semibold mb-2">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      value={addFormData.quantity}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value) || 1;
                        const opt = findDenomOption(addFormData.denomination);
                        setAddFormData(prev => ({
                          ...prev,
                          quantity: qty,
                          weight_grams: opt ? (opt.grams * qty) : prev.weight_grams,
                        }));
                      }}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      required
                    />
                  </div>

                  {/* ===== STEP 7: WEIGHT (auto-filled, editable) ===== */}
                  <div>
                    <label className="block text-amber-900 font-semibold mb-2">Weight (grams) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={addFormData.weight_grams}
                      onChange={(e) => setAddFormData({...addFormData, weight_grams: parseFloat(e.target.value) || 0})}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      required
                    />
                    {addFormData.denomination && addFormData.denomination !== 'custom' && addFormData.weight_grams > 0 && (
                      <p className="text-xs text-amber-600 mt-1">Auto-filled from denomination × quantity — editable.</p>
                    )}
                  </div>

                  {/* ===== STEP 8: PURITY (auto-filled, editable) ===== */}
                  <div>
                    <label className="block text-amber-900 font-semibold mb-2">Purity *</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        max="1"
                        value={addFormData.purity}
                        onChange={(e) => setAddFormData({...addFormData, purity: e.target.value})}
                        className="flex-1 p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        required
                      />
                      <span className="text-sm text-amber-600 whitespace-nowrap">
                        ({typeof addFormData.purity === 'string'
                          ? (parseFloat(addFormData.purity) * 100).toFixed(2)
                          : (addFormData.purity * 100).toFixed(2)}%)
                      </span>
                    </div>
                    {addFormData.denomination && addFormData.denomination !== 'custom' && (
                      <p className="text-xs text-amber-600 mt-1">Auto-filled from selection — editable.</p>
                    )}
                  </div>

                  {/* ===== GRADED CHECKBOX + DROPDOWN ===== */}
                  <div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="graded"
                        checked={addFormData.graded}
                        onChange={(e) => {
                          setAddFormData(prev => ({
                            ...prev,
                            graded: e.target.checked,
                            grade_cert: e.target.checked ? prev.grade_cert : '',
                          }));
                        }}
                        className="w-5 h-5 text-amber-500 border-amber-300 rounded focus:ring-amber-200"
                      />
                      <label htmlFor="graded" className="ml-3 text-amber-900 font-medium">
                        This item is professionally graded
                      </label>
                    </div>
                    {addFormData.graded && (
                      <div className="mt-3">
                        <label className="block text-amber-800 mb-2">Grade</label>
                        <select
                          value={addFormData.grade_cert}
                          onChange={(e) => setAddFormData({...addFormData, grade_cert: e.target.value})}
                          className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        >
                          <option value="">-- Select Grade --</option>
                          {['MS60','MS61','MS62','MS63','MS64','MS65','MS66','MS67','MS68','MS69','MS70','PF69','PF70'].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* ===== PURCHASE DETAILS ===== */}
                  <div className="border-t border-amber-200 pt-6">
                    <h4 className="text-lg font-bold text-amber-900 mb-4">Purchase Details (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-amber-800 mb-2">Purchase Price (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={addFormData.purchase_price}
                          onChange={(e) => setAddFormData({...addFormData, purchase_price: e.target.value})}
                          className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-amber-800 mb-2">Purchase Date</label>
                        <input
                          type="date"
                          value={addFormData.purchase_date}
                          onChange={(e) => setAddFormData({...addFormData, purchase_date: e.target.value})}
                          className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ===== NOTES ===== */}
                  <div>
                    <label className="block text-amber-800 mb-2">Notes</label>
                    <textarea
                      value={addFormData.notes}
                      onChange={(e) => setAddFormData({...addFormData, notes: e.target.value})}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      rows={3}
                      placeholder="Any additional notes about this holding..."
                    />
                  </div>

                  {/* ===== PHOTOS ===== */}
                  <div className="border-t border-amber-200 pt-6">
                    <h4 className="text-lg font-bold text-amber-900 mb-4">Photos</h4>
                    <p className="text-sm text-amber-700 mb-3">
                      Upload up to 3 photos of this item ({pendingImages.length}/3)
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {pendingImages.map((file, index) => (
                        <div key={index} className="relative group w-24 h-24">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Pending photo ${index + 1}`}
                            className="w-24 h-24 rounded-lg object-cover border border-amber-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePendingFile(index)}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X className="w-6 h-6 text-white" />
                          </button>
                        </div>
                      ))}
                      {pendingImages.length < 3 && (
                        <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-colors">
                          <Upload className="w-6 h-6 text-amber-400 mb-1" />
                          <span className="text-xs text-amber-500">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAddFileSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* ===== ACTION BUTTONS ===== */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting || imageUploading}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting || imageUploading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {imageUploading ? 'Uploading Images...' : 'Adding...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Plus className="mr-2" />
                          Add Holding
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        resetAddForm();
                      }}
                      className="px-6 py-4 border-2 border-amber-300 text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Holding Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-amber-900">Edit Holding</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-amber-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-amber-700" />
                </button>
              </div>

              <form onSubmit={handleEditHolding}>
                <div className="space-y-6">
                  {/* Basic Details - same as add form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Metal Type *
                      </label>
                      <select
                        value={editFormData.metal_type}
                        onChange={(e) => setEditFormData({...editFormData, metal_type: e.target.value as any})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      >
                        {metalTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Category *
                      </label>
                      <select
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({...editFormData, category: e.target.value as any})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      >
                        {categoryOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Subcategory *
                      </label>
                      <select
                        value={editFormData.subcategory}
                        onChange={(e) => setEditFormData({...editFormData, subcategory: e.target.value})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      >
                        <option value="bullion">Bullion</option>
                        <option value="collectible">Collectible</option>
                        <option value="jewellery">Jewellery</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editFormData.quantity}
                        onChange={(e) => setEditFormData({...editFormData, quantity: parseInt(e.target.value) || 1})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Weight (grams) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={editFormData.weight_grams}
                        onChange={(e) => setEditFormData({...editFormData, weight_grams: parseFloat(e.target.value) || 0})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Purity *
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        max="1"
                        value={editFormData.purity}
                        onChange={(e) => setEditFormData({...editFormData, purity: e.target.value})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Purchase Details */}
                  <div className="border-t border-amber-200 pt-6">
                    <h4 className="text-lg font-bold text-amber-900 mb-4">Purchase Details (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-amber-800 mb-2">
                          Purchase Price (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editFormData.purchase_price}
                          onChange={(e) => setEditFormData({...editFormData, purchase_price: e.target.value})}
                          className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-amber-800 mb-2">
                          Purchase Date
                        </label>
                        <input
                          type="date"
                          value={editFormData.purchase_date}
                          onChange={(e) => setEditFormData({...editFormData, purchase_date: e.target.value})}
                          className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Graded Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-graded"
                      checked={editFormData.graded}
                      onChange={(e) => setEditFormData({...editFormData, graded: e.target.checked})}
                      className="w-5 h-5 text-amber-500 border-amber-300 rounded focus:ring-amber-200"
                    />
                    <label htmlFor="edit-graded" className="ml-3 text-amber-900 font-medium">
                      This item is professionally graded
                    </label>
                  </div>

                  {editFormData.graded && (
                    <div>
                      <label className="block text-amber-800 mb-2">
                        Grade Certificate Number
                      </label>
                      <input
                        type="text"
                        value={editFormData.grade_cert}
                        onChange={(e) => setEditFormData({...editFormData, grade_cert: e.target.value})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-amber-800 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      rows={3}
                    />
                  </div>

                  {/* Photo Upload */}
                  <HoldingImageUpload
                    holdingId={editHoldingId}
                    images={editImages}
                    onChange={setEditImages}
                    apiBaseUrl={API_BASE_URL}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Check className="mr-2" />
                          Update Holding
                        </span>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-4 border-2 border-amber-300 text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Listing Modal */}
      {showListingModal && selectedHoldingForListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-amber-900">Create Listing</h3>
                <button
                  onClick={() => setShowListingModal(false)}
                  className="p-2 hover:bg-amber-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-amber-700" />
                </button>
              </div>

              {/* Holding Summary */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-amber-900 mb-2">Holding Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-amber-700">Name:</span>
                    <span className="ml-2 font-bold">{selectedHoldingForListing.name}</span>
                  </div>
                  <div>
                    <span className="text-amber-700">Metal Type:</span>
                    <span className="ml-2 font-bold capitalize">{selectedHoldingForListing.metal_type}</span>
                  </div>
                  <div>
                    <span className="text-amber-700">Category:</span>
                    <span className="ml-2 font-bold capitalize">{selectedHoldingForListing.category}</span>
                  </div>
                  <div>
                    <span className="text-amber-700">Fine Oz:</span>
                    <span className="ml-2 font-bold">{calculateFineOz(selectedHoldingForListing).toFixed(3)}</span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {listingFormError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center text-red-800">
                    <AlertCircle className="mr-2" />
                    <span className="font-bold">Error:</span>
                  </div>
                  <p className="mt-2 text-red-700">{listingFormError}</p>
                </div>
              )}

              <form onSubmit={handleListingSubmit}>
                <div className="space-y-6">
                  {/* Price Type */}
                  <div>
                    <label className="block text-amber-900 font-semibold mb-2">
                      Price Type *
                    </label>
                    <select
                      value={listingFormData.price_type}
                      onChange={(e) => setListingFormData({...listingFormData, price_type: e.target.value})}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      required
                    >
                      <option value="fixed">Fixed Price</option>
                      <option value="spot_plus">Spot Plus Percentage</option>
                      <option value="offers">Offers Welcome</option>
                    </select>
                  </div>

                  {/* Conditional Fields */}
                  {listingFormData.price_type === 'fixed' && (
                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Asking Price (€) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={listingFormData.asking_price}
                        onChange={(e) => setListingFormData({...listingFormData, asking_price: e.target.value})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        placeholder="e.g., 1500.00"
                        required
                      />
                    </div>
                  )}

                  {listingFormData.price_type === 'spot_plus' && (
                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Spot Premium (%) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={listingFormData.spot_premium}
                        onChange={(e) => setListingFormData({...listingFormData, spot_premium: e.target.value})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        placeholder="e.g., 5.0"
                        required
                      />
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-sm text-amber-800">
                          <strong>Calculated Price:</strong> {
                            calculateSpotPlusPrice() === null 
                              ? 'Spot price unavailable for this metal type' 
                              : formatCurrency(calculateSpotPlusPrice()!)
                          }
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Based on {calculateFineOz(selectedHoldingForListing).toFixed(3)} fine oz × 
                          {selectedHoldingForListing.metal_type === 'gold' 
                            ? ` €${spotPrices?.gold?.toFixed(2) || '—'}/oz` 
                            : selectedHoldingForListing.metal_type === 'silver'
                            ? ` €${spotPrices?.silver?.toFixed(2) || '—'}/oz`
                            : ' spot price unavailable'} 
                          × (1 + {listingFormData.spot_premium || '0'}%)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Location County */}
                  <div>
                    <label className="block text-amber-900 font-semibold mb-2">
                      Location County *
                    </label>
                    <select
                      value={listingFormData.location_county}
                      onChange={(e) => setListingFormData({...listingFormData, location_county: e.target.value})}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      required
                    >
                      <option value="">Select a county</option>
                      <option value="Antrim">Antrim</option>
                      <option value="Armagh">Armagh</option>
                      <option value="Carlow">Carlow</option>
                      <option value="Cavan">Cavan</option>
                      <option value="Clare">Clare</option>
                      <option value="Cork">Cork</option>
                      <option value="Derry">Derry</option>
                      <option value="Donegal">Donegal</option>
                      <option value="Down">Down</option>
                      <option value="Dublin">Dublin</option>
                      <option value="Fermanagh">Fermanagh</option>
                      <option value="Galway">Galway</option>
                      <option value="Kerry">Kerry</option>
                      <option value="Kildare">Kildare</option>
                      <option value="Kilkenny">Kilkenny</option>
                      <option value="Laois">Laois</option>
                      <option value="Leitrim">Leitrim</option>
                      <option value="Limerick">Limerick</option>
                      <option value="Longford">Longford</option>
                      <option value="Louth">Louth</option>
                      <option value="Mayo">Mayo</option>
                      <option value="Meath">Meath</option>
                      <option value="Monaghan">Monaghan</option>
                      <option value="Offaly">Offaly</option>
                      <option value="Roscommon">Roscommon</option>
                      <option value="Sligo">Sligo</option>
                      <option value="Tipperary">Tipperary</option>
                      <option value="Tyrone">Tyrone</option>
                      <option value="Waterford">Waterford</option>
                      <option value="Westmeath">Westmeath</option>
                      <option value="Wexford">Wexford</option>
                      <option value="Wicklow">Wicklow</option>
                    </select>
                  </div>

                  {/* Postage Offered */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="postage_offered"
                      checked={listingFormData.postage_offered}
                      onChange={(e) => setListingFormData({...listingFormData, postage_offered: e.target.checked})}
                      className="w-5 h-5 text-amber-500 border-amber-300 rounded focus:ring-amber-200"
                    />
                    <label htmlFor="postage_offered" className="ml-3 text-amber-900 font-medium">
                      Postage Offered
                    </label>
                  </div>

                  {/* Visible To */}
                  <div>
                    <label className="block text-amber-900 font-semibold mb-2">
                      Visible To
                    </label>
                    <select
                      value={listingFormData.visible_to}
                      onChange={(e) => setListingFormData({...listingFormData, visible_to: e.target.value})}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                    >
                      <option value="all">All Users</option>
                      <option value="verified_only">Verified Users Only</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={listingSubmitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {listingSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating Listing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <List className="mr-2" />
                          Create Listing
                        </span>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowListingModal(false)}
                      className="px-6 py-4 border-2 border-amber-300 text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-indigo-900">Add Book</h3>
                <button
                  onClick={() => {
                    setShowAddBookModal(false);
                    resetAddBookForm();
                  }}
                  className="p-2 hover:bg-indigo-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-indigo-700" />
                </button>
              </div>

              <form onSubmit={handleAddBook}>
                <div className="space-y-5">
                  {/* Title (required) */}
                  <div>
                    <label className="block text-indigo-900 font-semibold mb-2">Title *</label>
                    <input
                      type="text"
                      value={addBookFormData.title}
                      onChange={(e) => setAddBookFormData({...addBookFormData, title: e.target.value})}
                      className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      required
                      placeholder="Book title"
                    />
                  </div>

                  {/* Author and Year */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-indigo-900 font-semibold mb-2">Author</label>
                      <input
                        type="text"
                        value={addBookFormData.author}
                        onChange={(e) => setAddBookFormData({...addBookFormData, author: e.target.value})}
                        className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                        placeholder="Author name"
                      />
                    </div>
                    <div>
                      <label className="block text-indigo-900 font-semibold mb-2">Year Published</label>
                      <input
                        type="number"
                        value={addBookFormData.year_published}
                        onChange={(e) => setAddBookFormData({...addBookFormData, year_published: e.target.value})}
                        className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                        placeholder="e.g. 1925"
                      />
                    </div>
                  </div>

                  {/* Edition and Signed */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-indigo-900 font-semibold mb-2">Edition</label>
                      <input
                        type="text"
                        value={addBookFormData.edition}
                        onChange={(e) => setAddBookFormData({...addBookFormData, edition: e.target.value})}
                        className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                        placeholder="e.g. First Edition, Limited"
                      />
                    </div>
                    <div className="flex items-end pb-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addBookFormData.is_signed}
                          onChange={(e) => setAddBookFormData({...addBookFormData, is_signed: e.target.checked})}
                          className="w-5 h-5 text-indigo-500 border-indigo-300 rounded focus:ring-indigo-200"
                        />
                        <span className="text-indigo-900 font-medium">Signed?</span>
                      </label>
                    </div>
                  </div>

                  {/* Condition Dropdown */}
                  <div>
                    <label className="block text-indigo-900 font-semibold mb-2">Condition</label>
                    <select
                      value={addBookFormData.condition}
                      onChange={(e) => setAddBookFormData({...addBookFormData, condition: e.target.value})}
                      className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none bg-white"
                    >
                      <option value="">-- Select Condition --</option>
                      {bookConditionOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Estimated Value and Purchase Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-indigo-900 font-semibold mb-2">Estimated Value (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={addBookFormData.estimated_value_eur}
                        onChange={(e) => setAddBookFormData({...addBookFormData, estimated_value_eur: e.target.value})}
                        className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-indigo-900 font-semibold mb-2">Purchase Price (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={addBookFormData.purchase_price_eur}
                        onChange={(e) => setAddBookFormData({...addBookFormData, purchase_price_eur: e.target.value})}
                        className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label className="block text-indigo-900 font-semibold mb-2">Purchase Date</label>
                    <input
                      type="date"
                      value={addBookFormData.purchase_date}
                      onChange={(e) => setAddBookFormData({...addBookFormData, purchase_date: e.target.value})}
                      className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-indigo-900 font-semibold mb-2">Notes</label>
                    <textarea
                      value={addBookFormData.notes}
                      onChange={(e) => setAddBookFormData({...addBookFormData, notes: e.target.value})}
                      className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      rows={3}
                      placeholder="Any notes about this book..."
                    />
                  </div>

                  {/* Photos */}
                  <div className="border-t border-indigo-200 pt-6">
                    <h4 className="text-lg font-bold text-indigo-900 mb-4">Photos</h4>
                    <p className="text-sm text-indigo-700 mb-3">
                      Upload up to 3 photos after the book is created ({bookPendingImages.length}/3 selected)
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {bookPendingImages.map((file, index) => (
                        <div key={index} className="relative group w-24 h-24">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Book photo ${index + 1}`}
                            className="w-24 h-24 rounded-lg object-cover border border-indigo-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveBookPendingFile(index)}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X className="w-6 h-6 text-white" />
                          </button>
                        </div>
                      ))}
                      {bookPendingImages.length < 3 && (
                        <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                          {bookImageUploading ? (
                            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-indigo-400 mb-1" />
                              <span className="text-xs text-indigo-500">Upload</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAddBookFileSelect}
                            disabled={bookImageUploading}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="animate-spin mr-2" />
                          {bookImageUploading ? 'Uploading Images...' : 'Adding Book...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Plus className="mr-2" />
                          Add Book
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddBookModal(false);
                        resetAddBookForm();
                      }}
                      className="px-6 py-4 border-2 border-indigo-300 text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-indigo-900">Edit Book</h3>
                <button
                  onClick={() => setShowEditBookModal(false)}
                  className="p-2 hover:bg-indigo-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-indigo-700" />
                </button>
              </div>

              <form onSubmit={handleEditBook}>
                <div className="space-y-5">
                  {/* Title (required) */}
                  <div>
                    <label className="block text-indigo-900 font-semibold mb-2">Title *</label>
                    <input
                      type="text"
                      value={editBookFormData.title}
                      onChange={(e) => setEditBookFormData({...editBookFormData, title: e.target.value})}
                      className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Author and Year */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-indigo-900 font-semibold mb-2">Author</label>
                      <input
                        type="text"
                        value={editBookFormData.author}
                        onChange={(e) => setEditBookFormData({...editBookFormData, author: e.target.value})}
                        className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-indigo-900 font-semibold mb-2">Year Published</label>
                      <input
                        type="number"
                        value={editBookFormData.year_published}
                        onChange={(e) => setEditBookFormData({...editBookFormData, year_published: e.target.value})}
                        className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Edition and Signed */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-indigo-900 font-semibold mb-2">Edition</label>
                      <input
                        type="text"
                        value={editBookFormData.edition}
                        onChange={(e) => setEditBookFormData({...editBookFormData, edition: e.target.value})}
                        className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-end pb-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editBookFormData.is_signed}
                          onChange={(e) => setEditBookFormData({...editBookFormData, is_signed: e.target.checked})}
                          className="w-5 h-5 text-indigo-500 border-indigo-300 rounded focus:ring-indigo-200"
                        />
                        <span className="text-indigo-900 font-medium">Signed?</span>
                      </label>
                    </div>
                  </div>

                  {/* Condition Dropdown */}
                  <div>
                    <label className="block text-indigo-900 font-semibold mb-2">Condition</label>
                    <select
                      value={editBookFormData.condition}
                      onChange={(e) => setEditBookFormData({...editBookFormData, condition: e.target.value})}
                      className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none bg-white"
                    >
                      <option value="">-- Select Condition --</option>
                      {bookConditionOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Estimated Value and Purchase Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-indigo-900 font-semibold mb-2">Estimated Value (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editBookFormData.estimated_value_eur}
                        onChange={(e) => setEditBookFormData({...editBookFormData, estimated_value_eur: e.target.value})}
                        className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-indigo-900 font-semibold mb-2">Purchase Price (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editBookFormData.purchase_price_eur}
                        onChange={(e) => setEditBookFormData({...editBookFormData, purchase_price_eur: e.target.value})}
                        className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label className="block text-indigo-900 font-semibold mb-2">Purchase Date</label>
                    <input
                      type="date"
                      value={editBookFormData.purchase_date}
                      onChange={(e) => setEditBookFormData({...editBookFormData, purchase_date: e.target.value})}
                      className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-indigo-900 font-semibold mb-2">Notes</label>
                    <textarea
                      value={editBookFormData.notes}
                      onChange={(e) => setEditBookFormData({...editBookFormData, notes: e.target.value})}
                      className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="animate-spin mr-2" />
                          Updating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Check className="mr-2" />
                          Update Book
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditBookModal(false)}
                      className="px-6 py-4 border-2 border-indigo-300 text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Cash Modal */}
      {showAddCashModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Add Cash Holding</h3>
                <button
                  onClick={() => {
                    setShowAddCashModal(false);
                    resetAddCashForm();
                  }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-700" />
                </button>
              </div>

              <form onSubmit={handleAddCash}>
                <div className="space-y-5">
                  {/* Label (required) */}
                  <div>
                    <label className="block text-slate-900 font-semibold mb-2">Label *</label>
                    <input
                      type="text"
                      value={addCashFormData.label}
                      onChange={(e) => setAddCashFormData({...addCashFormData, label: e.target.value})}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                      required
                      placeholder='e.g. "AIB Current Account", "Vault Cash EUR"'
                    />
                  </div>

                  {/* Type Dropdown */}
                  <div>
                    <label className="block text-slate-900 font-semibold mb-2">Type</label>
                    <select
                      value={addCashFormData.type}
                      onChange={(e) => setAddCashFormData({...addCashFormData, type: e.target.value})}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-white"
                    >
                      {cashTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Currency Dropdown */}
                  <div>
                    <label className="block text-slate-900 font-semibold mb-2">Currency</label>
                    <select
                      value={addCashFormData.currency}
                      onChange={(e) => setAddCashFormData({...addCashFormData, currency: e.target.value})}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-white"
                    >
                      {currencyOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-slate-900 font-semibold mb-2">
                      Amount *
                      <span className="text-sm font-normal text-slate-500 ml-2">
                        (positive number; overdrafts/loans reduce net worth)
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={addCashFormData.amount}
                      onChange={(e) => setAddCashFormData({...addCashFormData, amount: e.target.value})}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  {/* Institution */}
                  <div>
                    <label className="block text-slate-900 font-semibold mb-2">Institution</label>
                    <input
                      type="text"
                      value={addCashFormData.institution}
                      onChange={(e) => setAddCashFormData({...addCashFormData, institution: e.target.value})}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                      placeholder='e.g. AIB, Revolut, Bank of Ireland'
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-slate-900 font-semibold mb-2">Notes</label>
                    <textarea
                      value={addCashFormData.notes}
                      onChange={(e) => setAddCashFormData({...addCashFormData, notes: e.target.value})}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                      rows={3}
                      placeholder="Any notes about this cash holding..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-slate-500 to-slate-700 text-white font-bold rounded-xl hover:from-slate-600 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="animate-spin mr-2" />
                          Adding...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Plus className="mr-2" />
                          Add Cash
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCashModal(false);
                        resetAddCashForm();
                      }}
                      className="px-6 py-4 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cash Modal */}
      {showEditCashModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Edit Cash Holding</h3>
                <button
                  onClick={() => setShowEditCashModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-700" />
                </button>
              </div>

              <form onSubmit={handleEditCash}>
                <div className="space-y-5">
                  {/* Label (required) */}
                  <div>
                    <label className="block text-slate-900 font-semibold mb-2">Label *</label>
                    <input
                      type="text"
                      value={editCashFormData.label}
                      onChange={(e) => setEditCashFormData({...editCashFormData, label: e.target.value})}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Type Dropdown */}
                  <div>
                    <label className="block text-slate-900 font-semibold mb-2">Type</label>
                    <select
                      value={editCashFormData.type}
                      onChange={(e) => setEditCashFormData({...editCashFormData, type: e.target.value})}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-white"
                    >
                      {cashTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Currency Dropdown */}
                  <div>
                    <label className="block text-slate-900 font-semibold mb-2">Currency</label>
                    <select
                      value={editCashFormData.currency}
                      onChange={(e) => setEditCashFormData({...editCashFormData, currency: e.target.value})}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-white"
                    >
                      {currencyOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-slate-900 font-semibold mb-2">
                      Amount *
                      <span className="text-sm font-normal text-slate-500 ml-2">
                        (positive number; overdrafts/loans reduce net worth)
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editCashFormData.amount}
                      onChange={(e) => setEditCashFormData({...editCashFormData, amount: e.target.value})}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Institution */}
                  <div>
                    <label className="block text-slate-900 font-semibold mb-2">Institution</label>
                    <input
                      type="text"
                      value={editCashFormData.institution}
                      onChange={(e) => setEditCashFormData({...editCashFormData, institution: e.target.value})}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-slate-900 font-semibold mb-2">Notes</label>
                    <textarea
                      value={editCashFormData.notes}
                      onChange={(e) => setEditCashFormData({...editCashFormData, notes: e.target.value})}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-slate-500 to-slate-700 text-white font-bold rounded-xl hover:from-slate-600 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="animate-spin mr-2" />
                          Updating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Check className="mr-2" />
                          Update Cash
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditCashModal(false)}
                      className="px-6 py-4 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;

