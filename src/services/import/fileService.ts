import type { ImportedFile } from "@/types/file/importedFile";
import { detectImageType } from "@/utils/importUtil";
import JSZip from "jszip";
import Papa from "papaparse";

// ── Types ──────────────────────────────────────────────────────────────────
export type CsvRow = Record<string, string>;

export interface CsvResult {
  headers: string[];
  rows: CsvRow[];
}


export interface ExtractedImage {
  name: string        // "PC-ADM-001.png"
  file: File          // File avec le vrai MIME type détecté
}


// ── Service ────────────────────────────────────────────────────────────────
export class FileService {
  private source: Blob | string | undefined;

  constructor(source?: Blob | string) {
    this.source = source;
  }

  /** Permet de changer la source après instanciation */
  setSource(source: Blob | string) {
    this.source = source;
  }

  /**
   * Lit et parse le fichier CSV.
   * Retourne les headers et les lignes sous forme d'objets.
   */
  async readCsv(): Promise<CsvResult> {
    if (!this.source) {
      throw new Error("Source CSV non définie.");
    }

    // Lecture du contenu brut
    let content: string;
    if (this.source instanceof Blob) {
      content = await this.source.text(); // Browser : File hérite de Blob
    } else {
      content = this.source;              // Node.js : texte CSV direct
    }

    const result = Papa.parse<CsvRow>(content, {
      header: true,            // première ligne = headers
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    return {
      headers: result.meta.fields ?? [],
      rows: result.data,
    };
  }

  /**
   * Version raw : retourne string[][] sans headers comme objets.
   */
  async readCsvRaw(): Promise<string[][]> {
    if (!this.source) {
      throw new Error("Source CSV non définie.");
    }

    let content: string;
    if (this.source instanceof Blob) {
      content = await this.source.text();
    } else {
      content = this.source;
    }

    const result = Papa.parse<string[]>(content, {
      header: false,
      skipEmptyLines: true,
    });

    return result.data;
  }


  static async extractImagesFromZip(importedFile: ImportedFile): Promise<ExtractedImage[]> {
    const zip = await JSZip.loadAsync(importedFile.file)  // ← .file
    const results: ExtractedImage[] = []

    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir || path.includes('__MACOSX') || path.startsWith('.')) continue

      const buffer = await entry.async('arraybuffer')
      const bytesCopied = new Uint8Array(buffer).slice(0, 32)
      const detected = detectImageType(bytesCopied)
      console.log(path, [...bytesCopied].map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '))
      if (!detected) continue

      const name = path.split('/').pop()!
      const nameWithoutExt = name.replace(/\.[^.]+$/, '')

      // Extension basée sur la vraie détection, pas sur le nom du fichier
      const trueName = `${nameWithoutExt}.${detected.ext}` 

      const file = new File([buffer], trueName, { type: detected.mime })
      results.push({ name: trueName, file })
    }

    return results
  }
}

// Singleton exporté — instance partagée dans toute l'app
export const csvService = new FileService();