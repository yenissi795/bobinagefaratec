import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { Search, Loader2, Zap, CircleDot, Cog, Layers, X } from "lucide-react";
import SchemaCard from "../components/SchemaCard";
import type { SchemaComplet, Categorie, TypeBobinage, Marque } from "../lib/types";
import { loadCategories } from "../lib/referentiels";

const CATEGORIE_ICONS: Record<string, any> = {
  moteur: Zap,
  frein: CircleDot,
  transformateur: Layers,
  alternateur: Zap,
};

export default function RecherchePage() {
  const [schemas, setSchemas] = useState<SchemaComplet[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [types, setTypes] = useState<TypeBobinage[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [loading, setLoading] = useState(true);

  const [categorie, setCategorie] = useState("");
  const [puissance, setPuissance] = useState("");
  const [nbPoles, setNbPoles] = useState("");
  const [nbEncoches, setNbEncoches] = useState("");
  const [typeId, setTypeId] = useState("");
  const [marqueId, setMarqueId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
      if (categorie && s.categorie !== categorie) return false;
      if (puissance && (s.puissance_kw === null || s.puissance_kw !== parseFloat(puissance))) return false;
      if (nbPoles && (s.nb_poles === null || s.nb_poles !== parseInt(nbPoles))) return false;
      if (nbEncoches && (s.nb_encoches === null || s.nb_encoches !== parseInt(nbEncoches))) return false;
      if (typeId && s.type_bobinage_id !== typeId) return false;
      if (marqueId && s.marque_id !== marqueId) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const match =
          (s.code_schema && s.code_schema.toLowerCase().includes(q)) ||
          (s.reference_moteur && s.reference_moteur.toLowerCase().includes(q)) ||
          (s.notes && s.notes.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [schemas, categorie, puissance, nbPoles, nbEncoches, typeId, marqueId, searchTerm]);

  const reset = () => {
    setCategorie("");
    setPuissance("");
    setNbPoles("");
    setNbEncoches("");
    setTypeId("");
    setMarqueId("");
    setSearchTerm("");
  };

  const nbCriteres = [categorie, puissance, nbPoles, nbEncoches, typeId, marqueId, searchTerm].filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Search size={20} className="text-amber-600" />
          Recherche avancée
        </h1>
        <p className="text-sm text-slate-500">
          Retrouvez un schéma par ses caractéristiques techniques
        </p>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <label className="text-xs font-semibold text-slate-900 block mb-2">
          Catégorie d'équipement
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategorie("")}
            className={`text-xs font-semibold rounded-lg px-3 py-1.5 transition ${
              categorie === "" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Toutes
          </button>
          {categories.map((cat) => {
            const Icon = CATEGORIE_ICONS[cat.code] || Zap;
            return (
              <button
                key={cat.id}
                onClick={() => setCategorie(cat.code)}
                className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 transition ${
                  categorie === cat.code ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon size={12} /> {cat.nom}
              </button>
            );
          })}
        </div>
      </div>

      {/* Criteres */}
      <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1">
              <Zap size={12} className="text-amber-600" /> Puissance (kW / kVA)
            </label>
            <input
              type="number"
              step="0.1"
              value={puissance}
              onChange={(e) => setPuissance(e.target.value)}
              placeholder="Ex: 5.5"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1">
              <CircleDot size={12} className="text-blue-600" /> Nombre de pôles
            </label>
            <input
              type="number"
              value={nbPoles}
              onChange={(e) => setNbPoles(e.target.value)}
              placeholder="Ex: 4"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1">
              <Cog size={12} className="text-violet-600" /> Nombre d'encoches
            </label>
            <input
              type="number"
              value={nbEncoches}
              onChange={(e) => setNbEncoches(e.target.value)}
              placeholder="Ex: 36"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-900 mb-1">Type de bobinage</label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="">Tous</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-900 mb-1">Marque</label>
            <select
              value={marqueId}
              onChange={(e) => setMarqueId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="">Toutes</option>
              {marques.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-900 mb-1">Recherche texte</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Code, référence, notes..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {nbCriteres > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg px-3 py-1.5 transition"
          >
            <X size={12} /> Réinitialiser ({nbCriteres})
          </button>
        )}
      </div>

      {/* Resultats */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-amber-500" size={28} />
        </div>
      ) : nbCriteres === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Search size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-500">
            Remplissez au moins un critère pour lancer la recherche.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-sm font-medium text-slate-500">Aucun schéma ne correspond.</p>
          <button onClick={reset} className="text-xs text-amber-600 hover:underline mt-2">
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">
            <strong>{filtered.length}</strong> résultat{filtered.length > 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((s) => <SchemaCard key={s.id} schema={s} />)}
          </div>
        </>
      )}
    </div>
  );
}