// ============================================================
// TYPES PARTAGES
// ============================================================

export type CategorieEquipement = "moteur" | "frein" | "transformateur" | "alternateur";

export interface Categorie {
  id: string;
  code: CategorieEquipement;
  nom: string;
  description: string | null;
  icone: string | null;
  couleur: string | null;
  ordre: number;
  created_at: string;
}

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

export interface Technologie {
  id: string;
  nom: string;
  created_at: string;
}

export interface Alimentation {
  id: string;
  nom: string;
  created_at: string;
}

export interface TypeConnexion {
  id: string;
  nom: string;
  created_at: string;
}

export interface CouplageTransformateur {
  id: string;
  code: string;
  description: string | null;
  created_at: string;
}

export interface SchemaBobinage {
  id: string;
  code_schema: string | null;
  photo_url: string | null;
  categorie: CategorieEquipement | null;

  // Moteur / Alternateur
  puissance_kw: number | null;
  tension_v: number | null;
  courant_nominal_a: number | null;
  nb_poles: number | null;
  vitesse_tr_min: number | null;
  frequence: number | null;
  technologie: string | null;
  alimentation: string | null;
  type_connexion: string | null;
  type_transformateur: string | null;
  marque_id: string | null;
  reference_moteur: string | null;

  // Electro-frein
  frein_alimentation: string | null;
  frein_couple_nm: number | null;
  frein_type: string | null;

  // Transformateur
  tension_primaire_v: number | null;
  tension_secondaire_v: number | null;
  courant_primaire_a: number | null;
  courant_secondaire_a: number | null;
  couplage: string | null;
  nb_phases: number | null;
  refroidissement: string | null;

  // Alternateur
  excitation: string | null;

  // Bobinage (commun)
  type_bobinage_id: string | null;
  type_bobinage_libre: string | null;
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

  // Meta
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SchemaComplet extends SchemaBobinage {
  marque?: Marque | null;
  type_bobinage?: TypeBobinage | null;
}