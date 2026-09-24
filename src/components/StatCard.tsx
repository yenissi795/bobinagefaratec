import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: "amber" | "blue" | "emerald" | "violet" | "rose";
}

const COLORS = {
  amber: { border: "border-amber-500", icon: "text-amber-600" },
  blue: { border: "border-blue-500", icon: "text-blue-600" },
  emerald: { border: "border-emerald-500", icon: "text-emerald-600" },
  violet: { border: "border-violet-500", icon: "text-violet-600" },
  rose: { border: "border-rose-500", icon: "text-rose-600" },
};

export default function StatCard({ label, value, icon, color = "amber" }: StatCardProps) {
  const c = COLORS[color];
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${c.border}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={c.icon}>{icon}</span>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}