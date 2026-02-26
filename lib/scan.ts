import sharp from "sharp";
import convert from "heic-convert";
import { GoogleGenAI, createPartFromBase64, createPartFromText } from "@google/genai";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompanyRow } from "@/lib/types";
import { STORAGE_BUCKET } from "@/lib/types";

function isHeic(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name)
  );
}

const MAX_SIDE = 1600;
const JPEG_QUALITY = 80;
const GEMINI_MODEL = "gemini-3-flash-preview";

const EXTRACTION_PROMPT = `You are given photos from an exhibition booth. Extract only what is clearly visible (company name, website, contact info, location, booth number, product categories). Do not invent anything.

Reply with ONLY a single valid JSON object, no markdown or explanation. Use this exact structure:
{
  "companyName": "string or empty",
  "website": "string or empty",
  "shortDescription": "string or empty",
  "productCategories": ["string"],
  "emails": ["string"],
  "phones": ["string"],
  "country": "string or empty",
  "city": "string or empty",
  "booth": "string or empty",
  "confidence": 0.0 to 1.0
}`;

export async function processImage(buffer: Buffer): Promise<Buffer> {
  try {
    const image = sharp(buffer);
    const meta = await image.metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const scale =
      w > MAX_SIDE || h > MAX_SIDE
        ? Math.min(MAX_SIDE / w, MAX_SIDE / h)
        : 1;
    const newW = Math.round(w * scale);
    const newH = Math.round(h * scale);

    return await image
      .rotate()
      .resize(newW, newH, { fit: "inside" })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new Error(
      "Unsupported image format. Use JPEG or PNG, or ensure your device sends photos as JPEG."
    );
  }
}

export async function extractCompanyFromImages(
  imageBuffers: Buffer[]
): Promise<Partial<CompanyRow> & { confidence?: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { name: "New company", confidence: 0 };
  }

  const ai = new GoogleGenAI({ apiKey });
  const parts: ReturnType<typeof createPartFromBase64>[] = [
    createPartFromText(EXTRACTION_PROMPT),
  ];
  for (const buf of imageBuffers) {
    parts.push(createPartFromBase64(buf.toString("base64"), "image/jpeg"));
  }

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: parts,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text?.trim();
  if (!text) return { name: "New company", confidence: 0 };

  try {
    const raw = JSON.parse(text) as Record<string, unknown>;
    const confidence = typeof raw.confidence === "number" ? raw.confidence : 0.5;
    const arr = (v: unknown): string[] =>
      Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];
    const str = (v: unknown): string => (v != null ? String(v).trim() : "");

    return {
      name: str(raw.companyName) || "New company",
      website: str(raw.website) || null,
      short_description: str(raw.shortDescription) || null,
      country: str(raw.country) || null,
      city: str(raw.city) || null,
      booth: str(raw.booth) || null,
      emails: arr(raw.emails).length ? arr(raw.emails) : null,
      phones: arr(raw.phones).length ? arr(raw.phones) : null,
      product_categories: arr(raw.productCategories).length ? arr(raw.productCategories) : null,
      confidence,
    };
  } catch {
    return { name: "New company", confidence: 0 };
  }
}

export async function runScanPipeline(
  supabase: SupabaseClient,
  userId: string,
  files: File[],
  _hintText?: string
): Promise<{ companyId: string }> {

  const buffers = await Promise.all(
    files.map(async (f) => {
      const ab = await f.arrayBuffer();
      let buf: Buffer = Buffer.from(ab);
      if (isHeic(f)) {
        const out = await convert({
          buffer: buf,
          format: "JPEG",
          quality: 1,
        });
        buf = Buffer.isBuffer(out) ? out : Buffer.from(out as ArrayBuffer);
      }
      return processImage(buf);
    })
  );

  const extracted = await extractCompanyFromImages(buffers);

  const notesParts: string[] = [];
  const shortDesc = extracted.short_description?.trim();
  if (shortDesc) notesParts.push(shortDesc);
  const confidence = extracted.confidence;
  if (typeof confidence === "number" && confidence < 0.6) {
    notesParts.push(`Low confidence extraction (${confidence.toFixed(2)}).`);
  }
  const notes = notesParts.length > 0 ? notesParts.join("\n\n") : null;

  const { data: companyRow, error: insertError } = await supabase
    .from("companies")
    .insert({
      user_id: userId,
      name: extracted.name ?? "New company",
      website: extracted.website ?? null,
      short_description: extracted.short_description ?? null,
      country: extracted.country ?? null,
      city: extracted.city ?? null,
      booth: extracted.booth ?? null,
      emails: extracted.emails ?? [],
      phones: extracted.phones ?? [],
      product_categories: extracted.product_categories ?? [],
      confidence: extracted.confidence ?? null,
      notes,
    })
    .select("id")
    .single();

  if (insertError || !companyRow) {
    throw new Error(insertError?.message ?? "Failed to create company");
  }

  const companyId = companyRow.id;
  const basePath = `${companyId}`;

  for (let i = 0; i < buffers.length; i++) {
    const path = `${basePath}/${i}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffers[i], {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    await supabase.from("image_assets").insert({
      company_id: companyId,
      storage_path: path,
      public_url: publicUrl,
      sort_order: i,
    });
  }

  return { companyId };
}
