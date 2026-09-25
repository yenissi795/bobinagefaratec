import { supabase } from "./supabase";
import type {
  Categorie, TypeBobinage, Marque,
  Technologie, Alimentation, TypeConnexion, CouplageTransformateur
} from "./types";

export async function loadCategories(): Promise<Categorie[]> {
  const { data } = await supabase
    .from("categories_equipement")
    .select("*")
    .order("ordre");
  return (data as Categorie[]) || [];
}

export async function loadTypesBobinage(): Promise<TypeBobinage[]> {
  const { data } = await supabase.from("types_bobinage").select("*").order("nom");
  return (data as TypeBobinage[]) || [];
}

export async function loadMarques(): Promise<Marque[]> {
  const { data } = await supabase.from("marques").select("*").order("nom");
  return (data as Marque[]) || [];
}

export async function loadTechnologies(): Promise<Technologie[]> {
  const { data } = await supabase.from("technologies").select("*").order("nom");
  return (data as Technologie[]) || [];
}

export async function loadAlimentations(): Promise<Alimentation[]> {
  const { data } = await supabase.from("alimentations").select("*").order("nom");
  return (data as Alimentation[]) || [];
}

export async function loadTypesConnexion(): Promise<TypeConnexion[]> {
  const { data } = await supabase.from("types_connexion").select("*").order("nom");
  return (data as TypeConnexion[]) || [];
}

export async function loadCouplagesTransformateur(): Promise<CouplageTransformateur[]> {
  const { data } = await supabase.from("couplages_transformateur").select("*").order("code");
  return (data as CouplageTransformateur[]) || [];
}