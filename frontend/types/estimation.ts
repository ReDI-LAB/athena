
export type RepairLocation = {
  id: number;
  title: string;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  website: string | null;
};

export type Estimation = {
  cost_min_eur: number | null;
  cost_max_eur: number | null;
  co2_saved_kg: number | null;
  waste_avoided_kg: number | null;
  recommended_locations: RepairLocation[];
};

export interface ParsedSearchQuery {
  raw_query: string;
  detected_category: string | null;
  detected_product_type: string | null;
  detected_repair_type: string | null;
  postal_code: string | null;
};
