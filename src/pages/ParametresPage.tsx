import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Settings, Plus, Trash2, Loader2, Zap, Tag } from "lucide-react";
import type { TypeBobinage, Marque } from "../lib/types";

export default function ParametresPage() {
  const [types, setTypes] = useState<TypeBobinage[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [loading, setLoading] = useState(true);

  const [newType, setNewType] = useState("");
  const [newMarque, setNewMarque] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [t, m] = await Promise.all([
      supabase.from("types_bobinage").select("*").order("nom"),
      supabase.from("marques").select("*").order("nom"),
    ]);
    setTypes((t.data as TypeBobinage[]) || []);
    setMarques((m.data as Marque[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addType = async () => {
    if (!newType.trim()) return;
    setSaving(true);
    await supabase.from("types_bobinage").insert({ nom: newType.trim() });
    setNewType("");
    await load();
    setSaving(false);
  };

  const addMarque = async () => {
    if (!newMarque.trim()) return;
    setSaving(true);
    await supabase.from("marques").insert({ nom: newMarque.trim() });
    setNewMarque("");
    await load();
    setSaving(false);
  };

  const deleteType = async (id: string) => {
    if (!confirm("Supprimer ce type de bobinage ?")) return;
    await supabase.from("types_bobinage").delete().eq("id", id);
    await load();
  };

  const deleteMarque = async (id: string) => {
    if (!confirm("Supprimer cette marque ?")) return;
    await supabase.from("marques").delete().eq("id", id);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings size={20} className="text-amber-600" />
          Paramètres
        </h1>
        <p className="text-sm text-slate-500">
          Gérer les référentiels (types, marques)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Types de bobinage */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Zap size={16} className="text-amber-600" />
            Types de bobinage ({types.length})
          </h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="Nouveau type..."
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && addType()}
            />
            <button
              onClick={addType}
              disabled={saving || !newType.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus size={14} /> Ajouter
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {types.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700">{t.nom}</span>
                <button
                  onClick={() => deleteType(t.id)}
                  className="text-slate-300 hover:text-red-500 transition p-1"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Marques */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Tag size={16} className="text-blue-600" />
            Marques ({marques.length})
          </h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newMarque}
              onChange={(e) => setNewMarque(e.target.value)}
              placeholder="Nouvelle marque..."
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && addMarque()}
            />
            <button
              onClick={addMarque}
              disabled={saving || !newMarque.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus size={14} /> Ajouter
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {marques.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700">{m.nom}</span>
                <button
                  onClick={() => deleteMarque(m.id)}
                  className="text-slate-300 hover:text-red-500 transition p-1"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}