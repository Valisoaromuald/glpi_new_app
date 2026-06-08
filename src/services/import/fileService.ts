import Papa from "papaparse";
 
// ── Types ──────────────────────────────────────────────────────────────────
export type CsvRow = Record<string, string>;
 
export interface CsvResult {
  headers: string[];
  rows: CsvRow[];
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
}
 
// Singleton exporté — instance partagée dans toute l'app
export const csvService = new FileService();