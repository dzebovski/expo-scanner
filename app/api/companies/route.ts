import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAndSession } from "@/lib/supabase/server";
import { listCompanies } from "@/lib/companies";

export async function GET(request: NextRequest) {
  const auth = await getSupabaseAndSession(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const companies = await listCompanies(auth.supabase);
    return NextResponse.json(companies);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to list companies";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
