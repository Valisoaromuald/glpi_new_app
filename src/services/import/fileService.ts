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

  trimStringArray(values: string[]): string[] {
    return values.map(value => value.trim());
  }
  trimCsvRows(
    records: CsvRow[]
  ): CsvRow[] {
    return records.map(record =>
      Object.fromEntries(
        Object.entries(record).map(([key, value]) => [
          key,
          value.trim()
        ])
      )
    );
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
      headers: this.trimStringArray(result.meta.fields ?? []),
      rows: this.cleanCsvData(this.trimCsvRows(result.data)),
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

  cleanCsvData(rows: CsvRow[]): CsvRow[] {
    return rows.map(row => {
      const cleanedRow: CsvRow = {};

      for (const [key, value] of Object.entries(row)) {
        // On vérifie si la valeur est une string (toujours vrai avec votre type CsvRow, 
        // mais utile si le type évolue)
        if (typeof value === 'string') {
          cleanedRow[key] = value.trim();
        } else {
          cleanedRow[key] = value;
        }
      }

      return cleanedRow;
    })
  }



  static async extractImagesFromZip(
    importedFile: ImportedFile
  ): Promise<ExtractedImage[]> {
    const rootZip = await JSZip.loadAsync(importedFile.file)

    return await this.extractImagesRecursively(rootZip)
  }

  static async extractImagesRecursively(
    zip: JSZip
  ): Promise<ExtractedImage[]> {
    const results: ExtractedImage[] = []

    for (const [path, entry] of Object.entries(zip.files)) {
      if (
        entry.dir ||
        path.includes('__MACOSX') ||
        path.startsWith('.')
      ) {
        continue
      }

      const filename = path.split('/').pop()?.toLowerCase() ?? ''

      // ZIP trouvé → exploration récursive
      if (filename.endsWith('.zip')) {
        try {
          const zipBuffer = await entry.async('arraybuffer')
          const nestedZip = await JSZip.loadAsync(zipBuffer)

          const nestedResults =
            await this.extractImagesRecursively(nestedZip)

          results.push(...nestedResults)
        } catch (error) {
          console.error(`Erreur ZIP imbriqué : ${path}`, error)
        }

        continue
      }

      const buffer = await entry.async('arraybuffer')

      const bytesCopied = new Uint8Array(buffer).slice(0, 32)

      const detected = detectImageType(bytesCopied)

      if (!detected) {
        continue
      }

      const name = path.split('/').pop()!

      const nameWithoutExt = name.replace(/\.[^.]+$/, '')

      const trueName =
        `${nameWithoutExt}.${detected.ext}`

      const file = new File(
        [buffer],
        trueName,
        {
          type: detected.mime
        }
      )

      results.push({
        name: trueName,
        file
      })
    }

    return results
  }
}
// Singleton exporté — instance partagée dans toute l'app
export const csvService = new FileService();