import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Save, Loader2, ArrowLeft, AlertCircle, Zap, CircleDot,
  Layers, Wrench, Cog, Calendar, Hash, User, Clock, RotateCw, Wind
} from "lucide-react";
import PhotoUpload from "../components/PhotoUpload";
import type { Marque, TypeBobinage, Categorie } from "../lib/types";
import { loadCategories, loadMarques, loadTypesBobinage } from "../lib/referentiels";

const EMPTY_FORM = {
  // En-tete
  code_schema: "",
  date_fiche: new Date().toISOString().slice(0, 10),
  categorie: "moteur" as string,
  type_equipement_libre: "",
  client_name: "",
  marque_id: "",
  num_serie: "",
  type_moteur: "",

  // Photos
  photo_url: "",
  photo_2_url: "",

  // Moteur
  puissance_kw: "",
  tension_v: "",
  vitesse_tr_min: "",
  courant_nominal_a: "",
  cos_phi: "",
  rotor: "",

  // Circuit magnetique
  alesage: "",
  longueur: "",
  nb_encoches: "",
  h_couronne: "",
  h_dent: "",
  largeur_dent: "",
  encoche_pleine_vide: "",
  origine: "",
  frequence: "50",
  sonde: "",
  soudure_anti: "",
  resistance_anti_condensat: "",
  palier: "",
  roulement: "",

  // Bobinage commun
  type_bobinage_id: "",
  type_bobinage_libre: "",
  pole: "",
  pas: "",
  nb_spires: "",
  gr_ii: "",
  fils_ii: "",
  fil_encoches: "",
  fils_nu: "",
  debordement: "",
  cable_sortie: "",

  // Ancien
  ancien_pole: "",
  ancien_pas: "",
  ancien_nb_spires: "",
  ancien_gr_ii: "",
  ancien_fils_ii: "",
  ancien_fil_encoches: "",
  ancien_fils_nu: "",
  ancien_debordement: "",
  ancien_cable_sortie: "",

  // Nouveau
  nouveau_pole: "",
  nouveau_pas: "",
  nouveau_nb_spires: "",
  nouveau_gr_ii: "",
  nouveau_fils_ii: "",
  nouveau_fil_encoches: "",
  nouveau_fils_nu: "",
  nouveau_debordement: "",
  nouveau_cable_sortie: "",

  // Options
  sens_rotation: false,
  ventilation: false,

  // Temps
  temps_releve_ta: "",
  temps_releve_tp: "",
  temps_enro_ta: "",
  temps_enro_tp: "",
  temps_bobinage_ta: "",
  temps_bobinage_tp: "",
  nom_intervenant: "",

  // Notes
  notes: "",
};

export default function NouveauSchemaPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [typesBobinage, setTypesBobinage] = useState<TypeBobinage[]>([]);
  const [showTypeBobinageLibre, setShowTypeBobinageLibre] = useState(false);
  const [existingFiche, setExistingFiche] = useState<{ id: string; code_schema: string } | null>(null);
  const [showMarqueLibre, setShowMarqueLibre] = useState(false);
  const [marqueLibre, setMarqueLibre] = useState("");

  useEffect(() => {
    const load = async () => {
      const [cats, mq, tb] = await Promise.all([
        loadCategories(),
        loadMarques(),
        loadTypesBobinage(),
      ]);
      setCategories(cats);
      setMarques(mq);
      setTypesBobinage(tb);
      setLoading(false);
    };
    load();
  }, []);

  const verifierCodeSchema = async (code: string) => {
    if (!code.trim()) {
      setExistingFiche(null);
      return;
    }
    const { data } = await supabase
      .from("schemas_bobinage")
      .select("id, code_schema")
      .eq("code_schema", code.trim())
      .is("deleted_at", null)
      .maybeSingle();
    setExistingFiche(data as any);
  };

  const update = (key: keyof typeof EMPTY_FORM, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.code_schema.trim()) errs.code_schema = "Le N° Faratec est obligatoire";
    if (existingFiche) errs.code_schema = "Ce numero existe deja. Ouvrez la fiche ou changez de numero.";
    if (!form.photo_url) errs.photo_url = "La photo du schéma est obligatoire";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);

    // Creer la marque si besoin
    let marqueId = form.marque_id;
    if (showMarqueLibre && marqueLibre.trim()) {
      const { data } = await supabase.from("marques").insert({ nom: marqueLibre.trim() }).select().single();
      if (data) marqueId = data.id;
    }

    // Creer le type bobinage si besoin
    let typeBobinageId = form.type_bobinage_id;
    if (showTypeBobinageLibre && form.type_bobinage_libre.trim()) {
      const { data } = await supabase.from("types_bobinage").insert({ nom: form.type_bobinage_libre.trim() }).select().single();
      if (data) typeBobinageId = data.id;
    }

    const num = (v: string) => (v && v.trim() !== "" ? parseFloat(v) : null);
    const int = (v: string) => (v && v.trim() !== "" ? parseInt(v) : null);
    const str = (v: string) => (v && v.trim() !== "" ? v.trim() : null);

    const payload = {
      code_schema: form.code_schema.trim() || null,
      date_fiche: form.date_fiche || null,
      categorie: form.categorie || "moteur",
      type_equipement_libre: str(form.type_equipement_libre),
      marque_id: marqueId || null,
      num_serie: str(form.num_serie),
      type_moteur: str(form.type_moteur),
      photo_url: form.photo_url || null,
      photo_2_url: form.photo_2_url || null,
      puissance_kw: num(form.puissance_kw),
      tension_v: int(form.tension_v),
      vitesse_tr_min: int(form.vitesse_tr_min),
      courant_nominal_a: num(form.courant_nominal_a),
      cos_phi: num(form.cos_phi),
      rotor: str(form.rotor),
      alesage: num(form.alesage),
      longueur: num(form.longueur),
      nb_encoches: int(form.nb_encoches),
      h_couronne: num(form.h_couronne),
      h_dent: num(form.h_dent),
      largeur_dent: num(form.largeur_dent),
      encoche_pleine_vide: str(form.encoche_pleine_vide),
      origine: str(form.origine),
      frequence: int(form.frequence),
      sonde: str(form.sonde),
      soudure_anti: str(form.soudure_anti),
      resistance_anti_condensat: str(form.resistance_anti_condensat),
      palier: str(form.palier),
      roulement: str(form.roulement),
      type_bobinage_id: typeBobinageId || null,
      type_bobinage_libre: str(form.type_bobinage_libre),
      pole: str(form.pole),
      pas: str(form.pas),
      nb_spires: int(form.nb_spires),
      gr_ii: str(form.gr_ii),
      fils_ii: str(form.fils_ii),
      fil_encoches: str(form.fil_encoches),
      fils_nu: str(form.fils_nu),
      debordement: str(form.debordement),
      cable_sortie: str(form.cable_sortie),
      ancien_pole: str(form.ancien_pole),
      ancien_pas: str(form.ancien_pas),
      ancien_nb_spires: int(form.ancien_nb_spires),
      ancien_gr_ii: str(form.ancien_gr_ii),
      ancien_fils_ii: str(form.ancien_fils_ii),
      ancien_fil_encoches: str(form.ancien_fil_encoches),
      ancien_fils_nu: str(form.ancien_fils_nu),
      ancien_debordement: str(form.ancien_debordement),
      ancien_cable_sortie: str(form.ancien_cable_sortie),
      nouveau_pole: str(form.nouveau_pole),
      nouveau_pas: str(form.nouveau_pas),
      nouveau_nb_spires: int(form.nouveau_nb_spires),
      nouveau_gr_ii: str(form.nouveau_gr_ii),
      nouveau_fils_ii: str(form.nouveau_fils_ii),
      nouveau_fil_encoches: str(form.nouveau_fil_encoches),
      nouveau_fils_nu: str(form.nouveau_fils_nu),
      nouveau_debordement: str(form.nouveau_debordement),
      nouveau_cable_sortie: str(form.nouveau_cable_sortie),
      sens_rotation: form.sens_rotation,
      ventilation: form.ventilation,
      temps_releve_ta: num(form.temps_releve_ta),
      temps_releve_tp: num(form.temps_releve_tp),
      temps_enro_ta: num(form.temps_enro_ta),
      temps_enro_tp: num(form.temps_enro_tp),
      temps_bobinage_ta: num(form.temps_bobinage_ta),
      temps_bobinage_tp: num(form.temps_bobinage_tp),
      nom_intervenant: str(form.nom_intervenant),
      notes: str(form.notes),
    };

    const { data, error } = await supabase.from("schemas_bobinage").insert(payload).select().single();

    if (error || !data) {
      setSaving(false);
      setErrors({ global: "Erreur : " + (error?.message || "inconnue") });
      return;
    }

    setSaving(false);
    navigate(`/schema/${data.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-500" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* En-tete */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nouvelle fiche technique</h1>
          <p className="text-sm text-slate-500">Remplissez la fiche de bobinage FARATEC</p>
        </div>
      </div>

      {errors.global && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{errors.global}</p>
        </div>
      )}

      {/* SECTION 1 : PHOTOS */}
      <Section icon={Calendar} title="Photos du dossier">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <PhotoUpload
              currentUrl={form.photo_url || null}
              onUploaded={(url) => update("photo_url", url)}
              onRemoved={() => update("photo_url", "")}
            />
            <p className="text-xs text-slate-500 mt-2 italic">Photo 1 : schéma de bobinage</p>
            {errors.photo_url && <p className="text-xs text-red-600 mt-1">{errors.photo_url}</p>}
          </div>
          <div>
            <PhotoUpload
              currentUrl={form.photo_2_url || null}
              onUploaded={(url) => update("photo_2_url", url)}
              onRemoved={() => update("photo_2_url", "")}
            />
            <p className="text-xs text-slate-500 mt-2 italic">Photo 2 : fiche remplie (manuscrite)</p>
          </div>
        </div>
      </Section>

      {/* SECTION 2 : EN-TETE FICHE */}
      <Section icon={Hash} title="En-tête de la fiche">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Field
              label="N° Faratec *"
              value={form.code_schema}
              onChange={(v) => {
                update("code_schema", v);
                verifierCodeSchema(v);
              }}
              placeholder="Ex: 13784"
            />
            {errors.code_schema && <p className="text-xs text-red-600 mt-1">{errors.code_schema}</p>}
            {existingFiche && (
              <div className="mt-2 bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-900">
                    La fiche N° {existingFiche.code_schema} existe deja
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Vous pouvez l'ouvrir pour la modifier, ou saisir un autre numero.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/schema/${existingFiche.id}`)}
                    className="mt-2 inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition"
                  >
                    Ouvrir la fiche existante
                  </button>
                </div>
              </div>
            )}
          </div>
          <Field label="Date" type="date" value={form.date_fiche} onChange={(v) => update("date_fiche", v)} />
          <SelectField
            label="Catégorie"
            value={form.categorie}
            onChange={(v) => update("categorie", v)}
            options={categories.map((c) => c.code)}
            labels={categories.map((c) => c.nom)}
          />
          <Field label="Type d'équipement (libre)" value={form.type_equipement_libre} onChange={(v) => update("type_equipement_libre", v)} placeholder="Ex: Moteur asynchrone triphasé" />
          <Field label="Client" value={form.client_name} onChange={(v) => update("client_name", v)} placeholder="Nom du client" />
          <MarqueField
            marques={marques}
            value={form.marque_id}
            marqueLibre={marqueLibre}
            showLibre={showMarqueLibre}
            onChange={(v) => update("marque_id", v)}
            onMarqueLibreChange={setMarqueLibre}
            onShowLibre={setShowMarqueLibre}
          />
          <Field label="N° série / N°" value={form.num_serie} onChange={(v) => update("num_serie", v)} placeholder="Ex: 12744" />
          <Field label="Type moteur" value={form.type_moteur} onChange={(v) => update("type_moteur", v)} placeholder="Ex: 95C" />
        </div>
      </Section>

      {/* SECTION 3 : MOTEUR */}
      <Section icon={Zap} title="Caractéristiques moteur">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Puissance (kW)" type="number" step="0.01" value={form.puissance_kw} onChange={(v) => update("puissance_kw", v)} placeholder="Ex: 500" />
          <Field label="Tension (V)" type="number" value={form.tension_v} onChange={(v) => update("tension_v", v)} placeholder="Ex: 380" />
          <Field label="Vitesse (tr/min)" type="number" value={form.vitesse_tr_min} onChange={(v) => update("vitesse_tr_min", v)} placeholder="Ex: 595" />
          <Field label="Courant (A)" type="number" step="0.01" value={form.courant_nominal_a} onChange={(v) => update("courant_nominal_a", v)} placeholder="Ex: 63" />
          <Field label="Cos φ" type="number" step="0.01" value={form.cos_phi} onChange={(v) => update("cos_phi", v)} placeholder="Ex: 0.95" />
          <Field label="Rotor" value={form.rotor} onChange={(v) => update("rotor", v)} placeholder="Ex: 95C Rotor" />
        </div>
      </Section>

      {/* SECTION 4 : CIRCUIT MAGNETIQUE */}
      <Section icon={CircleDot} title="Circuit magnétique">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Alésage" type="number" step="0.1" value={form.alesage} onChange={(v) => update("alesage", v)} placeholder="Ex: 58.5" />
          <Field label="Longueur" type="number" step="0.1" value={form.longueur} onChange={(v) => update("longueur", v)} placeholder="Ex: 4.3" />
          <Field label="Nombre d'encoches" type="number" value={form.nb_encoches} onChange={(v) => update("nb_encoches", v)} placeholder="Ex: 72" />
          <Field label="H. Couronne" type="number" step="0.1" value={form.h_couronne} onChange={(v) => update("h_couronne", v)} />
          <Field label="H. Dent" type="number" step="0.1" value={form.h_dent} onChange={(v) => update("h_dent", v)} />
          <Field label="Largeur dent" type="number" step="0.1" value={form.largeur_dent} onChange={(v) => update("largeur_dent", v)} />
          <Field label="Encoche pleine/vide" value={form.encoche_pleine_vide} onChange={(v) => update("encoche_pleine_vide", v)} placeholder="Ex: Pleine" />
          <Field label="Origine" value={form.origine} onChange={(v) => update("origine", v)} />
          <Field label="Fréquence (Hz)" type="number" value={form.frequence} onChange={(v) => update("frequence", v)} placeholder="Ex: 50" />
          <Field label="Sonde" value={form.sonde} onChange={(v) => update("sonde", v)} placeholder="Ex: PT100" />
          <Field label="Soudure anti" value={form.soudure_anti} onChange={(v) => update("soudure_anti", v)} />
          <Field label="Résistance anti condensat" value={form.resistance_anti_condensat} onChange={(v) => update("resistance_anti_condensat", v)} />
          <Field label="Palier" value={form.palier} onChange={(v) => update("palier", v)} />
          <Field label="Roulement" value={form.roulement} onChange={(v) => update("roulement", v)} />
        </div>
      </Section>

      {/* SECTION 5 : BOBINAGE (commun) */}
      <Section icon={Cog} title="Bobinage (commun)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-1.5">Type de bobinage</label>
            {!showTypeBobinageLibre ? (
              <select
                value={form.type_bobinage_id}
                onChange={(e) => {
                  if (e.target.value === "__autre__") {
                    setShowTypeBobinageLibre(true);
                    setForm((f) => ({ ...f, type_bobinage_id: "" }));
                  } else {
                    update("type_bobinage_id", e.target.value);
                  }
                }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="">— Sélectionner —</option>
                {typesBobinage.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                <option value="__autre__">+ Autre (saisir)</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.type_bobinage_libre}
                  onChange={(e) => update("type_bobinage_libre", e.target.value)}
                  placeholder="Saisir..."
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button type="button" onClick={() => { setShowTypeBobinageLibre(false); setForm((f) => ({ ...f, type_bobinage_libre: "" })); }} className="text-xs text-slate-500 hover:text-slate-700 px-2">Annuler</button>
              </div>
            )}
          </div>
          <Field label="Pôle" value={form.pole} onChange={(v) => update("pole", v)} placeholder="Ex: 6" />
          <Field label="Pas" value={form.pas} onChange={(v) => update("pas", v)} placeholder="Ex: 1-11" />
          <Field label="N. Spires" type="number" value={form.nb_spires} onChange={(v) => update("nb_spires", v)} placeholder="Ex: 20" />
          <Field label="Gr II" value={form.gr_ii} onChange={(v) => update("gr_ii", v)} />
          <Field label="Fils II" value={form.fils_ii} onChange={(v) => update("fils_ii", v)} />
          <Field label="Fil/encoches" value={form.fil_encoches} onChange={(v) => update("fil_encoches", v)} placeholder="Ex: 1x4.75/2.10" />
          <Field label="Fils nu" value={form.fils_nu} onChange={(v) => update("fils_nu", v)} />
          <Field label="Débordement" value={form.debordement} onChange={(v) => update("debordement", v)} />
          <Field label="Câble sortie" value={form.cable_sortie} onChange={(v) => update("cable_sortie", v)} />
        </div>
      </Section>

      {/* SECTION 6 : ANCIEN vs NOUVEAU */}
      <Section icon={Layers} title="Comparaison Ancien / Nouveau">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ANCIEN */}
          <div className="bg-rose-50 rounded-lg p-4 border border-rose-100">
            <h3 className="text-sm font-bold text-rose-800 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold">A</span>
              Ancien
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Pôle" value={form.ancien_pole} onChange={(v) => update("ancien_pole", v)} />
              <Field label="Pas" value={form.ancien_pas} onChange={(v) => update("ancien_pas", v)} />
              <Field label="N. Spires" type="number" value={form.ancien_nb_spires} onChange={(v) => update("ancien_nb_spires", v)} />
              <Field label="Gr II" value={form.ancien_gr_ii} onChange={(v) => update("ancien_gr_ii", v)} />
              <Field label="Fils II" value={form.ancien_fils_ii} onChange={(v) => update("ancien_fils_ii", v)} />
              <Field label="Fil/encoches" value={form.ancien_fil_encoches} onChange={(v) => update("ancien_fil_encoches", v)} />
              <Field label="Fils nu" value={form.ancien_fils_nu} onChange={(v) => update("ancien_fils_nu", v)} />
              <Field label="Débordement" value={form.ancien_debordement} onChange={(v) => update("ancien_debordement", v)} />
              <Field label="Câble sortie" value={form.ancien_cable_sortie} onChange={(v) => update("ancien_cable_sortie", v)} />
            </div>
          </div>

          {/* NOUVEAU */}
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px] font-bold">N</span>
              Nouveau
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Pôle" value={form.nouveau_pole} onChange={(v) => update("nouveau_pole", v)} />
              <Field label="Pas" value={form.nouveau_pas} onChange={(v) => update("nouveau_pas", v)} />
              <Field label="N. Spires" type="number" value={form.nouveau_nb_spires} onChange={(v) => update("nouveau_nb_spires", v)} />
              <Field label="Gr II" value={form.nouveau_gr_ii} onChange={(v) => update("nouveau_gr_ii", v)} />
              <Field label="Fils II" value={form.nouveau_fils_ii} onChange={(v) => update("nouveau_fils_ii", v)} />
              <Field label="Fil/encoches" value={form.nouveau_fil_encoches} onChange={(v) => update("nouveau_fil_encoches", v)} />
              <Field label="Fils nu" value={form.nouveau_fils_nu} onChange={(v) => update("nouveau_fils_nu", v)} />
              <Field label="Débordement" value={form.nouveau_debordement} onChange={(v) => update("nouveau_debordement", v)} />
              <Field label="Câble sortie" value={form.nouveau_cable_sortie} onChange={(v) => update("nouveau_cable_sortie", v)} />
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 7 : OPTIONS */}
      <Section icon={Wind} title="Sens de rotation & Ventilation">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.sens_rotation} onChange={(e) => update("sens_rotation", e.target.checked)} className="w-4 h-4 accent-amber-500" />
            <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
              <RotateCw size={14} /> Sens de rotation
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.ventilation} onChange={(e) => update("ventilation", e.target.checked)} className="w-4 h-4 accent-amber-500" />
            <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
              <Wind size={14} /> Ventilation
            </span>
          </label>
        </div>
      </Section>

      {/* SECTION 8 : TEMPS */}
      <Section icon={Clock} title="Temps de travail">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Tableau TA / TP */}
          <div className="bg-slate-50 rounded-lg p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 font-bold text-slate-900">Étape</th>
                  <th className="text-center py-2 font-bold text-slate-900">TA</th>
                  <th className="text-center py-2 font-bold text-slate-900">TP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 text-slate-700 font-medium">Relevé</td>
                  <td className="py-2">
                    <input type="number" step="0.1" value={form.temps_releve_ta} onChange={(e) => update("temps_releve_ta", e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                  </td>
                  <td className="py-2">
                    <input type="number" step="0.1" value={form.temps_releve_tp} onChange={(e) => update("temps_releve_tp", e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-700 font-medium">Enro</td>
                  <td className="py-2">
                    <input type="number" step="0.1" value={form.temps_enro_ta} onChange={(e) => update("temps_enro_ta", e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                  </td>
                  <td className="py-2">
                    <input type="number" step="0.1" value={form.temps_enro_tp} onChange={(e) => update("temps_enro_tp", e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-700 font-medium">Bobinage</td>
                  <td className="py-2">
                    <input type="number" step="0.1" value={form.temps_bobinage_ta} onChange={(e) => update("temps_bobinage_ta", e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                  </td>
                  <td className="py-2">
                    <input type="number" step="0.1" value={form.temps_bobinage_tp} onChange={(e) => update("temps_bobinage_tp", e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-[10px] text-slate-500 mt-3">TA = Temps Alloué · TP = Temps Passé</p>
          </div>

          {/* Nom */}
          <div>
            <label className="text-sm font-bold text-slate-900 block mb-1.5 flex items-center gap-1">
              <User size={14} /> Nom de l'intervenant
            </label>
            <input
              type="text"
              value={form.nom_intervenant}
              onChange={(e) => update("nom_intervenant", e.target.value)}
              placeholder="Ex: NOUGGAOUI"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </Section>

      {/* SECTION 9 : NOTES */}
      <Section icon={Wrench} title="Notes et remarques">
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={4}
          placeholder="Remarques, précisions, particularités..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />
      </Section>

      {/* BOUTONS */}
      <div className="flex items-center justify-end gap-2 sticky bottom-4 bg-slate-50 py-3 border-t border-slate-200">
        <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-lg px-6 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <><Loader2 size={14} className="animate-spin" /> Enregistrement...</> : <><Save size={14} /> Enregistrer la fiche</>}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANTS HELPERS
// ============================================================

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-sm uppercase tracking-wider text-slate-700 font-bold mb-4 flex items-center gap-2">
        <Icon size={14} /> {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", step, disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-900 block mb-1.5">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options, labels, placeholder = "— Sélectionner —",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-900 block mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((opt, i) => (
          <option key={opt} value={opt}>{labels ? labels[i] : opt}</option>
        ))}
      </select>
    </div>
  );
}

function MarqueField({
  marques, value, marqueLibre, showLibre, onChange, onMarqueLibreChange, onShowLibre,
}: {
  marques: Marque[];
  value: string;
  marqueLibre: string;
  showLibre: boolean;
  onChange: (v: string) => void;
  onMarqueLibreChange: (v: string) => void;
  onShowLibre: (v: boolean) => void;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-900 block mb-1.5">Marque</label>
      {!showLibre ? (
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value === "__autre__") {
              onShowLibre(true);
              onChange("");
            } else {
              onChange(e.target.value);
            }
          }}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
        >
          <option value="">— Sélectionner —</option>
          {marques.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
          <option value="__autre__">+ Autre (saisir)</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={marqueLibre}
            onChange={(e) => onMarqueLibreChange(e.target.value)}
            placeholder="Saisir la marque..."
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => { onShowLibre(false); onMarqueLibreChange(""); }}
            className="text-xs text-slate-500 hover:text-slate-700 px-2"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}
