import { useState, useRef } from "react";
import { Camera, X, Loader2, Upload } from "lucide-react";
import { compresserImage, genererNomFichier } from "../lib/utils";
import { supabase } from "../lib/supabase";

interface PhotoUploadProps {
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  onRemoved: () => void;
}

export default function PhotoUpload({ currentUrl, onUploaded, onRemoved }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      const compressedBlob = await compresserImage(file, 1600, 1600, 0.8);

      const fileName = genererNomFichier(file.name);
      const filePath = `schemas/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("schema-photo")
        .upload(filePath, compressedBlob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("schema-photo")
        .getPublicUrl(filePath);

      setPreview(urlData.publicUrl);
      onUploaded(urlData.publicUrl);
    } catch (err: any) {
      setError(err.message || "Erreur d'upload");
      setPreview(currentUrl);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onRemoved();
  };

  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-2">
        Photo du schéma
      </label>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img
            src={preview}
            alt="Aperçu"
            className="w-full max-h-96 object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-white hover:bg-red-50 text-red-600 rounded-full p-2 shadow-md transition"
            title="Retirer la photo"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-2 right-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Upload size={12} /> Changer
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/30 rounded-xl py-10 flex flex-col items-center justify-center gap-2 transition disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={28} className="text-amber-500 animate-spin" />
              <p className="text-xs text-slate-500">Compression et upload...</p>
            </>
          ) : (
            <>
              <Camera size={28} className="text-slate-400" />
              <p className="text-sm font-medium text-slate-600">
                Cliquez pour ajouter une photo
              </p>
              <p className="text-[10px] text-slate-400">
                JPG, PNG — Compression automatique
              </p>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-600 mt-2">⚠️ {error}</p>
      )}
    </div>
  );
}