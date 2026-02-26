"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Edit2, Globe, Mail, Phone, MapPin, Trash2 } from "lucide-react";
import type { Company } from "@/lib/types";

type Props = { company: Company };

export default function DetailScreen({ company }: Props) {
  const router = useRouter();
  const websiteHref = company.website?.match(/^https?:\/\//) ? company.website : `https://${company.website}`;

  const handleDelete = async () => {
    if (!confirm("Delete this company?")) return;
    const res = await fetch(`/api/companies/${company.id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) {
      alert("Failed to delete company");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-[100dvh]">
      <header className="px-2 py-3 bg-white text-slate-900 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
        <Link href="/" className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-semibold truncate px-2">{company.name}</h1>
        <Link href={`/scan/review?companyId=${company.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
          <Edit2 size={20} />
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-12">
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <img
            src={company.thumbnail || "/placeholder.svg"}
            alt=""
            className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-slate-100"
          />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{company.name}</h2>
            {company.website && (
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium flex items-center justify-center gap-1 mt-1"
              >
                <Globe size={16} /> {company.website}
              </a>
            )}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            {(company.city || company.country) && (
              <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                <MapPin size={14} /> {[company.city, company.country].filter(Boolean).join(", ")}
              </span>
            )}
            {company.booth && (
              <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium">
                Booth {company.booth}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</h3>
          <div className="space-y-4">
            {company.emails && (
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Email</p>
                  <p className="text-slate-900 font-medium">{company.emails}</p>
                </div>
              </div>
            )}
            {company.phones && (
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Phone</p>
                  <p className="text-slate-900 font-medium">{company.phones}</p>
                </div>
              </div>
            )}
            {!company.emails && !company.phones && (
              <p className="text-slate-500 text-sm">No contact info</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Products</h3>
            <div className="flex flex-wrap gap-2">
              {company.categories?.length
                ? company.categories.map((cat, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      {cat}
                    </span>
                  ))
                : "—"}
            </div>
          </div>
          {company.notes && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {company.notes}
              </p>
            </div>
          )}
        </div>

        {company.photos?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Photo Gallery</h3>
            <div className="grid grid-cols-2 gap-3">
              {company.photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt=""
                  className="w-full h-32 object-cover rounded-2xl border border-slate-100"
                />
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors"
          >
            <Trash2 size={20} />
            Delete company
          </button>
        </div>
      </main>
    </div>
  );
}
