import { notFound } from "next/navigation";
import DetailScreen from "@/components/DetailScreen";
import { getCompanyById } from "@/lib/companies";
import { getSupabaseServer } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

export default async function CompanyDetailPage({ params }: Props) {
  const supabase = getSupabaseServer();
  const { id } = await params;
  let company;
  try {
    company = await getCompanyById(supabase, id);
  } catch {
    company = null;
  }
  if (!company) notFound();

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] overflow-hidden flex flex-col shadow-2xl sm:rounded-[2.5rem] sm:h-[850px] sm:my-8 border border-slate-200 bg-slate-50">
      <DetailScreen company={company} />
    </div>
  );
}
