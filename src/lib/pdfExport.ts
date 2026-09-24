import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SchemaComplet } from "./types";
import logoFaratec from "../assets/logo-faratec.png";

const COLORS = {
  dark: [23, 23, 23] as [number, number, number],
  primary: [245, 158, 11] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  darkRed: [192, 0, 0] as [number, number, number],
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

// Charge une image depuis une URL et la retourne en base64
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


// ============================================================
// PDF D'UN SCHEMA DE BOBINAGE
// ============================================================
export async function buildSchemaPdf(schema: SchemaComplet): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const logoBase64 = await loadLogoBase64();

  // --- EN-TETE ---
  const headerHeight = 30;
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageWidth, headerHeight, "F");
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, headerHeight, pageWidth, 1.2, "F");

  const logoSize = 20;
  const logoY = (headerHeight - logoSize) / 2;

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, getImageFormat(logoBase64), 8, logoY, logoSize, logoSize);
      doc.addImage(logoBase64, getImageFormat(logoBase64), pageWidth - 8 - logoSize, logoY, logoSize, logoSize);
    } catch (e) {
      // ignore
    }
  }

  // Titre centre
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(sanitize(schema.code_schema || "SCHEMA DE BOBINAGE"), pageWidth / 2, 14, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text("FARATEC - Base de schemas de bobinage", pageWidth / 2, 21, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Genere le ${new Date().toLocaleDateString("fr-FR")} a ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
    pageWidth / 2,
    26,
    { align: "center" }
  );

  let cursorY = 38;

  // --- PHOTO DU SCHEMA ---
  if (schema.photo_url) {
    const imgBase64 = await urlToBase64(schema.photo_url);
    if (imgBase64) {
      // Zone max pour l'image
      const maxImgWidth = pageWidth - 28;
      const maxImgHeight = 130;

      // Charger l'image pour connaitre ses dimensions reelles
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = imgBase64;
      });

      const ratio = img.width / img.height;
      let imgWidth = maxImgWidth;
      let imgHeight = imgWidth / ratio;

      if (imgHeight > maxImgHeight) {
        imgHeight = maxImgHeight;
        imgWidth = imgHeight * ratio;
      }

      const imgX = (pageWidth - imgWidth) / 2;

      // Cadre
      doc.setDrawColor(...COLORS.gray);
      doc.setLineWidth(0.3);
      doc.rect(imgX - 1, cursorY - 1, imgWidth + 2, imgHeight + 2);

      try {
        doc.addImage(imgBase64, getImageFormat(imgBase64), imgX, cursorY, imgWidth, imgHeight);
      } catch (e) {
        // ignore
      }

      cursorY += imgHeight + 10;
    }
  }

  // --- SECTION MOTEUR ---
  if (cursorY > pageHeight - 60) {
    doc.addPage();
    cursorY = 20;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.darkRed);
  doc.text("CARACTERISTIQUES DU MOTEUR", 14, cursorY);
  cursorY += 5;

  autoTable(doc, {
    startY: cursorY,
    body: [
      [
        { content: "Puissance", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: schema.puissance_kw !== null ? `${schema.puissance_kw} kW` : "—" },
        { content: "Tension", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: schema.tension_v !== null ? `${schema.tension_v} V` : "—" },
      ],
      [
        { content: "Nb poles", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: schema.nb_poles !== null ? `${schema.nb_poles}` : "—" },
        { content: "Vitesse", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: schema.vitesse_tr_min !== null ? `${schema.vitesse_tr_min} tr/min` : "—" },
      ],
      [
        { content: "Frequence", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: schema.frequence !== null ? `${schema.frequence} Hz` : "—" },
        { content: "Type", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: sanitize(schema.type_moteur || "—") },
      ],
      [
        { content: "Marque", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: sanitize(schema.marque?.nom || "—") },
        { content: "Reference", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: sanitize(schema.reference_moteur || "—") },
      ],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5, textColor: COLORS.dark, lineColor: [220, 220, 220], lineWidth: 0.1 },
    margin: { left: 14, right: 14 },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // --- SECTION BOBINAGE ---
  if (cursorY > pageHeight - 80) {
    doc.addPage();
    cursorY = 20;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.darkRed);
  doc.text("CARACTERISTIQUES DU BOBINAGE", 14, cursorY);
  cursorY += 5;

  autoTable(doc, {
    startY: cursorY,
    body: [
      [
        { content: "Type de bobinage", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: sanitize(schema.type_bobinage?.nom || "—") },
        { content: "Nb encoches", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: schema.nb_encoches !== null ? `${schema.nb_encoches}` : "—" },
      ],
      [
        { content: "Pas", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: sanitize(schema.pas || "—") },
        { content: "Pas bobine", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: sanitize(schema.pas_bobine || "—") },
      ],
      [
        { content: "Nb spires", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: schema.nb_spires !== null ? `${schema.nb_spires}` : "—" },
        { content: "Diametre fil", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: schema.diametre_fil_mm !== null ? `${schema.diametre_fil_mm} mm` : "—" },
      ],
      [
        { content: "Fils parallele", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: schema.nb_fils_parallele !== null ? `${schema.nb_fils_parallele}` : "—" },
        { content: "Section totale", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: schema.section_totale_mm2 !== null ? `${schema.section_totale_mm2} mm2` : "—" },
      ],
      [
        { content: "Groupes/phase", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: schema.groupes_par_phase !== null ? `${schema.groupes_par_phase}` : "—" },
        { content: "Connexion", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: schema.connexion === "etoile" ? "Etoile (Y)" : schema.connexion === "triangle" ? "Triangle" : sanitize(schema.connexion || "—") },
      ],
      [
        { content: "Nb voies", styles: { fontStyle: "bold", fillColor: COLORS.lightGray } },
        { content: schema.nb_voies !== null ? `${schema.nb_voies}` : "—" },
        { content: "", styles: { fillColor: COLORS.lightGray } },
        { content: "" },
      ],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5, textColor: COLORS.dark, lineColor: [220, 220, 220], lineWidth: 0.1 },
    margin: { left: 14, right: 14 },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // --- NOTES ---
  if (schema.notes && schema.notes.trim()) {
    if (cursorY > pageHeight - 50) {
      doc.addPage();
      cursorY = 20;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.darkRed);
    doc.text("NOTES", 14, cursorY);
    cursorY += 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.dark);

    const splitNotes = doc.splitTextToSize(sanitize(schema.notes), pageWidth - 28);
    doc.text(splitNotes, 14, cursorY);
  }

  // --- PIED DE PAGE ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.gray);
    doc.text("FARATEC - Base de schemas de bobinage", 14, pageHeight - 7);
    doc.text(`Page ${i} / ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: "right" });
  }

  return doc;
}

// ============================================================
// TELECHARGER LE PDF
// ============================================================
export async function downloadSchemaPdf(schema: SchemaComplet): Promise<void> {
  const doc = await buildSchemaPdf(schema);
  const filename = `FARATEC_${(schema.code_schema || "schema").replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
