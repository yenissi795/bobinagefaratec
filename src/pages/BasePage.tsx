import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Plus, Loader2, Library, Search, Filter, X, Zap, CircleDot, Layers } from "lucide-react";
import SchemaCard from "../components/SchemaCard";
import type { SchemaComplet, Categorie, TypeBobinage, Marque } from "../lib/types";
import { loadCategories } from "../lib/referentiels";

const CATEGORIE_ICONS: Record<string, any> = {
  moteur: Zap,
  frein: CircleDot,
  transformateur: Layers,
  alternateur: Zap,
};

export default function BasePage() {
  const [searchParams] = useSearchParams();
  const [schemas, setSchemas] = useState<SchemaComplet[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [types, setTypes] = useState<TypeBobinage[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategorie, setFilterCategorie] = useState(searchParams.get("cat") || "");
  const [filterType, setFilterType] = useState("");
  const [filterMarque, setFilterMarque] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [s, cats, t, m] = await Promise.all([
        supabase
          .from("schemas_bobinage")
          .select("*, marque:marques(*), type_bobinage:types_bobinage(*)")
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
        loadCategories(),
        supabase.from("types_bobinage").select("*").order("nom"),
        supabase.from("marques").select("*").order("nom"),
      ]);
      setSchemas((s.data as unknown as SchemaComplet[]) || []);
      setCategories(cats);
      setTypes((t.data as TypeBobinage[]) || []);
      setMarques((m.data as Marque[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return schemas.filter((s) => {
      if (filterCategorie && s.categorie !== filterCategorie) return false;
      if (filterType && s.type_bobinage_id !== filterType) return false;
      if (filterMarque && s.marque_id !== filterMarque) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const match =
          (s.code_schema && s.code_schema.toLowerCase().includes(q)) ||
          (s.reference_moteur && s.reference_moteur.toLowerCase().includes(q)) ||
          (s.notes && s.notes.toLowerCase().includes(q)) ||
          (s.technologie && s.technologie.toLowerCase().includes(q)) ||
          (s.alimentation && s.alimentation.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [schemas, filterCategorie, filterType, filterMarque, searchTerm]);

  const nbFiltresActifs = (filterCategorie ? 1 : 0) + (filterType ? 1 : 0) + (filterMarque ? 1 : 0);

  const resetFilters = () => {
    setFilterCategorie("");
    setFilterType("");
    setFilterMarque("");
    setSearchTerm("");
  };

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Library size={20} className="text-amber-600" />
            Base complète
          </h1>
          <p className="text-sm text-slate-500">
            Tous les schémas de bobinage enregistrés
          </p>
        </div>
        <Link
          to="/nouveau"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition self-start"
        >
          <Plus size={14} /> Nouveau
        </Link>
      </div>

      {/* Boutons catégories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategorie("")}
          className={`text-xs font-semibold rounded-lg px-3 py-1.5 transition ${
            filterCategorie === "" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Toutes ({schemas.length})
        </button>
        {categories.map((cat) => {
          const Icon = CATEGORIE_ICONS[cat.code] || Zap;
          const count = schemas.filter((s) => s.categorie === cat.code).length;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategorie(cat.code)}
              className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition ${
                filterCategorie === cat.code ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon size={12} /> {cat.nom} ({count})
            </button>
          );
        })}
      </div>

      {/* Recherche + filtres */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher : code, référence, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              showFilters || nbFiltresActifs > 0
                ? "bg-amber-500 text-neutral-900"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Filter size={14} />
            Filtres
            {nbFiltresActifs > 0 && (
              <span className="bg-neutral-900 text-amber-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                {nbFiltresActifs}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-900 block mb-1">
                  Type de bobinage
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">Tous les types</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>{t.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-900 block mb-1">
                  Marque
                </label>
                <select
                  value={filterMarque}
                  onChange={(e) => setFilterMarque(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">Toutes les marques</option>
                  {marques.map((m) => (
                    <option key={m.id} value={m.id}>{m.nom}</option>
                  ))}
                </select>
              </div>
            </div>
            {nbFiltresActifs > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg px-3 py-1.5 transition"
              >
                <X size={12} /> Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Résultats */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-amber-500" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Library size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-500">
            {schemas.length === 0 ? "Aucun schéma enregistré." : "Aucun résultat pour ces filtres."}
          </p>
          {schemas.length === 0 && (
            <Link
              to="/nouveau"
              className="inline-flex items-center gap-2 mt-4 bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition"
            >
              <Plus size={14} /> Créer le premier schéma
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">
            <strong>{filtered.length}</strong> schéma{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((s) => (
              <SchemaCard key={s.id} schema={s} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}