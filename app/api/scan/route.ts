import { NextResponse } from "next/server";
import { getSupabaseAndSession } from "@/lib/supabase/server";
import { runScanPipeline } from "@/lib/scan";

/**
 * POST /api/scan
 * Accepts multipart/form-data: images (files), optional hint_text.
 * Pipeline: sharp (resize, strip EXIF, JPEG 80) → Supabase Storage → Gemini → companies + image_assets.
 * Requires auth (cookie or Authorization: Bearer).
 */
export async function POST(request: Request) {
  const auth = await getSupabaseAndSession(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const files: File[] = [];
  const images = formData.getAll("images");
  for (const item of images) {
    if (item instanceof File && item.size > 0) {
      files.push(item);
    }
  }

  if (files.length === 0) {
    return NextResponse.json(
      { error: "At least one image is required" },
      { status: 400 }
    );
  }

  try {
    const hintText = formData.get("hint_text");
    const { companyId } = await runScanPipeline(
      auth.supabase,
      auth.session.user.id,
      files,
      typeof hintText === "string" ? hintText : undefined
    );
    return NextResponse.json({ companyId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Scan failed";
    console.error("Scan error:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
