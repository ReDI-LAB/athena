
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
