import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Save, X, Loader2, ArrowLeft, AlertCircle,
  Zap, CircleDot, Cog, Wrench
} from "lucide-react";
import PhotoUpload from "../components/PhotoUpload";
import type { TypeBobinage, Marque } from "../lib/types";

const EMPTY_FORM = {
  photo_url: "",
  puissance_kw: "",
  tension_v: "",
  nb_poles: "",
  vitesse_tr_min: "",
  frequence: "50",
  type_moteur: "",
  marque_id: "",
  reference_moteur: "",
  type_bobinage_id: "",
  nb_encoches: "",
  pas: "",
  nb_spires: "",
  diametre_fil_mm: "",
  nb_fils_parallele: "1",
  section_totale_mm2: "",
  groupes_par_phase: "",
  connexion: "",
  nb_voies: "1",
  pas_bobine: "",
  notes: "",
};

export default function NouveauSchemaPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [types, setTypes] = useState<TypeBobinage[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);

  useEffect(() => {
    const load = async () => {
      const [t, m] = await Promise.all([
        supabase.from("types_bobinage").select("*").order("nom"),
        supabase.from("marques").select("*").order("nom"),
      ]);
      setTypes((t.data as TypeBobinage[]) || []);
      setMarques((m.data as Marque[]) || []);
    };
    load();
  }, []);

  const update = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSave = async () => {
    // Validation minimale
    const errs: Record<string, string> = {};
    if (!form.photo_url) errs.photo_url = "La photo du schéma est obligatoire";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);

    const { data, error } = await supabase
      .from("schemas_bobinage")
      .insert({
        photo_url: form.photo_url || null,
        puissance_kw: form.puissance_kw ? parseFloat(form.puissance_kw) : null,
        tension_v: form.tension_v ? parseInt(form.tension_v) : null,
        nb_poles: form.nb_poles ? parseInt(form.nb_poles) : null,
        vitesse_tr_min: form.vitesse_tr_min ? parseInt(form.vitesse_tr_min) : null,
        frequence: form.frequence ? parseInt(form.frequence) : 50,
        type_moteur: form.type_moteur.trim() || null,
        marque_id: form.marque_id || null,
        reference_moteur: form.reference_moteur.trim() || null,
        type_bobinage_id: form.type_bobinage_id || null,
        nb_encoches: form.nb_encoches ? parseInt(form.nb_encoches) : null,
        pas: form.pas.trim() || null,
        nb_spires: form.nb_spires ? parseInt(form.nb_spires) : null,
        diametre_fil_mm: form.diametre_fil_mm ? parseFloat(form.diametre_fil_mm) : null,
        nb_fils_parallele: form.nb_fils_parallele ? parseInt(form.nb_fils_parallele) : 1,
        section_totale_mm2: form.section_totale_mm2 ? parseFloat(form.section_totale_mm2) : null,
        groupes_par_phase: form.groupes_par_phase ? parseInt(form.groupes_par_phase) : null,
        connexion: form.connexion || null,
        nb_voies: form.nb_voies ? parseInt(form.nb_voies) : 1,
        pas_bobine: form.pas_bobine.trim() || null,
        notes: form.notes.trim() || null,
      })
      .select()
      .single();

    if (error || !data) {
      setSaving(false);
      setErrors({ global: "Erreur : " + (error?.message || "inconnue") });
      return;
    }

    setSaving(false);
    navigate(`/schema/${data.id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
          title="Retour"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Nouveau schéma de bobinage</h1>
          <p className="text-sm text-slate-500">
            Enregistrez un nouveau schéma de référence
          </p>
        </div>
      </div>

      {errors.global && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{errors.global}</p>
        </div>
      )}

      {/* PHOTO */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <PhotoUpload
          currentUrl={form.photo_url || null}
          onUploaded={(url) => update("photo_url", url)}
          onRemoved={() => update("photo_url", "")}
        />
        {errors.photo_url && (
          <p className="text-xs text-red-600 mt-2">{errors.photo_url}</p>
        )}
      </div>

      {/* MOTEUR */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4 flex items-center gap-2">
          <Zap size={14} /> Caractéristiques du moteur
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Puissance (kW)" type="number" value={form.puissance_kw} onChange={(v) => update("puissance_kw", v)} placeholder="Ex: 5.5" />
          <Field label="Tension (V)" type="number" value={form.tension_v} onChange={(v) => update("tension_v", v)} placeholder="Ex: 380" />
          <Field label="Nombre de pôles" type="number" value={form.nb_poles} onChange={(v) => update("nb_poles", v)} placeholder="Ex: 4" />
          <Field label="Vitesse (tr/min)" type="number" value={form.vitesse_tr_min} onChange={(v) => update("vitesse_tr_min", v)} placeholder="Ex: 1450" />
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Fréquence (Hz)</label>
            <select
              value={form.frequence}
              onChange={(e) => update("frequence", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="50">50 Hz</option>
              <option value="60">60 Hz</option>
            </select>
          </div>
          <Field label="Type de moteur" value={form.type_moteur} onChange={(v) => update("type_moteur", v)} placeholder="Ex: Asynchrone triphasé" />
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Marque</label>
            <select
              value={form.marque_id}
              onChange={(e) => update("marque_id", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="">— Sélectionner —</option>
              {marques.map((m) => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </select>
          </div>
          <Field label="Référence moteur" value={form.reference_moteur} onChange={(v) => update("reference_moteur", v)} placeholder="Ex: LS 132 M" />
        </div>
      </div>

      {/* BOBINAGE */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4 flex items-center gap-2">
          <Cog size={14} /> Caractéristiques du bobinage
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Type de bobinage</label>
            <select
              value={form.type_bobinage_id}
              onChange={(e) => update("type_bobinage_id", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="">— Sélectionner —</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.nom}</option>
              ))}
            </select>
          </div>
          <Field label="Nombre d'encoches" type="number" value={form.nb_encoches} onChange={(v) => update("nb_encoches", v)} placeholder="Ex: 36" />
          <Field label="Pas" value={form.pas} onChange={(v) => update("pas", v)} placeholder="Ex: 1-9" />
          <Field label="Nombre de spires" type="number" value={form.nb_spires} onChange={(v) => update("nb_spires", v)} placeholder="Ex: 45" />
          <Field label="Diamètre du fil (mm)" type="number" value={form.diametre_fil_mm} onChange={(v) => update("diametre_fil_mm", v)} placeholder="Ex: 1.25" step="0.01" />
          <Field label="Nombre de fils en parallèle" type="number" value={form.nb_fils_parallele} onChange={(v) => update("nb_fils_parallele", v)} placeholder="Ex: 2" />
          <Field label="Section totale (mm²)" type="number" value={form.section_totale_mm2} onChange={(v) => update("section_totale_mm2", v)} placeholder="Ex: 2.45" step="0.01" />
          <Field label="Groupes par phase" type="number" value={form.groupes_par_phase} onChange={(v) => update("groupes_par_phase", v)} placeholder="Ex: 3" />
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Connexion</label>
            <select
              value={form.connexion}
              onChange={(e) => update("connexion", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="">— Sélectionner —</option>
              <option value="etoile">Étoile (Y)</option>
              <option value="triangle">Triangle (Δ)</option>
              <option value="etoile-triangle">Étoile-Triangle</option>
            </select>
          </div>
          <Field label="Nombre de voies" type="number" value={form.nb_voies} onChange={(v) => update("nb_voies", v)} placeholder="Ex: 1" />
          <Field label="Pas bobine" value={form.pas_bobine} onChange={(v) => update("pas_bobine", v)} placeholder="Ex: 1-10" />
        </div>
      </div>

      {/* NOTES */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4 flex items-center gap-2">
          <Wrench size={14} /> Notes et remarques
        </h2>
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={4}
          placeholder="Remarques, précisions, particularités du schéma..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />
      </div>

      {/* BOUTONS */}
      <div className="flex items-center justify-end gap-2 sticky bottom-4 bg-slate-50 py-2">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-lg px-6 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <><Loader2 size={14} className="animate-spin" /> Enregistrement...</>
          ) : (
            <><Save size={14} /> Enregistrer le schéma</>
          )}
        </button>
      </div>
    </div>
  );
}

// --- Composant helper Field ---
function Field({
  label, value, onChange, placeholder, type = "text", step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
      />
    </div>
  );
}