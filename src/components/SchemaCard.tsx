import { Link } from "react-router-dom";
import { Image as ImageIcon, Zap, CircleDot, Layers, Cog } from "lucide-react";
import type { SchemaComplet } from "../lib/types";

interface SchemaCardProps {
  schema: SchemaComplet;
}

const CATEGORIE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  moteur: { label: "Moteur", icon: Zap, color: "bg-amber-100 text-amber-800" },
  frein: { label: "Frein", icon: CircleDot, color: "bg-rose-100 text-rose-800" },
  transformateur: { label: "Transformateur", icon: Layers, color: "bg-violet-100 text-violet-800" },
  alternateur: { label: "Alternateur", icon: Zap, color: "bg-emerald-100 text-emerald-800" },
};

export default function SchemaCard({ schema }: SchemaCardProps) {
  const catConfig = schema.categorie ? CATEGORIE_CONFIG[schema.categorie] : null;
  const CatIcon = catConfig?.icon;

  return (
    <Link
      to={`/schema/${schema.id}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-slate-100 group flex flex-col"
    >
      <div className="h-40 bg-slate-100 flex items-center justify-center overflow-hidden relative">
        {schema.photo_url ? (
          <img
            src={schema.photo_url}
            alt={schema.code_schema || "Schéma"}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="flex flex-col items-center text-slate-300">
            <ImageIcon size={32} />
            <p className="text-[10px] mt-1">Aucune photo</p>
          </div>
        )}
        {/* Badge categorie en overlay */}
        {catConfig && CatIcon && (
          <span className={`absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm ${catConfig.color}`}>
            <CatIcon size={10} /> {catConfig.label}
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="font-bold text-amber-700 text-sm">
            {schema.code_schema || "—"}
          </span>
        </div>

        {(schema.type_bobinage?.nom || schema.type_bobinage_libre) && (
          <p className="text-xs text-slate-600 font-medium mb-2">
            {schema.type_bobinage?.nom || schema.type_bobinage_libre}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-auto">
          {schema.puissance_kw !== null && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
              <Zap size={10} /> {schema.puissance_kw} kW
            </span>
          )}
          {schema.nb_poles !== null && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
              <CircleDot size={10} /> {schema.nb_poles} pôles
            </span>
          )}
          {schema.nb_encoches !== null && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
              <Cog size={10} /> {schema.nb_encoches} enc.
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}