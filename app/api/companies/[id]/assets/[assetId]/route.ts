import { NextRequest, NextResponse } from "next/server";
import { deleteCompanyAsset } from "@/lib/companies";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  const { id: companyId, assetId } = await params;
  try {
    await deleteCompanyAsset(companyId, assetId);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete asset";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
