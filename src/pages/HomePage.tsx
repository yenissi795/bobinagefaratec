import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Plus, Search, Settings, Library, Zap, TrendingUp,
  BookOpen, Loader2, ArrowRight, Layers, Tag
} from "lucide-react";
import StatCard from "../components/StatCard";
import SchemaCard from "../components/SchemaCard";
import type { SchemaComplet, TypeBobinage, Marque } from "../lib/types";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ schemas: 0, types: 0, marques: 0 });
  const [derniers, setDerniers] = useState<SchemaComplet[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [schemasRes, typesRes, marquesRes, derniersRes] = await Promise.all([
        supabase.from("schemas_bobinage").select("id", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("types_bobinage").select("id", { count: "exact", head: true }),
        supabase.from("marques").select("id", { count: "exact", head: true }),
        supabase
          .from("schemas_bobinage")
          .select("*, marque:marques(*), type_bobinage:types_bobinage(*)")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(4),
      ]);

      setStats({
        schemas: schemasRes.count || 0,
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
      description: "Enregistrer un nouveau schéma de bobinage avec photo",
      icon: Plus,
      color: "bg-amber-500",
      hover: "hover:bg-amber-600",
    },
    {
      to: "/base",
      label: "Base complète",
      description: "Consulter tous les schémas de la base",
      icon: Library,
      color: "bg-blue-600",
      hover: "hover:bg-blue-700",
    },
    {
      to: "/recherche",
      label: "Recherche",
      description: "Retrouver un schéma par puissance, pôles, encoches...",
      icon: Search,
      color: "bg-violet-600",
      hover: "hover:bg-violet-700",
    },
    {
      to: "/parametres",
      label: "Paramètres",
      description: "Gérer les types de bobinage et les marques",
      icon: Settings,
      color: "bg-slate-600",
      hover: "hover:bg-slate-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* --- TITRE --- */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen size={24} className="text-amber-600" />
          Base de schémas de bobinage
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Enregistrez, recherchez et consultez les schémas de bobinage de référence.
        </p>
      </div>

      {/* --- TUILES --- */}
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

      {/* --- STATS --- */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
          Statistiques
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Schémas enregistrés"
            value={stats.schemas}
            icon={<Layers size={16} />}
            color="amber"
          />
          <StatCard
            label="Types de bobinage"
            value={stats.types}
            icon={<Zap size={16} />}
            color="blue"
          />
          <StatCard
            label="Marques de moteur"
            value={stats.marques}
            icon={<Tag size={16} />}
            color="emerald"
          />
        </div>
      </div>

      {/* --- DERNIERS SCHÉMAS --- */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
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