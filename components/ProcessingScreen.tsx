"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Zap, Check, Loader2, AlertCircle } from "lucide-react";

type Props = {
  promise: Promise<{ companyId: string }>;
  onSuccess: (companyId: string) => void;
  onRetry: () => void;
};

export default function ProcessingScreen({ promise, onSuccess, onRetry }: Props) {
  const [state, setState] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const t1 = setTimeout(() => {
      if (mounted) setState(2);
    }, 2000);
    const interval = setInterval(() => {
      if (mounted) setProgress((p) => Math.min(p + 5, 100));
    }, 100);
    let successTimeout: ReturnType<typeof setTimeout> | null = null;

    promise
      .then((data) => {
        if (!mounted) return;
        setState(3);
        successTimeout = setTimeout(() => {
          if (mounted) onSuccess(data.companyId);
        }, 800);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Щось пішло не так");
      });

    return () => {
      mounted = false;
      clearTimeout(t1);
      clearInterval(interval);
      if (successTimeout) clearTimeout(successTimeout);
    };
  }, [promise, onSuccess]);

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center p-8 text-center min-h-[100dvh]">
        <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex justify-center mb-4">
            <AlertCircle size={48} className="text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Помилка</h2>
          <p className="text-slate-600 mb-6 text-sm">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium text-sm active:bg-blue-700 transition-colors"
          >
            Спробувати ще раз
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white items-center justify-center p-8 text-center min-h-[100dvh]">
      <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
        {state === 1 && (
          <div className="w-full h-full rounded-full border-4 border-slate-100 flex items-center justify-center">
            <ImageIcon size={32} className="text-blue-500 animate-pulse" />
          </div>
        )}
        {state === 2 && (
          <div className="absolute inset-0">
            <Loader2 size={96} className="text-blue-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={32} className="text-blue-600" />
            </div>
          </div>
        )}
        {state === 3 && (
          <div className="absolute inset-0">
            <Loader2 size={96} className="text-green-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Check size={32} className="text-green-500" />
            </div>
          </div>
        )}
      </div>
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">
        {state === 1 && "Uploading Photos"}
        {state === 2 && "Analyzing with AI"}
        {state === 3 && "Saving Company"}
      </h2>
      <p className="text-slate-500 mb-8">
        {state === 1 && "Sending images to your server"}
        {state === 2 && "Processing with Gemini API"}
        {state === 3 && "Storing extracted information"}
      </p>
      {state === 1 && (
        <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
