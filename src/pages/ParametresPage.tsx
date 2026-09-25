import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Settings, Plus, Trash2, Loader2, Zap, Tag, CircleDot,
  Layers, AlertCircle, CheckCircle2
} from "lucide-react";

type Referentiel =
  | "types_bobinage"
  | "marques"
  | "technologies"
  | "alimentations"
  | "types_connexion"
  | "couplages_transformateur";

interface ReferentielConfig {
  key: Referentiel;
  label: string;
  icone: any;
  couleur: string;
  description: string;
  champNom: string;
  champValeur: string | null;
}

const REFERENTIELS: ReferentielConfig[] = [
  {
    key: "types_bobinage",
    label: "Types de bobinage",
    icone: Zap,
    couleur: "text-amber-600",
    description: "Imbriqué, ondulé, concentrique...",
    champNom: "nom",
    champValeur: "description",
  },
  {
    key: "marques",
    label: "Marques de moteur",
    icone: Tag,
    couleur: "text-blue-600",
    description: "Leroy Somer, Siemens, ABB...",
    champNom: "nom",
    champValeur: null,
  },
  {
    key: "technologies",
    label: "Technologies",
    icone: CircleDot,
    couleur: "text-violet-600",
    description: "Asynchrone, synchrone, CC...",
    champNom: "nom",
    champValeur: null,
  },
  {
    key: "alimentations",
    label: "Alimentations",
    icone: Zap,
    couleur: "text-emerald-600",
    description: "Triphasé, monophasé, DC...",
    champNom: "nom",
    champValeur: null,
  },
  {
    key: "types_connexion",
    label: "Types de connexion",
    icone: CircleDot,
    couleur: "text-rose-600",
    description: "Étoile, triangle, zigzag...",
    champNom: "nom",
    champValeur: null,
  },
  {
    key: "couplages_transformateur",
    label: "Couplages transformateur",
    icone: Layers,
    couleur: "text-indigo-600",
    description: "Yy, Yd, Dy, Dd...",
    champNom: "code",
    champValeur: "description",
  },
];

export default function ParametresPage() {
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeRef, setActiveRef] = useState<Referentiel>("types_bobinage");
  const [newValue, setNewValue] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const results: Record<string, any[]> = {};
    await Promise.all(
      REFERENTIELS.map(async (r) => {
        const { data } = await supabase.from(r.key).select("*").order(r.champNom);
        results[r.key] = data || [];
      })
    );
    setData(results);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const currentRef = REFERENTIELS.find((r) => r.key === activeRef)!;
  const currentData = data[activeRef] || [];

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    setSaving(true);
    setError(null);

    const payload: Record<string, string> = { [currentRef.champNom]: newValue.trim() };
    if (currentRef.champValeur && newDesc.trim()) {
      payload[currentRef.champValeur] = newDesc.trim();
    }

    const { error: err } = await supabase.from(currentRef.key).insert(payload);

    if (err) {
      setError("Erreur : " + err.message);
      setSaving(false);
      return;
    }

    setNewValue("");
    setNewDesc("");
    setSuccess("Ajouté avec succès");
    setTimeout(() => setSuccess(null), 2000);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet élément ?")) return;
    await supabase.from(currentRef.key).delete().eq("id", id);
    setSuccess("Supprimé");
    setTimeout(() => setSuccess(null), 2000);
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-500" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings size={20} className="text-amber-600" />
          Paramètres
        </h1>
        <p className="text-sm text-slate-500">
          Gérer les référentiels utilisés dans les formulaires
        </p>
      </div>

      {/* Onglets des referentiels */}
      <div className="flex flex-wrap gap-2 bg-white rounded-xl p-2 shadow-sm">
        {REFERENTIELS.map((r) => {
          const Icon = r.icone;
          const count = (data[r.key] || []).length;
          return (
            <button
              key={r.key}
              onClick={() => {
                setActiveRef(r.key);
                setNewValue("");
                setNewDesc("");
                setError(null);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-2 transition ${
                activeRef === r.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Icon size={12} />
              {r.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeRef === r.key ? "bg-white text-slate-900" : "bg-white text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Message succes */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <p className="text-sm text-emerald-800 font-medium">{success}</p>
        </div>
      )}

      {/* Message erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600" />
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Contenu */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <currentRef.icone size={16} className={currentRef.couleur} />
              {currentRef.label}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{currentRef.description}</p>
          </div>
        </div>

        {/* Formulaire d'ajout */}
        <div className="mb-5 bg-slate-50 rounded-lg p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={
                currentRef.key === "couplages_transformateur"
                  ? "Code (ex: Yy)"
                  : "Nouvelle valeur..."
              }
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            {currentRef.champValeur && (
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optionnel)"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            )}
            <button
              onClick={handleAdd}
              disabled={saving || !newValue.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 justify-center"
            >
              {saving ? (
                <><Loader2 size={14} className="animate-spin" /> Ajout...</>
              ) : (
                <><Plus size={14} /> Ajouter</>
              )}
            </button>
          </div>
        </div>

        {/* Liste */}
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {currentData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8 italic">
              Aucun élément. Ajoutez-en un ci-dessus.
            </p>
          ) : (
            currentData.map((item) => {
              const displayValue = item[currentRef.champNom];
              const desc = currentRef.champValeur ? item[currentRef.champValeur] : null;
              return (
                <div key={item.id} className="flex items-center justify-between py-2.5 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{displayValue}</p>
                    {desc && (
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-300 hover:text-red-500 transition p-2 opacity-0 group-hover:opacity-100"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}