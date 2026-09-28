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
  photo_url: string | null;              // Photo 1 : schema de bobinage
  photo_2_url: string | null;            // Photo 2 : fiche remplie
  categorie: CategorieEquipement | null;
  type_equipement_libre: string | null;  // Champ libre

  // --- EN-TETE FICHE ---
  date_fiche: string | null;
  client_name?: string | null;           // (dans equipements si lie)
  marque_id: string | null;
  num_serie: string | null;
  type_moteur: string | null;

  // --- MOTEUR ---
  puissance_kw: number | null;
  vitesse_tr_min: number | null;
  courant_nominal_a: number | null;
  cos_phi: number | null;
  rotor: string | null;

  // --- CIRCUIT MAGNETIQUE ---
  alesage: number | null;
  longueur: number | null;
  nb_encoches: number | null;
  h_couronne: number | null;
  h_dent: number | null;
  largeur_dent: number | null;
  encoche_pleine_vide: string | null;
  origine: string | null;
  frequence: number | null;
  sonde: string | null;
  soudure_anti: string | null;
  resistance_anti_condensat: string | null;
  palier: string | null;
  roulement: string | null;

  // --- BOBINAGE (commun) ---
  type_bobinage_id: string | null;
  type_bobinage_libre: string | null;
  pole: string | null;
  pas: string | null;
  nb_spires: number | null;
  gr_ii: string | null;
  fils_ii: string | null;
  fil_encoches: string | null;
  fils_nu: string | null;
  debordement: string | null;
  cable_sortie: string | null;

  // --- ANCIEN ---
  ancien_pole: string | null;
  ancien_pas: string | null;
  ancien_nb_spires: number | null;
  ancien_gr_ii: string | null;
  ancien_fils_ii: string | null;
  ancien_fil_encoches: string | null;
  ancien_fils_nu: string | null;
  ancien_debordement: string | null;
  ancien_cable_sortie: string | null;

  // --- NOUVEAU ---
  nouveau_pole: string | null;
  nouveau_pas: string | null;
  nouveau_nb_spires: number | null;
  nouveau_gr_ii: string | null;
  nouveau_fils_ii: string | null;
  nouveau_fil_encoches: string | null;
  nouveau_fils_nu: string | null;
  nouveau_debordement: string | null;
  nouveau_cable_sortie: string | null;

  // --- CONNEXION / OPTIONS ---
  tension_v: number | null;
  technologie: string | null;
  alimentation: string | null;
  type_connexion: string | null;
  type_transformateur: string | null;
  connexion: string | null;
  nb_voies: number | null;
  nb_poles: number | null;
  nb_fils_parallele: number | null;
  diametre_fil_mm: number | null;
  section_totale_mm2: number | null;
  groupes_par_phase: number | null;
  pas_bobine: string | null;

  // --- FREIN ---
  frein_alimentation: string | null;
  frein_couple_nm: number | null;
  frein_type: string | null;

  // --- TRANSFORMATEUR ---
  tension_primaire_v: number | null;
  tension_secondaire_v: number | null;
  courant_primaire_a: number | null;
  courant_secondaire_a: number | null;
  couplage: string | null;
  nb_phases: number | null;
  refroidissement: string | null;

  // --- ALTERNATEUR ---
  excitation: string | null;
  reference_moteur: string | null;

  // --- OPTIONS FICHE ---
  sens_rotation: boolean | null;
  ventilation: boolean | null;

  // --- TEMPS ---
  temps_releve_ta: number | null;
  temps_releve_tp: number | null;
  temps_enro_ta: number | null;
  temps_enro_tp: number | null;
  temps_bobinage_ta: number | null;
  temps_bobinage_tp: number | null;
  nom_intervenant: string | null;

  // --- META ---
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SchemaComplet extends SchemaBobinage {
  marque?: Marque | null;
  type_bobinage?: TypeBobinage | null;
}