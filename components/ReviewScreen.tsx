"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Tag,
  FileText,
  ChevronLeft,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import FormField from "./FormField";
import type { Company } from "@/lib/types";

type CompanyAsset = { id: string; public_url: string };

type Props = { company: Company };

export default function ReviewScreen({ company }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [assets, setAssets] = useState<CompanyAsset[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(company.categories ?? []);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryValue, setNewCategoryValue] = useState("");

  useEffect(() => {
    setCategories(company.categories ?? []);
  }, [company.id, company.categories]);

  useEffect(() => {
    fetch(`/api/companies/${company.id}/assets`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setAssets)
      .catch(() => setAssets([]));
  }, [company.id]);

  const thumbnailUrl = assets[0]?.public_url ?? company.thumbnail;
  const handleDeletePhoto = async (assetId: string) => {
    setDeletingId(assetId);
    try {
      const res = await fetch(`/api/companies/${company.id}/assets/${assetId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
    } catch {
      alert("Failed to delete photo");
    } finally {
      setDeletingId(null);
    }
  };

  const addCategory = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) return;
    setCategories((prev) => [...prev, trimmed]);
    setNewCategoryValue("");
    setAddingCategory(false);
  };

  const removeCategory = (index: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim() ?? company.name;
    const website = (formData.get("website") as string)?.trim() ?? company.website;
    const emails = (formData.get("emails") as string)?.trim() ?? company.emails;
    const phones = (formData.get("phones") as string)?.trim() ?? company.phones;
    const country = (formData.get("country") as string)?.trim() ?? company.country;
    const city = (formData.get("city") as string)?.trim() ?? company.city;
    const booth = (formData.get("booth") as string)?.trim() ?? company.booth;
    const notes = (formData.get("notes") as string)?.trim() ?? company.notes;

    setSaving(true);
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          website,
          emails,
          phones,
          country,
          city,
          booth,
          notes,
          categories,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      router.push(`/company/${company.id}`);
    } catch {
      alert("Failed to save company");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative min-h-[100dvh]">
      <header className="px-4 py-4 bg-white text-slate-900 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100 shadow-sm">
        <Link
          href={`/company/${company.id}`}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-semibold">Review Details</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
          <img
            src={thumbnailUrl || "/placeholder.svg"}
            alt=""
            className="w-16 h-16 rounded-xl object-cover bg-slate-100"
          />
          <div>
            <h2 className="text-xl font-bold text-slate-900">{company.name}</h2>
            <p className="text-slate-500 flex items-center gap-1 mt-1 text-sm">
              <Globe size={14} /> {company.website}
            </p>
          </div>
        </div>

        <form id="review-form" onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <FormField icon={<Building2 size={16} />} label="Company Name" name="name" defaultValue={company.name} />
          <FormField icon={<Globe size={16} />} label="Website" name="website" defaultValue={company.website} />
          <FormField icon={<Mail size={16} />} label="Emails" name="emails" defaultValue={company.emails} />
          <FormField icon={<Phone size={16} />} label="Phones" name="phones" defaultValue={company.phones} />
          <div className="flex gap-4">
            <FormField icon={<MapPin size={16} />} label="Country" name="country" defaultValue={company.country} className="flex-1" />
            <FormField label="City" name="city" defaultValue={company.city} className="flex-1" />
          </div>
          <FormField label="Booth" name="booth" defaultValue={company.booth} />
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
              <Tag size={16} /> Product Categories
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {categories.map((cat, i) => (
                <span
                  key={`${cat}-${i}`}
                  className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100 inline-flex items-center gap-1.5"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => removeCategory(i)}
                    className="p-0.5 rounded-full hover:bg-blue-200/80 transition-colors"
                    aria-label={`Remove ${cat}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {addingCategory ? (
                <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-full pl-3 pr-1 py-1">
                  <input
                    type="text"
                    value={newCategoryValue}
                    onChange={(e) => setNewCategoryValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCategory(newCategoryValue);
                      }
                      if (e.key === "Escape") {
                        setAddingCategory(false);
                        setNewCategoryValue("");
                      }
                    }}
                    placeholder="New category"
                    className="w-28 bg-transparent text-sm text-slate-900 focus:outline-none py-1"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => addCategory(newCategoryValue)}
                    disabled={!newCategoryValue.trim()}
                    className="p-1.5 rounded-full bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Add category"
                  >
                    <Plus size={14} />
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingCategory(true)}
                  className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 border-dashed flex items-center gap-1 active:bg-slate-100 transition-colors"
                >
                  <Plus size={14} /> Add
                </button>
              )}
            </div>
          </div>
          <div className="pt-2">
            <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
              <FileText size={16} /> Notes
            </label>
            <FormField name="notes" label="" defaultValue={company.notes} multiline className="mt-1" />
          </div>
        </form>

        {assets.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Processed pictures
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {assets.map((asset) => (
                <div key={asset.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square">
                  <img
                    src={asset.public_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(asset.id)}
                    disabled={deletingId === asset.id}
                    className="absolute top-2 right-2 p-2 rounded-full bg-red-500/90 text-white hover:bg-red-600 disabled:opacity-50 transition-colors shadow-md"
                    aria-label="Delete photo"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-8 sm:pb-4 flex gap-3 z-20">
        <Link
          href="/scan"
          className="flex-1 bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-medium active:bg-slate-200 transition-colors text-center"
        >
          Edit Photos
        </Link>
        <button
          type="submit"
          form="review-form"
          disabled={saving}
          className="flex-[2] bg-blue-600 text-white py-3.5 rounded-2xl font-medium active:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Company"}
        </button>
      </div>
    </div>
  );
}
