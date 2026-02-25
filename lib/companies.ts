import { getSupabase } from "@/lib/supabase/server";
import type { Company, CompanyRow } from "@/lib/types";

function formatTimestamp(createdAt: string): string {
  const d = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

function rowToCompany(row: CompanyRow, photoUrls: string[]): Company {
  const thumbnail = photoUrls[0] ?? "";
  return {
    id: row.id,
    name: row.name ?? "",
    website: row.website ?? "",
    emails: Array.isArray(row.emails) ? row.emails.join(", ") : "",
    phones: Array.isArray(row.phones) ? row.phones.join(", ") : "",
    country: row.country ?? "",
    city: row.city ?? "",
    booth: row.booth ?? "",
    categories: row.product_categories ?? [],
    notes: row.notes ?? "",
    status: "Saved",
    timestamp: formatTimestamp(row.created_at),
    thumbnail,
    photos: photoUrls,
  };
}

export async function listCompanies(): Promise<Company[]> {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!rows?.length) return [];

  const ids = rows.map((r) => r.id);
  const { data: assets } = await supabase
    .from("image_assets")
    .select("company_id, public_url, sort_order")
    .in("company_id", ids)
    .order("sort_order");

  const photosByCompany = new Map<string, string[]>();
  for (const a of assets ?? []) {
    const list = photosByCompany.get(a.company_id) ?? [];
    list.push(a.public_url);
    photosByCompany.set(a.company_id, list);
  }

  return rows.map((row) =>
    rowToCompany(row as CompanyRow, photosByCompany.get(row.id) ?? [])
  );
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const supabase = getSupabase();
  const { data: row, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !row) return null;

  const { data: assets } = await getSupabase()
    .from("image_assets")
    .select("public_url, sort_order")
    .eq("company_id", id)
    .order("sort_order");

  const photos = (assets ?? []).map((a) => a.public_url);
  return rowToCompany(row as CompanyRow, photos);
}

export type CompanyUpdate = {
  name?: string;
  website?: string;
  emails?: string | string[];
  phones?: string | string[];
  country?: string;
  city?: string;
  booth?: string;
  categories?: string[];
  notes?: string;
};

function toEmails(v: string | string[] | undefined): string[] | null {
  if (v == null) return null;
  if (Array.isArray(v)) return v.filter(Boolean).map((s) => String(s).trim());
  return String(v)
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toPhones(v: string | string[] | undefined): string[] | null {
  return toEmails(v);
}

export async function updateCompany(
  id: string,
  patch: CompanyUpdate
): Promise<Company | null> {
  const supabase = getSupabase();
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.website !== undefined) row.website = patch.website;
  if (patch.country !== undefined) row.country = patch.country;
  if (patch.city !== undefined) row.city = patch.city;
  if (patch.booth !== undefined) row.booth = patch.booth;
  if (patch.notes !== undefined) row.notes = patch.notes;
  if (patch.emails !== undefined) row.emails = toEmails(patch.emails);
  if (patch.phones !== undefined) row.phones = toPhones(patch.phones);
  if (patch.categories !== undefined) row.product_categories = patch.categories;

  const { error } = await supabase.from("companies").update(row).eq("id", id);

  if (error) throw new Error(error.message);
  return getCompanyById(id);
}
