"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Zap, ZapOff, Check } from "lucide-react";
import { compressImageFile } from "@/lib/compress-image";
import ProcessingScreen from "@/components/ProcessingScreen";

type ScanState =
  | { phase: "camera" }
  | { phase: "processing"; promise: Promise<{ companyId: string }> };

export default function CameraScreen() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);
  const [scanState, setScanState] = useState<ScanState>({ phase: "camera" });
  const [flash, setFlash] = useState(false);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles?.length) return;
    const list = Array.from(newFiles);
    const urls = list.map((f) => URL.createObjectURL(f));
    setFiles((prev) => [...prev, ...list]);
    setObjectUrls((prev) => [...prev, ...urls]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(objectUrls[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setObjectUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    if (files.length === 0) return;
    const promise = (async (): Promise<{ companyId: string }> => {
      const compressed = await Promise.all(files.map(compressImageFile));
      const formData = new FormData();
      compressed.forEach((f) => formData.append("images", f));
      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed: ${res.status}`);
      }
      return (await res.json()) as { companyId: string };
    })();
    setScanState({ phase: "processing", promise });
  };

  if (scanState.phase === "processing") {
    return (
      <ProcessingScreen
        promise={scanState.promise}
        onSuccess={(companyId) =>
          router.push(`/scan/review?companyId=${companyId}`)
        }
        onRetry={() => setScanState({ phase: "camera" })}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-black text-white min-h-[100dvh]">
      <div className="flex justify-between items-center p-4 z-10">
        <Link
          href="/"
          className="p-2 bg-white/10 rounded-full backdrop-blur-md active:bg-white/20 transition-colors"
        >
          <X size={24} />
        </Link>
        <button
          type="button"
          onClick={() => setFlash(!flash)}
          className="p-2 bg-white/10 rounded-full backdrop-blur-md active:bg-white/20 transition-colors"
        >
          {flash ? <Zap size={24} className="text-yellow-400" /> : <ZapOff size={24} />}
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <p className="text-white/50 text-center px-4">
            Add photos with the button below or tap the capture area.
          </p>
        </div>
        <div className="absolute inset-8 border-2 border-white/20 rounded-3xl pointer-events-none" />
      </div>

      <div className="pb-8 pt-4 px-4 bg-black/90 backdrop-blur-xl flex flex-col gap-6">
        <div className="h-16 flex gap-2 overflow-x-auto snap-x px-2">
          {objectUrls.map((url, i) => (
            <div key={i} className="relative shrink-0 snap-center">
              <img
                src={url}
                alt=""
                className="h-16 w-16 rounded-xl object-cover border border-white/20"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
              >
                ×
              </button>
            </div>
          ))}
          {objectUrls.length === 0 && (
            <div className="h-16 w-16 rounded-xl border border-white/20 border-dashed flex items-center justify-center text-white/40 text-xs text-center p-1 shrink-0">
              No photos
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="w-24" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 bg-white rounded-full" />
          </button>
          <div className="w-24 flex justify-end">
            {objectUrls.length > 0 && (
              <button
                type="button"
                onClick={handleFinish}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-full font-medium text-sm flex items-center gap-1.5 active:bg-blue-700 transition-colors"
              >
                Finish
                <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
