"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Zap, Check, Loader2 } from "lucide-react";

type Props = { onComplete: () => void };

export default function ProcessingScreen({ onComplete }: Props) {
  const [state, setState] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setState(2), 2000);
    const t2 = setTimeout(() => setState(3), 4500);
    const t3 = setTimeout(() => onComplete(), 6000);
    const interval = setInterval(() => setProgress((p) => Math.min(p + 5, 100)), 100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [onComplete]);

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
