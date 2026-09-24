// ============================================================
// TYPES PARTAGES
// ============================================================

export interface TypeBobinage {
  id: string;
  nom: string;
  description: string | null;
  created_at: string;
}

export interface Marque {
  id: string;
  nom: string;
  created_at: string;
}

export interface SchemaBobinage {
  id: string;
  code_schema: string | null;
  photo_url: string | null;

  puissance_kw: number | null;
  tension_v: number | null;
  nb_poles: number | null;
  vitesse_tr_min: number | null;
  frequence: number | null;
  type_moteur: string | null;
  marque_id: string | null;
  reference_moteur: string | null;

  type_bobinage_id: string | null;
  nb_encoches: number | null;
  pas: string | null;
  nb_spires: number | null;
  diametre_fil_mm: number | null;
  nb_fils_parallele: number | null;
  section_totale_mm2: number | null;
  groupes_par_phase: number | null;
  connexion: string | null;
  nb_voies: number | null;
  pas_bobine: string | null;

  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SchemaComplet extends SchemaBobinage {
  marque?: Marque | null;
  type_bobinage?: TypeBobinage | null;
}