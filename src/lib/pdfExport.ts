import jsPDF from "jspdf";
import type { SchemaComplet } from "./types";
import logoFaratec from "../assets/logo-faratec.png";

const COLORS = {
  dark: [23, 23, 23] as [number, number, number],
  primary: [245, 158, 11] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  darkRed: [192, 0, 0] as [number, number, number],
  borderRed: [200, 50, 50] as [number, number, number],
  lightRose: [254, 242, 242] as [number, number, number],
  lightGreen: [240, 253, 244] as [number, number, number],
};

function sanitize(text: string): string {
  return String(text)
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/·/g, "-")
    .replace(/…/g, "...")
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function loadLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch(logoFaratec);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function urlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function getImageFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  if (dataUrl.includes("image/png")) return "PNG";
  if (dataUrl.includes("image/jpeg") || dataUrl.includes("image/jpg")) return "JPEG";
  return "PNG";
}

const v = (val: any, suffix = ""): string => {
  if (val === null || val === undefined || val === "") return "";
  return sanitize(String(val)) + suffix;
};

export async function buildSchemaPdf(schema: SchemaComplet): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const logoBase64 = await loadLogoBase64();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // ============================================================
  // EN-TETE (logo + FARATEC + date + N°)
  // ============================================================
  const headerH = 18;

  // Logo gauche
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, getImageFormat(logoBase64), margin, y, 14, 14);
    } catch (e) {}
  }

  // FARATEC
  doc.setTextColor(...COLORS.darkRed);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("FARATEC", margin + 18, y + 9);

  // Date (droite)
  const dateStr = schema.date_fiche
    ? new Date(schema.date_fiche).toLocaleDateString("fr-FR")
    : new Date().toLocaleDateString("fr-FR");

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.dark);
  doc.text(sanitize(dateStr), pageWidth - margin - 40, y + 4);

  // N° Faratec (encadre)
  doc.setDrawColor(...COLORS.borderRed);
  doc.setLineWidth(0.5);
  doc.rect(pageWidth - margin - 40, y + 7, 40, 8);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`N° ${sanitize(schema.code_schema || "—")}`, pageWidth - margin - 38, y + 12);

  y += headerH;

  // Ligne rouge sous l'en-tete
  doc.setDrawColor(...COLORS.borderRed);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3;

  // ============================================================
  // SECTION CLIENT + MOTEUR
  // ============================================================
  const clientH = 20;

  // Cadre
  doc.setDrawColor(...COLORS.borderRed);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, clientH);

  // Ligne CLIENT
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.darkRed);
  doc.text("CLIENT", margin + 2, y + 5);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.dark);
  doc.text(sanitize(schema.client_name || ""), margin + 22, y + 5);

  // Ligne Marque / N° / Type
  doc.setDrawColor(...COLORS.borderRed);
  doc.setLineWidth(0.2);
  doc.line(margin, y + 7, pageWidth - margin, y + 7);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.darkRed);
  doc.text("Marque", margin + 2, y + 11);
  doc.text("N°", margin + 55, y + 11);
  doc.text("Type", margin + 100, y + 11);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.dark);
  doc.text(sanitize(schema.marque?.nom || ""), margin + 22, y + 11);
  doc.text(sanitize(schema.num_serie || ""), margin + 62, y + 11);
  doc.text(sanitize(schema.type_moteur || ""), margin + 110, y + 11);

  // Ligne Puissance / Vitesse / Courant / Cos φ / Rotor
  doc.setDrawColor(...COLORS.borderRed);
  doc.line(margin, y + 13, pageWidth - margin, y + 13);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(`P: ${v(schema.puissance_kw, " kW")}`, margin + 2, y + 18);
  doc.text(`V: ${v(schema.vitesse_tr_min, " t/min")}`, margin + 45, y + 18);
  doc.text(`A: ${v(schema.courant_nominal_a, " A")}`, margin + 85, y + 18);
  doc.text(`Cos φ: ${v(schema.cos_phi)}`, margin + 120, y + 18);
  doc.text(`Rotor: ${v(schema.rotor)}`, margin + 150, y + 18);

  y += clientH + 2;

  // ============================================================
  // CIRCUIT MAGNETIQUE (2 colonnes)
  // ============================================================
  const cmH = 60;
  const colGaucheW = contentWidth * 0.55;

  doc.setDrawColor(...COLORS.borderRed);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, cmH);
  doc.line(margin + colGaucheW, y, margin + colGaucheW, y + cmH);

  // Titre
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.darkRed);
  doc.text("CIRCUIT MAGNETIQUE", margin + 2, y + 5);

  // Colonne gauche
  const labelX = margin + 2;
  const valueX = margin + colGaucheW - 40;
  const lineH = 6;
  let cmY = y + 11;

  const drawLine = (label: string, value: string) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.dark);
    doc.text(sanitize(label), labelX, cmY);
    doc.setFont("helvetica", "bold");
    doc.text(sanitize(value), valueX, cmY);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.1);
    doc.line(labelX, cmY + 0.5, margin + colGaucheW - 2, cmY + 0.5);
    cmY += lineH;
  };

  drawLine("Alésage", v(schema.alesage));
  drawLine("Longueur", v(schema.longueur));
  drawLine("N.encoches", v(schema.nb_encoches));
  drawLine("H.COURONNE", v(schema.h_couronne));
  drawLine("H.dent", v(schema.h_dent));
  drawLine("Largeur dent", v(schema.largeur_dent));
  drawLine("Encoche pleine/vide", v(schema.encoche_pleine_vide));
  drawLine("Origine", v(schema.origine));

  // Colonne droite
  const labelX2 = margin + colGaucheW + 2;
  const valueX2 = pageWidth - margin - 3;
  let cmY2 = y + 11;

  const drawLine2 = (label: string, value: string) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.dark);
    doc.text(sanitize(label), labelX2, cmY2);
    doc.setFont("helvetica", "bold");
    doc.text(sanitize(value), valueX2, cmY2, { align: "right" });
    cmY2 += lineH;
  };

  drawLine2("Fréquence", v(schema.frequence, " Hz"));
  drawLine2("Sonde", v(schema.sonde));
  drawLine2("Soudure anti", v(schema.soudure_anti));
  drawLine2("Résistance anti condensat", v(schema.resistance_anti_condensat));
  drawLine2("Palier", v(schema.palier));
  drawLine2("Roulement", v(schema.roulement));

  y += cmH + 2;

  // ============================================================
  // BOBINAGE ANCIEN / NOUVEAU
  // ============================================================
  const bobH = 70;
  const colAncienX = margin + 30;
  const colNouveauX = margin + 100;
  const colOptionX = margin + 165;

  doc.setDrawColor(...COLORS.borderRed);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, bobH);

  // Entetes
  doc.setFillColor(...COLORS.lightRose);
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setFillColor(...COLORS.lightGreen);
  doc.rect(margin + 30, y, 70, 6, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("Origine", margin + 2, y + 4);
  doc.text("Ancien", colAncienX + 25, y + 4, { align: "center" });
  doc.text("Nouveau", colNouveauX + 25, y + 4, { align: "center" });
  doc.text("Sens Rotation", colOptionX + 2, y + 3);
  doc.text("Ventilation", colOptionX + 2, y + 6);

  // Lignes
  const lignes = [
    { label: "Pôle", ancien: schema.ancien_pole || schema.pole, nouveau: schema.nouveau_pole || schema.pole },
    { label: "Pas", ancien: schema.ancien_pas || schema.pas, nouveau: schema.nouveau_pas || schema.pas },
    { label: "N.Spires", ancien: schema.ancien_nb_spires || schema.nb_spires, nouveau: schema.nouveau_nb_spires || schema.nb_spires },
    { label: "Gr II", ancien: schema.ancien_gr_ii || schema.gr_ii, nouveau: schema.nouveau_gr_ii || schema.gr_ii },
    { label: "Fils II", ancien: schema.ancien_fils_ii || schema.fils_ii, nouveau: schema.nouveau_fils_ii || schema.fils_ii },
    { label: "Fil/encoches", ancien: schema.ancien_fil_encoches || schema.fil_encoches, nouveau: schema.nouveau_fil_encoches || schema.fil_encoches },
    { label: "Fils nu", ancien: schema.ancien_fils_nu || schema.fils_nu, nouveau: schema.nouveau_fils_nu || schema.fils_nu },
    { label: "Débordement", ancien: schema.ancien_debordement || schema.debordement, nouveau: schema.nouveau_debordement || schema.debordement },
    { label: "Câble sortie", ancien: schema.ancien_cable_sortie || schema.cable_sortie, nouveau: schema.nouveau_cable_sortie || schema.cable_sortie },
  ];

  let bobY = y + 10;
  lignes.forEach((l) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.dark);
    doc.text(sanitize(l.label), margin + 2, bobY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 30, 30);
    doc.text(sanitize(v(l.ancien)), colAncienX + 25, bobY, { align: "center" });

    doc.setTextColor(20, 120, 60);
    doc.text(sanitize(v(l.nouveau)), colNouveauX + 25, bobY, { align: "center" });

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.1);
    doc.line(margin + 2, bobY + 1, pageWidth - margin - 2, bobY + 1);

    bobY += 6;
  });

  // Cases sens / ventilation
  const checkboxSize = 3;
  const checkY1 = y + 12;
  const checkY2 = y + 20;

  doc.setDrawColor(...COLORS.dark);
  doc.setLineWidth(0.3);
  doc.rect(colOptionX + 25, checkY1, checkboxSize, checkboxSize);
  doc.rect(colOptionX + 25, checkY2, checkboxSize, checkboxSize);

  if (schema.sens_rotation) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 120, 60);
    doc.text("X", colOptionX + 25.7, checkY1 + 2.5);
  }
  if (schema.ventilation) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 120, 60);
    doc.text("X", colOptionX + 25.7, checkY2 + 2.5);
  }

  y += bobH + 2;

  // ============================================================
  // TEMPS
  // ============================================================
  const tempsH = 30;

  doc.setDrawColor(...COLORS.borderRed);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, tempsH);

  // Entete
  doc.setFillColor(...COLORS.lightGray);
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.darkRed);
  doc.text("TEMPS", margin + 2, y + 4);
  doc.text("TA", margin + 70, y + 4, { align: "center" });
  doc.text("TP", margin + 95, y + 4, { align: "center" });
  doc.text("NOM", margin + 120, y + 4);

  const tempsLignes = [
    { label: "Relevé", ta: schema.temps_releve_ta, tp: schema.temps_releve_tp },
    { label: "Enro", ta: schema.temps_enro_ta, tp: schema.temps_enro_tp },
    { label: "Bobinage", ta: schema.temps_bobinage_ta, tp: schema.temps_bobinage_tp },
  ];

  let tempY = y + 11;
  tempsLignes.forEach((t) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.dark);
    doc.text(sanitize(t.label), margin + 2, tempY);

    doc.setFont("helvetica", "bold");
    doc.text(v(t.ta), margin + 70, tempY, { align: "center" });
    doc.text(v(t.tp), margin + 95, tempY, { align: "center" });

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.1);
    doc.line(margin + 2, tempY + 1, pageWidth - margin - 2, tempY + 1);
    tempY += 6;
  });

  // Nom intervenant
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.darkRed);
  doc.text(sanitize(schema.nom_intervenant || ""), margin + 120, y + 20);

  y += tempsH + 3;

  // ============================================================
  // PHOTOS (2) - alignees verticalement, grandes
  // ============================================================
  if (y > pageHeight - 20) {
    doc.addPage();
    y = margin + 5;
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.darkRed);
  doc.text("PHOTOS DU DOSSIER", margin, y);
  y += 4;

  const photoW = contentWidth;
  const photoH = 120;

  // PHOTO 1 : SCHEMA
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("Photo 1 : Schema de bobinage", margin, y + 3);
  y += 5;

  doc.setDrawColor(...COLORS.borderRed);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, photoW, photoH);

  if (schema.photo_url) {
    const imgBase64 = await urlToBase64(schema.photo_url);
    if (imgBase64) {
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = imgBase64;
        });
        const ratio = img.width / img.height;
        let iw = photoW - 2;
        let ih = iw / ratio;
        if (ih > photoH - 2) {
          ih = photoH - 2;
          iw = ih * ratio;
        }
        const ix = margin + 1 + (photoW - 2 - iw) / 2;
        const iy = y + 1 + (photoH - 2 - ih) / 2;
        doc.addImage(imgBase64, getImageFormat(imgBase64), ix, iy, iw, ih);
      } catch (e) {}
    }
  }

  y += photoH + 8;

  // Nouvelle page si necessaire
  if (y > pageHeight - 130) {
    doc.addPage();
    y = margin + 5;
  }

  // PHOTO 2 : FICHE
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("Photo 2 : Fiche remplie", margin, y + 3);
  y += 5;

  doc.setDrawColor(...COLORS.borderRed);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, photoW, photoH);

  if (schema.photo_2_url) {
    const imgBase64 = await urlToBase64(schema.photo_2_url);
    if (imgBase64) {
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = imgBase64;
        });
        const ratio = img.width / img.height;
        let iw = photoW - 2;
        let ih = iw / ratio;
        if (ih > photoH - 2) {
          ih = photoH - 2;
          iw = ih * ratio;
        }
        const ix = margin + 1 + (photoW - 2 - iw) / 2;
        const iy = y + 1 + (photoH - 2 - ih) / 2;
        doc.addImage(imgBase64, getImageFormat(imgBase64), ix, iy, iw, ih);
      } catch (e) {}
    }
  }

  y += photoH + 8;

  // ============================================================
  // NOTES (si presentes)
  // ============================================================
  if (schema.notes && schema.notes.trim()) {
    y += photoH + 8;
    if (y > pageHeight - 20) {
      doc.addPage();
      y = margin + 5;
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.darkRed);
    doc.text("NOTES", margin, y);
    y += 4;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.dark);
    const splitNotes = doc.splitTextToSize(sanitize(schema.notes), contentWidth);
    doc.text(splitNotes, margin, y);
  }

  // ============================================================
  // PIED DE PAGE
  // ============================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.gray);
    doc.text("FARATEC - Fiche technique de bobinage", margin, pageHeight - 4);
    doc.text(`Page ${i} / ${totalPages}`, pageWidth - margin, pageHeight - 4, { align: "right" });
  }

  return doc;
}

export async function downloadSchemaPdf(schema: SchemaComplet): Promise<void> {
  const doc = await buildSchemaPdf(schema);
  const filename = `FARATEC_${(schema.code_schema || "fiche").replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}