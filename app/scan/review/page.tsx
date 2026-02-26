"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ReviewScreen from "@/components/ReviewScreen";
import type { Company } from "@/lib/types";

function ReviewContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(!!companyId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setError("Missing company");
      setLoading(false);
      return;
    }
    fetch(`/api/companies/${companyId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setCompany)
      .catch(() => setError("Company not found"))
      .finally(() => setLoading(false));
  }, [companyId]);

  if (error || !companyId) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-slate-600 mb-4">{error ?? "Missing company ID"}</p>
        <Link href="/" className="text-blue-600 font-medium">Back to Home</Link>
      </div>
    );
  }
  if (loading || !company) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }
  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] overflow-hidden flex flex-col shadow-2xl sm:rounded-[2.5rem] sm:h-[850px] sm:my-8 border border-slate-200">
      <ReviewScreen company={company} />
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
}
