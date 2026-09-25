import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Save, Loader2, ArrowLeft, AlertCircle, Zap, CircleDot,
  Layers, Wrench, Cog, ArrowRight
} from "lucide-react";
import PhotoUpload from "../components/PhotoUpload";
import type {
  CategorieEquipement, Categorie, TypeBobinage, Marque,
  Technologie, Alimentation, TypeConnexion, CouplageTransformateur
} from "../lib/types";
import {
  loadCategories, loadTypesBobinage, loadMarques,
  loadTechnologies, loadAlimentations, loadTypesConnexion,
  loadCouplagesTransformateur
} from "../lib/referentiels";

// --- ICONES PAR CATEGORIE ---
const CATEGORIE_ICONS: Record<string, any> = {
  moteur: Zap,
  frein: CircleDot,
  transformateur: Layers,
  alternateur: Zap,
};

const CATEGORIE_COLORS: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  moteur: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", hover: "hover:bg-amber-100 hover:border-amber-300" },
  frein: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", hover: "hover:bg-rose-100 hover:border-rose-300" },
  transformateur: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", hover: "hover:bg-violet-100 hover:border-violet-300" },
  alternateur: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", hover: "hover:bg-emerald-100 hover:border-emerald-300" },
};

const EMPTY_FORM = {
  photo_url: "",
  // Moteur / Alternateur
  puissance_kw: "",
  tension_v: "",
  courant_nominal_a: "",
  nb_poles: "",
  vitesse_tr_min: "",
  frequence: "50",
  technologie: "",
  alimentation: "",
  type_connexion: "",
  type_transformateur: "",
  marque_id: "",
  reference_moteur: "",
  // Frein
  frein_alimentation: "",
  frein_couple_nm: "",
  frein_type: "",
  // Transformateur
  tension_primaire_v: "",
  tension_secondaire_v: "",
  courant_primaire_a: "",
  courant_secondaire_a: "",
  couplage: "",
  nb_phases: "",
  refroidissement: "",
  // Alternateur
  excitation: "",
  // Bobinage
  type_bobinage_id: "",
  type_bobinage_libre: "",
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

  // Etape 1 : choix de categorie
  const [categorie, setCategorie] = useState<CategorieEquipement | null>(null);

  // Reference data
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [typesBobinage, setTypesBobinage] = useState<TypeBobinage[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [technologies, setTechnologies] = useState<Technologie[]>([]);
  const [alimentations, setAlimentations] = useState<Alimentation[]>([]);
  const [typesConnexion, setTypesConnexion] = useState<TypeConnexion[]>([]);
  const [couplages, setCouplages] = useState<CouplageTransformateur[]>([]);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Type de bobinage "Autre"
  const [showTypeBobinageLibre, setShowTypeBobinageLibre] = useState(false);
  // Marque "Autre"
  const [showMarqueLibre, setShowMarqueLibre] = useState(false);
  const [marqueLibre, setMarqueLibre] = useState("");

  useEffect(() => {
    const load = async () => {
      const [cats, tb, mq, tech, ali, tc, cp] = await Promise.all([
        loadCategories(),
        loadTypesBobinage(),
        loadMarques(),
        loadTechnologies(),
        loadAlimentations(),
        loadTypesConnexion(),
        loadCouplagesTransformateur(),
      ]);
      setCategories(cats);
      setTypesBobinage(tb);
      setMarques(mq);
      setTechnologies(tech);
      setAlimentations(ali);
      setTypesConnexion(tc);
      setCouplages(cp);
      setLoading(false);
    };
    load();
  }, []);

  const update = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.photo_url) errs.photo_url = "La photo du schéma est obligatoire";
    if (!categorie) errs.categorie = "La catégorie est obligatoire";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);

    // Si marque libre, on la cree d'abord
    let marqueId = form.marque_id;
    if (showMarqueLibre && marqueLibre.trim()) {
      const { data: newMarque } = await supabase
        .from("marques")
        .insert({ nom: marqueLibre.trim() })
        .select()
        .single();
      if (newMarque) marqueId = newMarque.id;
    }

    // Si type bobinage libre, on le cree d'abord
    let typeBobinageId = form.type_bobinage_id;
    if (showTypeBobinageLibre && form.type_bobinage_libre.trim()) {
      const { data: newType } = await supabase
        .from("types_bobinage")
        .insert({ nom: form.type_bobinage_libre.trim() })
        .select()
        .single();
      if (newType) typeBobinageId = newType.id;
    }

    const payload = {
      categorie,
      photo_url: form.photo_url || null,
      // Moteur / Alternateur
      puissance_kw: form.puissance_kw ? parseFloat(form.puissance_kw) : null,
      tension_v: form.tension_v ? parseInt(form.tension_v) : null,
      courant_nominal_a: form.courant_nominal_a ? parseFloat(form.courant_nominal_a) : null,
      nb_poles: form.nb_poles ? parseInt(form.nb_poles) : null,
      vitesse_tr_min: form.vitesse_tr_min ? parseInt(form.vitesse_tr_min) : null,
      frequence: form.frequence ? parseInt(form.frequence) : 50,
      technologie: form.technologie || null,
      alimentation: form.alimentation || null,
      type_connexion: form.type_connexion || null,
      type_transformateur: form.type_transformateur || null,
      marque_id: marqueId || null,
      reference_moteur: form.reference_moteur.trim() || null,
      // Frein
      frein_alimentation: form.frein_alimentation || null,
      frein_couple_nm: form.frein_couple_nm ? parseFloat(form.frein_couple_nm) : null,
      frein_type: form.frein_type || null,
      // Transformateur
      tension_primaire_v: form.tension_primaire_v ? parseInt(form.tension_primaire_v) : null,
      tension_secondaire_v: form.tension_secondaire_v ? parseInt(form.tension_secondaire_v) : null,
      courant_primaire_a: form.courant_primaire_a ? parseFloat(form.courant_primaire_a) : null,
      courant_secondaire_a: form.courant_secondaire_a ? parseFloat(form.courant_secondaire_a) : null,
      couplage: form.couplage || null,
      nb_phases: form.nb_phases ? parseInt(form.nb_phases) : null,
      refroidissement: form.refroidissement || null,
      // Alternateur
      excitation: form.excitation || null,
      // Bobinage
      type_bobinage_id: typeBobinageId || null,
      type_bobinage_libre: form.type_bobinage_libre.trim() || null,
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
    };

    const { data, error } = await supabase
      .from("schemas_bobinage")
      .insert(payload)
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

  // ============================================================
  // ETAPE 1 : Choix de la categorie
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-500" size={28} />
      </div>
    );
  }

  if (!categorie) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Nouveau schéma de bobinage</h1>
            <p className="text-sm text-slate-500">
              Étape 1 sur 2 — Choisissez le type d'équipement
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            Quel type d'équipement voulez-vous enregistrer ?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const Icon = CATEGORIE_ICONS[cat.code] || Zap;
              const colors = CATEGORIE_COLORS[cat.code] || CATEGORIE_COLORS.moteur;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategorie(cat.code)}
                  className={`${colors.bg} ${colors.border} border-2 rounded-xl p-5 text-left transition-all duration-200 ${colors.hover} group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-lg bg-white flex items-center justify-center ${colors.text}`}>
                      <Icon size={24} />
                    </div>
                    <ArrowRight
                      size={18}
                      className={`${colors.text} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition`}
                    />
                  </div>
                  <h3 className={`font-bold text-base ${colors.text} mb-1`}>
                    {cat.nom}
                  </h3>
                  <p className="text-xs text-slate-600 leading-snug">
                    {cat.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ETAPE 2 : Formulaire adaptatif
  // ============================================================
  const catInfo = categories.find((c) => c.code === categorie);
  const CatIcon = CATEGORIE_ICONS[categorie] || Zap;
  const catColors = CATEGORIE_COLORS[categorie] || CATEGORIE_COLORS.moteur;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCategorie(null)}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
          title="Changer de catégorie"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CatIcon size={20} className={catColors.text} />
            Nouveau — {catInfo?.nom}
          </h1>
          <p className="text-sm text-slate-500">
            Étape 2 sur 2 — Remplissez les informations
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

      {/* CARACTERISTIQUES selon categorie */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-sm uppercase tracking-wider text-slate-700 font-bold mb-4 flex items-center gap-2">
          <CatIcon size={14} /> Caractéristiques {catInfo?.nom.toLowerCase()}
        </h2>

        {/* MOTEUR */}
        {categorie === "moteur" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Puissance (kW)" type="number" value={form.puissance_kw} onChange={(v) => update("puissance_kw", v)} placeholder="Ex: 5.5" />
            <Field label="Tension (V)" type="number" value={form.tension_v} onChange={(v) => update("tension_v", v)} placeholder="Ex: 380" />
            <Field label="Courant nominal (A)" type="number" step="0.01" value={form.courant_nominal_a} onChange={(v) => update("courant_nominal_a", v)} placeholder="Ex: 10.5" />
            <Field label="Nombre de pôles" type="number" value={form.nb_poles} onChange={(v) => update("nb_poles", v)} placeholder="Ex: 4" />
            <Field label="Vitesse (tr/min)" type="number" value={form.vitesse_tr_min} onChange={(v) => update("vitesse_tr_min", v)} placeholder="Ex: 1450" />
            <SelectField label="Fréquence (Hz)" value={form.frequence} onChange={(v) => update("frequence", v)} options={["50", "60"]} />
            <SelectField label="Technologie" value={form.technologie} onChange={(v) => update("technologie", v)} options={technologies.map(t => t.nom)} placeholder="— Sélectionner —" />
            <SelectField label="Alimentation" value={form.alimentation} onChange={(v) => update("alimentation", v)} options={alimentations.map(a => a.nom)} placeholder="— Sélectionner —" />
            <SelectField label="Type de connexion" value={form.type_connexion} onChange={(v) => update("type_connexion", v)} options={typesConnexion.map(t => t.nom)} placeholder="— Sélectionner —" />
            <SelectField label="Type de transformateur" value={form.type_transformateur} onChange={(v) => update("type_transformateur", v)} options={couplages.map(c => c.code)} placeholder="— Aucun —" />
            <MarqueField
              marques={marques}
              value={form.marque_id}
              marqueLibre={marqueLibre}
              showLibre={showMarqueLibre}
              onChange={(v) => update("marque_id", v)}
              onMarqueLibreChange={setMarqueLibre}
              onShowLibre={setShowMarqueLibre}
            />
            <Field label="N° de série moteur" value={form.reference_moteur} onChange={(v) => update("reference_moteur", v)} placeholder="Ex: LS 132 M" />
          </div>
        )}

        {/* FREIN */}
        {categorie === "frein" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectField label="Alimentation" value={form.frein_alimentation} onChange={(v) => update("frein_alimentation", v)} options={["AC", "DC"]} placeholder="— Sélectionner —" />
            <Field label="Tension (V)" type="number" value={form.tension_v} onChange={(v) => update("tension_v", v)} placeholder="Ex: 380" />
            <Field label="Courant nominal (A)" type="number" step="0.01" value={form.courant_nominal_a} onChange={(v) => update("courant_nominal_a", v)} placeholder="Ex: 2.5" />
            <Field label="Couple de freinage (Nm)" type="number" step="0.01" value={form.frein_couple_nm} onChange={(v) => update("frein_couple_nm", v)} placeholder="Ex: 40" />
            <SelectField
              label="Type de frein"
              value={form.frein_type}
              onChange={(v) => update("frein_type", v)}
              options={["À manque de courant", "À application de courant"]}
              placeholder="— Sélectionner —"
            />
            <Field label="Puissance (kW)" type="number" step="0.01" value={form.puissance_kw} onChange={(v) => update("puissance_kw", v)} placeholder="Ex: 0.5" />
            <MarqueField
              marques={marques}
              value={form.marque_id}
              marqueLibre={marqueLibre}
              showLibre={showMarqueLibre}
              onChange={(v) => update("marque_id", v)}
              onMarqueLibreChange={setMarqueLibre}
              onShowLibre={setShowMarqueLibre}
            />
            <Field label="N° de série" value={form.reference_moteur} onChange={(v) => update("reference_moteur", v)} placeholder="Ex: FREIN-001" />
          </div>
        )}

        {/* TRANSFORMATEUR */}
        {categorie === "transformateur" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Puissance (kVA)" type="number" step="0.1" value={form.puissance_kw} onChange={(v) => update("puissance_kw", v)} placeholder="Ex: 100" />
            <Field label="Tension primaire (V)" type="number" value={form.tension_primaire_v} onChange={(v) => update("tension_primaire_v", v)} placeholder="Ex: 20000" />
            <Field label="Tension secondaire (V)" type="number" value={form.tension_secondaire_v} onChange={(v) => update("tension_secondaire_v", v)} placeholder="Ex: 400" />
            <Field label="Courant primaire (A)" type="number" step="0.01" value={form.courant_primaire_a} onChange={(v) => update("courant_primaire_a", v)} placeholder="Ex: 5" />
            <Field label="Courant secondaire (A)" type="number" step="0.01" value={form.courant_secondaire_a} onChange={(v) => update("courant_secondaire_a", v)} placeholder="Ex: 250" />
            <SelectField
              label="Couplage"
              value={form.couplage}
              onChange={(v) => update("couplage", v)}
              options={couplages.map(c => c.code)}
              placeholder="— Sélectionner —"
            />
            <SelectField
              label="Nombre de phases"
              value={form.nb_phases}
              onChange={(v) => update("nb_phases", v)}
              options={["1", "3"]}
              labels={["Monophasé", "Triphasé"]}
              placeholder="— Sélectionner —"
            />
            <SelectField
              label="Refroidissement"
              value={form.refroidissement}
              onChange={(v) => update("refroidissement", v)}
              options={["AN", "AF", "ONAN", "ONAF", "OFAF", "Autre"]}
              placeholder="— Sélectionner —"
            />
            <Field label="Fréquence (Hz)" type="number" value={form.frequence} onChange={(v) => update("frequence", v)} placeholder="Ex: 50" />
            <MarqueField
              marques={marques}
              value={form.marque_id}
              marqueLibre={marqueLibre}
              showLibre={showMarqueLibre}
              onChange={(v) => update("marque_id", v)}
              onMarqueLibreChange={setMarqueLibre}
              onShowLibre={setShowMarqueLibre}
            />
            <Field label="N° de série" value={form.reference_moteur} onChange={(v) => update("reference_moteur", v)} placeholder="Ex: TR-2025-001" />
          </div>
        )}

        {/* ALTERNATEUR */}
        {categorie === "alternateur" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Puissance (kVA)" type="number" step="0.1" value={form.puissance_kw} onChange={(v) => update("puissance_kw", v)} placeholder="Ex: 50" />
            <Field label="Tension (V)" type="number" value={form.tension_v} onChange={(v) => update("tension_v", v)} placeholder="Ex: 400" />
            <Field label="Courant (A)" type="number" step="0.01" value={form.courant_nominal_a} onChange={(v) => update("courant_nominal_a", v)} placeholder="Ex: 72" />
            <Field label="Nombre de pôles" type="number" value={form.nb_poles} onChange={(v) => update("nb_poles", v)} placeholder="Ex: 4" />
            <Field label="Vitesse (tr/min)" type="number" value={form.vitesse_tr_min} onChange={(v) => update("vitesse_tr_min", v)} placeholder="Ex: 1500" />
            <SelectField label="Fréquence (Hz)" value={form.frequence} onChange={(v) => update("frequence", v)} options={["50", "60"]} />
            <SelectField label="Alimentation" value={form.alimentation} onChange={(v) => update("alimentation", v)} options={alimentations.map(a => a.nom)} placeholder="— Sélectionner —" />
            <SelectField label="Type de connexion" value={form.type_connexion} onChange={(v) => update("type_connexion", v)} options={typesConnexion.map(t => t.nom)} placeholder="— Sélectionner —" />
            <SelectField
              label="Excitation"
              value={form.excitation}
              onChange={(v) => update("excitation", v)}
              options={["Auto-excité", "À excitation séparée", "Sans balais", "Autre"]}
              placeholder="— Sélectionner —"
            />
            <MarqueField
              marques={marques}
              value={form.marque_id}
              marqueLibre={marqueLibre}
              showLibre={showMarqueLibre}
              onChange={(v) => update("marque_id", v)}
              onMarqueLibreChange={setMarqueLibre}
              onShowLibre={setShowMarqueLibre}
            />
            <Field label="N° de série" value={form.reference_moteur} onChange={(v) => update("reference_moteur", v)} placeholder="Ex: ALT-001" />
          </div>
        )}
      </div>

      {/* BOBINAGE (commun) */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-sm uppercase tracking-wider text-slate-700 font-bold mb-4 flex items-center gap-2">
          <Cog size={14} /> Caractéristiques du bobinage
        </h2>
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
                {typesBobinage.map((t) => (
                  <option key={t.id} value={t.id}>{t.nom}</option>
                ))}
                <option value="__autre__">+ Autre (saisir)</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.type_bobinage_libre}
                  onChange={(e) => update("type_bobinage_libre", e.target.value)}
                  placeholder="Saisir le type..."
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowTypeBobinageLibre(false);
                    setForm((f) => ({ ...f, type_bobinage_libre: "" }));
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
          <Field label="Nombre d'encoches" type="number" value={form.nb_encoches} onChange={(v) => update("nb_encoches", v)} placeholder="Ex: 36" />
          <Field label="Pas" value={form.pas} onChange={(v) => update("pas", v)} placeholder="Ex: 1-9" />
          <Field label="Pas bobine" value={form.pas_bobine} onChange={(v) => update("pas_bobine", v)} placeholder="Ex: 1-10" />
          <Field label="Nombre de spires" type="number" value={form.nb_spires} onChange={(v) => update("nb_spires", v)} placeholder="Ex: 45" />
          <Field label="Diamètre du fil (mm)" type="number" step="0.01" value={form.diametre_fil_mm} onChange={(v) => update("diametre_fil_mm", v)} placeholder="Ex: 1.25" />
          <Field label="Fils en parallèle" type="number" value={form.nb_fils_parallele} onChange={(v) => update("nb_fils_parallele", v)} placeholder="Ex: 2" />
          <Field label="Section totale (mm²)" type="number" step="0.01" value={form.section_totale_mm2} onChange={(v) => update("section_totale_mm2", v)} placeholder="Ex: 2.45" />
          <Field label="Groupes par phase" type="number" value={form.groupes_par_phase} onChange={(v) => update("groupes_par_phase", v)} placeholder="Ex: 3" />
          <SelectField
            label="Connexion (bobinage)"
            value={form.connexion}
            onChange={(v) => update("connexion", v)}
            options={["etoile", "triangle", "etoile-triangle"]}
            labels={["Étoile (Y)", "Triangle (Δ)", "Étoile-Triangle"]}
            placeholder="— Sélectionner —"
          />
          <Field label="Nombre de voies" type="number" value={form.nb_voies} onChange={(v) => update("nb_voies", v)} placeholder="Ex: 1" />
        </div>
      </div>

      {/* NOTES */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-sm uppercase tracking-wider text-slate-700 font-bold mb-3 flex items-center gap-2">
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
          onClick={() => setCategorie(null)}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          Retour
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

// ============================================================
// COMPOSANTS HELPERS
// ============================================================

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
      <label className="text-sm font-bold text-slate-900 block mb-1.5">{label}</label>
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
          <option key={opt} value={opt}>
            {labels ? labels[i] : opt}
          </option>
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
          {marques.map((m) => (
            <option key={m.id} value={m.id}>{m.nom}</option>
          ))}
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
            onClick={() => {
              onShowLibre(false);
              onMarqueLibreChange("");
            }}
            className="text-xs text-slate-500 hover:text-slate-700 px-2"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}