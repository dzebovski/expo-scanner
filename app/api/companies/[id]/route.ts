import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getCompanyById, updateCompany, deleteCompany, type CompanyUpdate } from "@/lib/companies";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = getSupabaseServer();
    const company = await getCompanyById(supabase, id);
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(company);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to get company";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = (await request.json()) as CompanyUpdate;
    const supabase = getSupabaseServer();
    const company = await updateCompany(supabase, id, body);
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(company);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update company";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = getSupabaseServer();
    const company = await getCompanyById(supabase, id);
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await deleteCompany(supabase, id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete company";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
