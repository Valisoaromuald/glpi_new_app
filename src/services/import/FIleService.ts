import { parse } from "csv-parse/sync"

export type CsvRow = Record<string, string>;

export interface CsvResult {
    headers: string[];
    rows: CsvRow[];
}
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

        // Détection automatique du séparateur (, ou ;)
        const delimiter = content.includes(";") ? ";" : ",";

        // Parse CSV → tableau d'objets (cast explicite car csv-parse retourne unknown[])
        const records = parse(content, {
            columns: true,
            trim: true,
            delimiter,
            skip_empty_lines: true,
            relax_column_count: true,
        }) as CsvRow[];

        const headers = records.length > 0 ? Object.keys(records[0] as object) : [];

        return { headers, rows: records };
    }

    /**
     * Version raw : retourne string[][] sans headers comme objets.
     * Utile si tu veux traiter les données manuellement.
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

        const delimiter = content.includes(";") ? ";" : ",";

        return parse(content, {
            columns: false,
            trim: true,
            delimiter,
            skip_empty_lines: true,
        });
    }
}