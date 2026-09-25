import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Plus, Search, Settings, Library, Zap, TrendingUp,
  BookOpen, Loader2, ArrowRight, Layers, Tag, CircleDot,
  Wrench, Activity
} from "lucide-react";
import SchemaCard from "../components/SchemaCard";
import type { SchemaComplet, Categorie } from "../lib/types";
import { loadCategories } from "../lib/referentiels";

const CATEGORIE_ICONS: Record<string, any> = {
  moteur: Zap,
  frein: CircleDot,
  transformateur: Layers,
  alternateur: Zap,
};

const CATEGORIE_COLORS: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  moteur: { bg: "bg-amber-500", text: "text-amber-700", border: "border-amber-200", hover: "hover:bg-amber-600" },
  frein: { bg: "bg-rose-500", text: "text-rose-700", border: "border-rose-200", hover: "hover:bg-rose-600" },
  transformateur: { bg: "bg-violet-500", text: "text-violet-700", border: "border-violet-200", hover: "hover:bg-violet-600" },
  alternateur: { bg: "bg-emerald-500", text: "text-emerald-700", border: "border-emerald-200", hover: "hover:bg-emerald-600" },
};

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [totalSchemas, setTotalSchemas] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [derniers, setDerniers] = useState<SchemaComplet[]>([]);
  const [statsRef, setStatsRef] = useState({ types: 0, marques: 0 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [schemasRes, cats, typesRes, marquesRes, derniersRes] = await Promise.all([
        supabase.from("schemas_bobinage").select("categorie").is("deleted_at", null),
        loadCategories(),
        supabase.from("types_bobinage").select("id", { count: "exact", head: true }),
        supabase.from("marques").select("id", { count: "exact", head: true }),
        supabase
          .from("schemas_bobinage")
          .select("*, marque:marques(*), type_bobinage:types_bobinage(*)")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(4),
      ]);

      setCategories(cats);

      const schemas = (schemasRes.data as { categorie: string | null }[]) || [];
      setTotalSchemas(schemas.length);

      const c: Record<string, number> = {};
      schemas.forEach((s) => {
        const key = s.categorie || "autre";
        c[key] = (c[key] || 0) + 1;
      });
      setCounts(c);

      setStatsRef({
        types: typesRes.count || 0,
        marques: marquesRes.count || 0,
      });
      setDerniers((derniersRes.data as unknown as SchemaComplet[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const tuiles = [
    {
      to: "/nouveau",
      label: "Nouveau schéma",
      description: "Enregistrer un nouveau schéma avec photo",
      icon: Plus,
      color: "bg-amber-500",
      hover: "hover:bg-amber-600",
    },
    {
      to: "/base",
      label: "Base complète",
      description: "Consulter tous les schémas enregistrés",
      icon: Library,
      color: "bg-blue-600",
      hover: "hover:bg-blue-700",
    },
    {
      to: "/recherche",
      label: "Recherche",
      description: "Retrouver un schéma par caractéristiques",
      icon: Search,
      color: "bg-violet-600",
      hover: "hover:bg-violet-700",
    },
    {
      to: "/parametres",
      label: "Paramètres",
      description: "Gérer les référentiels",
      icon: Settings,
      color: "bg-slate-600",
      hover: "hover:bg-slate-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* TITRE */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen size={24} className="text-amber-600" />
          Base de schémas de bobinage
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Enregistrez, recherchez et consultez les schémas de bobinage de référence.
        </p>
      </div>

      {/* TUILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tuiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`${t.color} ${t.hover} text-white rounded-xl p-5 shadow-md hover:shadow-lg transition group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                  <Icon size={24} />
                </div>
                <ArrowRight
                  size={18}
                  className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition"
                />
              </div>
              <h2 className="font-bold text-base mb-1">{t.label}</h2>
              <p className="text-xs text-white/80 leading-snug">{t.description}</p>
            </Link>
          );
        })}
      </div>

      {/* STATS PAR CATEGORIE */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
          <Activity size={14} />
          Répartition par catégorie
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total */}
          <Link
            to="/base"
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-slate-400 hover:shadow-md transition"
          >
            <div className="flex items-center gap-2 mb-1">
              <Layers size={14} className="text-slate-600" />
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Total
              </p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalSchemas}</p>
            <p className="text-[10px] text-slate-400 mt-1">tous les schémas</p>
          </Link>

          {/* Par catégorie */}
          {categories.map((cat) => {
            const Icon = CATEGORIE_ICONS[cat.code] || Zap;
            const colors = CATEGORIE_COLORS[cat.code] || CATEGORIE_COLORS.moteur;
            const count = counts[cat.code] || 0;
            return (
              <Link
                key={cat.id}
                to={`/base?cat=${cat.code}`}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition group"
                style={{ borderLeftWidth: "4px", borderLeftColor: colors.bg.replace("bg-", "").replace("-500", "") === "amber" ? "#f59e0b" : colors.bg.replace("bg-", "").replace("-500", "") === "rose" ? "#f43f5e" : colors.bg.replace("bg-", "").replace("-500", "") === "violet" ? "#8b5cf6" : "#10b981" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className={colors.text} />
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold truncate">
                    {cat.nom}
                  </p>
                </div>
                <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {count === 0 ? "aucun" : count === 1 ? "schéma" : "schémas"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* STATS REFERENTIELS */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">
          Référentiels
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link to="/parametres" className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-amber-500 hover:shadow-md transition">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-amber-600" />
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Types bobinage
              </p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{statsRef.types}</p>
          </Link>
          <Link to="/parametres" className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500 hover:shadow-md transition">
            <div className="flex items-center gap-2 mb-1">
              <Tag size={14} className="text-blue-600" />
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Marques
              </p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{statsRef.marques}</p>
          </Link>
          <Link to="/parametres" className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-violet-500 hover:shadow-md transition">
            <div className="flex items-center gap-2 mb-1">
              <Wrench size={14} className="text-violet-600" />
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Catégories
              </p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
          </Link>
        </div>
      </div>

      {/* DERNIERS SCHEMAS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
            <TrendingUp size={14} />
            Derniers schémas ajoutés
          </h2>
          {derniers.length > 0 && (
            <Link
              to="/base"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Voir tout <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-sm">
            <Loader2 className="animate-spin text-amber-500" size={24} />
          </div>
        ) : derniers.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <BookOpen size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">
              Aucun schéma enregistré pour l'instant.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Commencez par en créer un nouveau.
            </p>
            <Link
              to="/nouveau"
              className="inline-flex items-center gap-2 mt-4 bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition"
            >
              <Plus size={14} /> Nouveau schéma
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {derniers.map((schema) => (
              <SchemaCard key={schema.id} schema={schema} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}