/**
 * Client-side image compression so uploads stay under Vercel's 4.5 MB body limit.
 * Resizes to max 1600px (longest side) and exports as JPEG quality 0.8 to match backend pipeline.
 */

const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.8;

function isHeic(file: File): boolean {
  const t = file.type?.toLowerCase() ?? "";
  return t === "image/heic" || t === "image/heif" || file.name?.toLowerCase().endsWith(".heic") || false;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function resizeAndExportAsJpeg(img: HTMLImageElement): Promise<Blob> {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const scale =
    w > MAX_SIDE || h > MAX_SIDE ? Math.min(MAX_SIDE / w, MAX_SIDE / h) : 1;
  const cw = Math.round(w * scale);
  const ch = Math.round(h * scale);

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("No canvas context"));
  ctx.drawImage(img, 0, 0, cw, ch);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

/**
 * Compress an image file for upload: max 1600px, JPEG 0.8.
 * Converts HEIC to JPEG in the browser so iPhone photos stay under body size limit.
 */
export async function compressImageFile(file: File): Promise<File> {
  let blob: Blob;
  let src: string | null = null;

  try {
    if (isHeic(file)) {
      const { default: heic2any } = await import("heic2any");
      const result = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: JPEG_QUALITY,
      });
      const jpegBlob = Array.isArray(result) ? result[0] : result;
      src = URL.createObjectURL(jpegBlob);
      const img = await loadImage(src);
      URL.revokeObjectURL(src);
      src = null;
      blob = await resizeAndExportAsJpeg(img);
    } else {
      src = URL.createObjectURL(file);
      const img = await loadImage(src);
      blob = await resizeAndExportAsJpeg(img);
    }

    const name = file.name.replace(/\.[^.]+$/i, ".jpg");
    return new File([blob], name, { type: "image/jpeg" });
  } finally {
    if (src) URL.revokeObjectURL(src);
  }
}
