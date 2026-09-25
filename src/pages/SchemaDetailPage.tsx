import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft, Loader2, Trash2, Edit3, Zap, Cog,
  Wrench, FileDown, CircleDot, Layers
} from "lucide-react";
import type { SchemaComplet } from "../lib/types";
import { formatDate } from "../lib/utils";
import { downloadSchemaPdf } from "../lib/pdfExport";

const CATEGORIE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  moteur: { label: "Moteur électrique", icon: Zap, color: "bg-amber-100 text-amber-800" },
  frein: { label: "Électro-frein", icon: CircleDot, color: "bg-rose-100 text-rose-800" },
  transformateur: { label: "Transformateur", icon: Layers, color: "bg-violet-100 text-violet-800" },
  alternateur: { label: "Alternateur", icon: Zap, color: "bg-emerald-100 text-emerald-800" },
};

export default function SchemaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [schema, setSchema] = useState<SchemaComplet | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("schemas_bobinage")
        .select("*, marque:marques(*), type_bobinage:types_bobinage(*)")
        .eq("id", id)
        .single();
      setSchema(data as unknown as SchemaComplet);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!schema) return;
    setDeleting(true);
    await supabase
      .from("schemas_bobinage")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", schema.id);
    setDeleting(false);
    navigate("/base");
  };

  const handleDownloadPdf = async () => {
    if (!schema) return;
    setDownloading(true);
    try {
      await downloadSchemaPdf(schema);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-500" size={28} />
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm text-center">
        <p className="text-sm font-medium text-slate-500">Schéma introuvable.</p>
        <Link to="/base" className="text-xs text-amber-600 hover:underline mt-2 inline-block">
          Retour à la base
        </Link>
      </div>
    );
  }

  const catConfig = schema.categorie ? CATEGORIE_CONFIG[schema.categorie] : null;
  const CatIcon = catConfig?.icon;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Retour"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {schema.code_schema || "Schéma"}
              </h1>
              {catConfig && CatIcon && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${catConfig.color}`}>
                  <CatIcon size={10} /> {catConfig.label}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              Créé le {formatDate(schema.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-500 rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Génération...
              </>
            ) : (
              <>
                <FileDown size={14} /> Télécharger PDF
              </>
            )}
          </button>
          <button
            onClick={() => navigate(`/nouveau?edit=${schema.id}`)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition"
          >
            <Edit3 size={14} /> Modifier
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition disabled:opacity-50"
              >
                {deleting ? "..." : "Confirmer"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-slate-500 hover:text-slate-700 text-sm"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 text-sm font-medium transition"
            >
              <Trash2 size={14} /> Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Photo */}
      {schema.photo_url && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <img
            src={schema.photo_url}
            alt={schema.code_schema || "Schéma"}
            className="w-full max-h-[600px] object-contain rounded-lg"
          />
        </div>
      )}

      {/* Caractéristiques selon catégorie */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-sm uppercase tracking-wider text-slate-700 font-bold mb-4 flex items-center gap-2">
          <Zap size={14} /> Caractéristiques {catConfig?.label.toLowerCase()}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* MOTEUR */}
          {schema.categorie === "moteur" && (
            <>
              <InfoField label="Puissance" value={schema.puissance_kw !== null ? `${schema.puissance_kw} kW` : null} />
              <InfoField label="Tension" value={schema.tension_v !== null ? `${schema.tension_v} V` : null} />
              <InfoField label="Courant nominal" value={schema.courant_nominal_a !== null ? `${schema.courant_nominal_a} A` : null} />
              <InfoField label="Nombre de pôles" value={schema.nb_poles !== null ? `${schema.nb_poles}` : null} />
              <InfoField label="Vitesse" value={schema.vitesse_tr_min !== null ? `${schema.vitesse_tr_min} tr/min` : null} />
              <InfoField label="Fréquence" value={schema.frequence !== null ? `${schema.frequence} Hz` : null} />
              <InfoField label="Technologie" value={schema.technologie} />
              <InfoField label="Alimentation" value={schema.alimentation} />
              <InfoField label="Type de connexion" value={schema.type_connexion} />
              <InfoField label="Type de transformateur" value={schema.type_transformateur} />
              <InfoField label="Marque" value={schema.marque?.nom} />
              <InfoField label="N° de série" value={schema.reference_moteur} />
            </>
          )}

          {/* FREIN */}
          {schema.categorie === "frein" && (
            <>
              <InfoField label="Alimentation" value={schema.frein_alimentation} />
              <InfoField label="Tension" value={schema.tension_v !== null ? `${schema.tension_v} V` : null} />
              <InfoField label="Courant nominal" value={schema.courant_nominal_a !== null ? `${schema.courant_nominal_a} A` : null} />
              <InfoField label="Couple de freinage" value={schema.frein_couple_nm !== null ? `${schema.frein_couple_nm} Nm` : null} />
              <InfoField label="Type de frein" value={schema.frein_type} />
              <InfoField label="Puissance" value={schema.puissance_kw !== null ? `${schema.puissance_kw} kW` : null} />
              <InfoField label="Marque" value={schema.marque?.nom} />
              <InfoField label="N° de série" value={schema.reference_moteur} />
            </>
          )}

          {/* TRANSFORMATEUR */}
          {schema.categorie === "transformateur" && (
            <>
              <InfoField label="Puissance" value={schema.puissance_kw !== null ? `${schema.puissance_kw} kVA` : null} />
              <InfoField label="Tension primaire" value={schema.tension_primaire_v !== null ? `${schema.tension_primaire_v} V` : null} />
              <InfoField label="Tension secondaire" value={schema.tension_secondaire_v !== null ? `${schema.tension_secondaire_v} V` : null} />
              <InfoField label="Courant primaire" value={schema.courant_primaire_a !== null ? `${schema.courant_primaire_a} A` : null} />
              <InfoField label="Courant secondaire" value={schema.courant_secondaire_a !== null ? `${schema.courant_secondaire_a} A` : null} />
              <InfoField label="Couplage" value={schema.couplage} />
              <InfoField label="Nombre de phases" value={schema.nb_phases !== null ? (schema.nb_phases === 1 ? "Monophasé" : "Triphasé") : null} />
              <InfoField label="Refroidissement" value={schema.refroidissement} />
              <InfoField label="Fréquence" value={schema.frequence !== null ? `${schema.frequence} Hz` : null} />
              <InfoField label="Marque" value={schema.marque?.nom} />
              <InfoField label="N° de série" value={schema.reference_moteur} />
            </>
          )}

          {/* ALTERNATEUR */}
          {schema.categorie === "alternateur" && (
            <>
              <InfoField label="Puissance" value={schema.puissance_kw !== null ? `${schema.puissance_kw} kVA` : null} />
              <InfoField label="Tension" value={schema.tension_v !== null ? `${schema.tension_v} V` : null} />
              <InfoField label="Courant" value={schema.courant_nominal_a !== null ? `${schema.courant_nominal_a} A` : null} />
              <InfoField label="Nombre de pôles" value={schema.nb_poles !== null ? `${schema.nb_poles}` : null} />
              <InfoField label="Vitesse" value={schema.vitesse_tr_min !== null ? `${schema.vitesse_tr_min} tr/min` : null} />
              <InfoField label="Fréquence" value={schema.frequence !== null ? `${schema.frequence} Hz` : null} />
              <InfoField label="Alimentation" value={schema.alimentation} />
              <InfoField label="Type de connexion" value={schema.type_connexion} />
              <InfoField label="Excitation" value={schema.excitation} />
              <InfoField label="Marque" value={schema.marque?.nom} />
              <InfoField label="N° de série" value={schema.reference_moteur} />
            </>
          )}
        </div>
      </div>

      {/* Bobinage (commun) */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-sm uppercase tracking-wider text-slate-700 font-bold mb-4 flex items-center gap-2">
          <Cog size={14} /> Caractéristiques du bobinage
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoField label="Type de bobinage" value={schema.type_bobinage?.nom || schema.type_bobinage_libre} />
          <InfoField label="Nombre d'encoches" value={schema.nb_encoches !== null ? `${schema.nb_encoches}` : null} />
          <InfoField label="Pas" value={schema.pas} />
          <InfoField label="Pas bobine" value={schema.pas_bobine} />
          <InfoField label="Nombre de spires" value={schema.nb_spires !== null ? `${schema.nb_spires}` : null} />
          <InfoField label="Diamètre du fil" value={schema.diametre_fil_mm !== null ? `${schema.diametre_fil_mm} mm` : null} />
          <InfoField label="Fils en parallèle" value={schema.nb_fils_parallele !== null ? `${schema.nb_fils_parallele}` : null} />
          <InfoField label="Section totale" value={schema.section_totale_mm2 !== null ? `${schema.section_totale_mm2} mm²` : null} />
          <InfoField label="Groupes par phase" value={schema.groupes_par_phase !== null ? `${schema.groupes_par_phase}` : null} />
          <InfoField
            label="Connexion"
            value={
              schema.connexion === "etoile"
                ? "Étoile (Y)"
                : schema.connexion === "triangle"
                ? "Triangle (Δ)"
                : schema.connexion === "etoile-triangle"
                ? "Étoile-Triangle"
                : schema.connexion
            }
          />
          <InfoField label="Nombre de voies" value={schema.nb_voies !== null ? `${schema.nb_voies}` : null} />
        </div>
      </div>

      {/* Notes */}
      {schema.notes && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm uppercase tracking-wider text-slate-700 font-bold mb-3 flex items-center gap-2">
            <Wrench size={14} /> Notes
          </h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{schema.notes}</p>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900">{value || "—"}</p>
    </div>
  );
}