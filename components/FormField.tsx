"use client";

type Props = {
  icon?: React.ReactNode;
  label: string;
  name: string;
  defaultValue: string;
  className?: string;
  multiline?: boolean;
};

export default function FormField({
  icon,
  label,
  name,
  defaultValue,
  className = "",
  multiline,
}: Props) {
  return (
    <div className={className}>
      {label ? (
        <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
          {icon} {label}
        </label>
      ) : null}
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
      ) : (
        <input
          type="text"
          name={name}
          defaultValue={defaultValue}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
      )}
    </div>
  );
}
