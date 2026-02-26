import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAndSession } from "@/lib/supabase/server";
import { deleteCompanyAsset } from "@/lib/companies";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  const auth = await getSupabaseAndSession(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: companyId, assetId } = await params;
  try {
    await deleteCompanyAsset(auth.supabase, companyId, assetId);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete asset";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
