import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAndSession } from "@/lib/supabase/server";
import { getCompanyAssets } from "@/lib/companies";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getSupabaseAndSession(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const assets = await getCompanyAssets(auth.supabase, id);
    return NextResponse.json(assets);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to list assets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
