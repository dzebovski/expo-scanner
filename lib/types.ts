export type CompanyStatus = "Saved" | "Processing" | "Draft";

export type Company = {
  id: string;
  name: string;
  website: string;
  emails: string;
  phones: string;
  country: string;
  city: string;
  booth: string;
  categories: string[];
  notes: string;
  status: CompanyStatus;
  timestamp: string;
  thumbnail: string;
  photos: string[];
};

/** DB row shape for companies table */
export type CompanyRow = {
  id: string;
  name: string;
  website: string | null;
  short_description: string | null;
  country: string | null;
  city: string | null;
  booth: string | null;
  emails: string[] | null;
  phones: string[] | null;
  product_categories: string[] | null;
  confidence: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** DB row shape for image_assets table */
export type ImageAssetRow = {
  id: string;
  company_id: string;
  storage_path: string;
  public_url: string;
  sort_order: number;
  created_at: string;
};

export const STORAGE_BUCKET = "company-assets";
