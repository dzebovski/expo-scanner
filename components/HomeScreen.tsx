"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Camera, Plus } from "lucide-react";
import type { Company } from "@/lib/types";

export default function HomeScreen() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCompanies)
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="px-5 py-4 bg-white text-slate-900 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
        <h1 className="text-xl font-semibold tracking-tight">Expo Scanner</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
            <Camera size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Scan New Company</h2>
            <p className="text-sm text-slate-500 mt-1">Take photos of logo, products, QR or website</p>
          </div>
          <Link
            href="/scan"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3.5 font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 active:scale-[0.98]"
          >
            <Plus size={20} />
            Start Scan
          </Link>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-500 px-1">Recent Scans</h3>
          {loading ? (
            <p className="text-slate-400 text-sm px-1">Loading…</p>
          ) : companies.length === 0 ? (
            <p className="text-slate-400 text-sm px-1">Companies will appear here after you scan.</p>
          ) : (
            companies.map((company) => (
              <button
                key={company.id}
                type="button"
                onClick={() => router.push(`/company/${company.id}`)}
                className="w-full text-left bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <img
                  src={company.thumbnail || "/placeholder.svg"}
                  alt={company.name}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-900 truncate pr-2">{company.name}</h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap mt-0.5">
                      {company.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 truncate">{company.website}</p>
                  <div className="mt-1">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      {company.status}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
