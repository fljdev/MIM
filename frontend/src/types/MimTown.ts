export type BusinessType = 'manufacturer' | 'distributor' | 'recycler' | 'retailer' | 'wholesaler' | 'service' | 'other';
export type MaterialCondition = 'available' | 'reserved' | 'sold' | 'unavailable';
export type TransactionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type UserRole = 'app_user' | 'business' | 'admin';

export interface BusinessProfile {
  id: string;
  name: string;
  description?: string;
  registered_number?: string;
  website?: string;
  phone?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  owner_id: string;
  verified: boolean;
  business_type: BusinessType;
  created_at: Date;
  updated_at: Date;
  
  // Joined fields (optional)
  owner_name?: string;
  owner_email?: string;
  available_materials_count?: number;
  completed_transactions_count?: number;
}

export interface WasteStream {
  id: number;
  name: string;
  description?: string;
  category: string;
  disposal_method: string;
  icon_key: string;
  unit: string;
  recycling_rate?: number;
  landfill_rate?: number;
  created_at: Date;
}

export interface Material {
  id: string;
  name: string;
  description?: string;
  material_type: number; // References waste_streams.id
  business_id: string;
  quantity: number;
  unit: string;
  condition: MaterialCondition;
  price_per_unit?: number;
  currency: string;
  available_from?: Date;
  available_until?: Date;
  keywords?: string;
  images?: string[];
  created_at: Date;
  updated_at: Date;
  
  // Joined fields (optional)
  waste_stream_name?: string;
  waste_stream_description?: string;
  disposal_method?: string;
  icon_key?: string;
  business_name?: string;
  business_verified?: boolean;
  business_type?: BusinessType;
  business_address?: string;
  business_lat?: number;
  business_lng?: number;
  owner_name?: string;
  owner_email?: string;
}

export interface Transaction {
  id: string;
  material_id: string;
  seller_id: string;
  buyer_id: string;
  quantity: number;
  price_per_unit: number;
  currency: string;
  total_amount: number;
  status: TransactionStatus;
  scheduled_pickup?: Date;
  actual_pickup?: Date;
  delivery_address?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  
  // Joined fields (optional)
  material_name?: string;
  seller_name?: string;
  buyer_name?: string;
}

export interface FavoriteMaterial {
  id: string;
  user_id: string;
  material_id: string;
  created_at: Date;
  
  // Joined fields (optional)
  material?: Material;
}

export interface FavoriteBusiness {
  id: string;
  user_id: string;
  business_id: string;
  created_at: Date;
  
  // Joined fields (optional)
  business?: BusinessProfile;
}

export interface MaterialSearchFilters {
  condition?: MaterialCondition;
  material_type?: number;
  min_quantity?: number;
  max_quantity?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
  business_type?: BusinessType;
  verified_business?: boolean;
  near_lat?: number;
  near_lng?: number;
  radius_km?: number;
  limit?: number;
  offset?: number;
}

export interface BusinessSearchFilters {
  verified?: boolean;
  business_type?: BusinessType;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface WasteStreamStats {
  total_materials: number;
  total_quantity: number;
  average_price_per_unit?: number;
  businesses_count: number;
}

export interface BusinessStats {
  available_materials_count: number;
  completed_transactions_count: number;
  total_materials_listed: number;
  total_materials_sold: number;
  revenue_generated?: number;
}

export interface UserBusinessProfile extends BusinessProfile {
  stats?: BusinessStats;
  recent_materials?: Material[];
  recent_transactions?: Transaction[];
}

export interface MaterialDetail extends Material {
  related_materials?: Material[];
  business_details?: BusinessProfile;
}

export interface CircularEconomyStats {
  total_materials_listed: number;
  total_businesses: number;
  materials_diverted_from_landfill: number;
  estimated_carbon_saved_kg: number;
  recent_transactions_count: number;
  top_waste_streams: Array<{
    name: string;
    count: number;
    quantity: number;
  }>;
}