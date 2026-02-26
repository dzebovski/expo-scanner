import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getCompanyAssets } from "@/lib/companies";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = getSupabaseServer();
    const assets = await getCompanyAssets(supabase, id);
    return NextResponse.json(assets);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to list assets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
