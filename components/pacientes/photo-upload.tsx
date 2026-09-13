"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PhotoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-input bg-secondary/30 p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-card">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vista previa de la mascota" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium">Subir foto de la mascota</p>
        <p className="text-xs text-muted-foreground">PNG, JPG hasta 5MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={() => inputRef.current?.click()}
      >
        Examinar archivo
      </Button>
    </div>
  );
}
