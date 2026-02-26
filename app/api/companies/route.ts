import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { listCompanies } from "@/lib/companies";

export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const companies = await listCompanies(supabase);
    return NextResponse.json(companies);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to list companies";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
