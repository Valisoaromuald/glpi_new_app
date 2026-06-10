import { glpiApi } from "@/api/GlpiApi"
import type { Asset } from "@/types/asset/asset";
import type { AssetModel } from "@/types/asset/assetModel";
import type { AssetType } from "@/types/asset/assetType";
import { DC_MODELS, translations, V1_ONLY_ITEMTYPES, type V1OnlyItemtype } from "@/utils/assetUtil";
import PromiseUtil from "@/utils/promiseUtil";
/**
 * Types d'assets non exposés dans GET /Assets/ de la v2
 * mais accessibles directement via /Assets/<type> ou via la v1.
 * À compléter selon vos besoins.
 */



export default class AssetService {
    private readonly endpoint = `/Assets`
    async getTotalByElementName(elementName: string, isV2: boolean): Promise<number> {
        try {
            if (elementName) {
                const response = isV2 ? await glpiApi.get(`${this.endpoint}/${elementName}`) : await glpiApi.getV1(`/${elementName}`);
                const contentRange = response.headers['content-range'];
                if (contentRange) {
                    const totalElements = contentRange ? parseInt(contentRange.split('/')[1], 10) : 0;
                    return totalElements
                }
                return 0;
            }

            else {
                throw new Error("veuillez specifier le nom de l'element avant d'utiliser getTotalByElementName")
            }

        } catch (error) {
            throw error;
        }
    }
    async getAll(): Promise<Asset[]> {
        try {
            const response = await glpiApi.get<Asset[]>(this.endpoint);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    async getAssetsGlobalDetails(): Promise<Array<{ count: number, text: string }>> {
        let result: Array<{ count: number, text: string }> = [];
        try {
            const standardAssets: Asset[] = await this.getAll();
            const standardAssetsItemTypes: string[] = standardAssets.map(asset => asset.itemtype);

            const standardAssetsPromises: Promise<number>[] = PromiseUtil.buildPromises<string, number>(
                standardAssetsItemTypes,
                (itemType: string) => this.getTotalByElementName(itemType, true)
            );
            const standardAssetObjects = await this.buildAssetObjects(standardAssets, standardAssetsPromises);

            const specificAssetsPromises = PromiseUtil.buildPromises<V1OnlyItemtype, number>(
                [...V1_ONLY_ITEMTYPES],
                (itemType: string) => this.getTotalByElementName(itemType, false)
            );
            const specificAssets = [...V1_ONLY_ITEMTYPES].map(itemType => {
                return { name: translations[itemType] || itemType }; // Fallback si la traduction n'existe pas
            });
            const specificAssetObjects = await this.buildAssetObjects(specificAssets, specificAssetsPromises);
            result = [...standardAssetObjects, ...specificAssetObjects];
        } catch (error) {
            throw error;
        }
        return result;
    }

    async buildAssetObjects(assets: Array<any>, assetsPromises: Promise<any>[]): Promise<Array<{ count: number, text: string }>> {
        const pas = 10;
        const result: Array<{ count: number, text: string }> = [];

        for (let i = 0; i < assets.length; i += pas) {
            // Découpage propre sans modifier la variable 'i'
            const subTables = assets.slice(i, i + pas);
            const subPromises = assetsPromises.slice(i, i + pas);

            // On résout toutes les promesses de ce lot (pas de 10) EN UNE SEULE FOIS
            const numbers = await Promise.all(subPromises);

            for (let j = 0; j < subTables.length; j++) {
                const count = numbers[j] ?? 0;
                const baseText = subTables[j]?.name ?? '';

                // Correction de la gestion du pluriel avec parenthèses
                const textWithPlural = baseText + (count > 1 ? 's' : '');

                result.push({
                    count: count,
                    text: textWithPlural
                });
            }
        }
        return result;
    }
    // ════════════════════════════════════════════════════════
    //  MÉTHODES ASSETS "INTELLIGENTES"
    //  Choisissent automatiquement v1 ou v2 selon le type
    // ════════════════════════════════════════════════════════

    /**
     * Récupère une liste d'assets.
     * → v2 pour les types standards (filtres RSQL supportés)
     * → v1 automatiquement pour Cable, Cartridge, etc.
     */
    public async getAssets<T = any>(
        itemtype: string,
        options: {
            filter?: string;       // RSQL, v2 uniquement
            range?: string;        // ex: "0-49"
            expand_dropdowns?: boolean;
            params?: Record<string, any>;
        } = {}
    ): Promise<T> {
        const isV1Only = (V1_ONLY_ITEMTYPES as readonly string[]).includes(itemtype);

        if (isV1Only) {
            // Fallback v1
            const v1Params: Record<string, any> = {
                range: options.range ?? "0-99",
                expand_dropdowns: options.expand_dropdowns ? 1 : 0,
                ...options.params,
            };
            const res = await glpiApi.getV1<T>(`/${itemtype}`, v1Params);
            return res.data;
        }

        // v2 par défaut
        const v2Params: Record<string, any> = { ...options.params };
        if (options.filter) v2Params.filter = options.filter;
        if (options.range) v2Params.range = options.range;
        const res = await glpiApi.get<T>(`/Assets/${itemtype}`, v2Params);
        return res.data;
    }

    /**
     * Récupère un asset unique par son id.
     * → v2 pour les types standards
     * → v1 pour les types non supportés
     */
    public async getAsset<T = any>(itemtype: string, id: number): Promise<T> {
        const isV1Only = (V1_ONLY_ITEMTYPES as readonly string[]).includes(itemtype);

        if (isV1Only) {
            const res = await glpiApi.getV1<T>(`/${itemtype}/${id}`);
            return res.data;
        }

        const res = await glpiApi.get<T>(`/Assets/${itemtype}/${id}`);
        return res.data;
    }

    /**
     * Crée un asset.
     * → toujours en v1 (plus stable pour l'écriture)
     */
    public async createAssetV1<T = any>(itemtype: string, data: Record<string, any>): Promise<T> {
        const res = await glpiApi.postV1<T>(`/${itemtype}`, data);
        return res.data;
    }

    /**
     * Met à jour un asset.
     * → toujours en v1
     */
    public async updateAssetV1<T = any>(itemtype: string, id: number, data: Record<string, any>): Promise<T> {
        const res = await glpiApi.putV1<T>(`/${itemtype}/${id}`, data);
        return res.data;
    }

    /**
     * Supprime un asset.
     * → toujours en v1
     */
    public async deleteAssetV1<T = any>(itemtype: string, id: number, force = false): Promise<T> {
        const res = await glpiApi.deleteV1<T>(`/${itemtype}/${id}`, { force_purge: force ? 1 : 0 });
        return res.data;
    }
    async getIdsAndHrefsV1(): Promise<{ hrefs: string[]; ids: number[][] }> {
        const array: readonly string[] = V1_ONLY_ITEMTYPES as readonly string[]

        try {
            const commonOption = {
                params: { only_id: true }
            }

            const promises = array.map(itemType =>
                this.getAssets<{ id: number }[]>(itemType, commonOption)
            )

            const results = await Promise.all(promises)

            return {
                hrefs: [...array],
                ids: results.map(res => res.map(obj => obj.id))
            }

        } catch (error) {
            throw error
        }
    }
    async getIdsAndHrefsV2(): Promise<{ hrefs: string[]; ids: number[][] }> {
        // 1. Récupération des assets
        const array: Asset[] = await this.getAll();

        // 2. Création et exécution des promesses en parallèle
        const promises = array.map(async (itemType) => {
            const endpoint = `query { ${itemType.itemtype} { id } }`;

            // On tape la réponse attendue de l'API GLPI (Record<string, ...> gère la clé dynamique)
            const response = glpiApi.graphql<Record<string, { id: number | string }[]>>(endpoint);
            return response;
        });

        // 3. Attente de la résolution de toutes les requêtes
        const array2D = await Promise.all(promises);
        const real2DArray: Array<Array<number>> = []
        for (let result of array2D) {

            const data = Object.values(result)[0] || []
            // On extrait et convertit directement les IDs en nombres
            const tempoArray = data.map(el => el.id ? Number(el.id) : 0);
            real2DArray.push(tempoArray)
        }
        // 4. Retour du résultat final
        return {
            hrefs: array.map(item => item.href),
            ids: real2DArray
        };
    }
    // Pour les modèles simples (Printer, Monitor, Phone, Peripheral, Device*)
    static createSimpleModelObject(assetModel: Partial<AssetModel>): Object {
        return {
            input: {
                name: assetModel.name,
                comment: assetModel.comment,
                product_number: assetModel.product_number,
            }
        };
    }

    // Pour les modèles DC/rack (Computer serveur, NetworkEquipment, Rack, PDU...)
    static createDCModelObject(assetModel: Partial<AssetModel>): Object {
        return {
            input: {
                name: assetModel.name,
                comment: assetModel.comment,
                product_number: assetModel.product_number,
                weight: assetModel.weight,
                required_units: 1,
                depth: assetModel.depth,
                power_connections: assetModel.power_connections,
                power_consumption: assetModel.power_consumption,
                is_half_rack: assetModel.is_half_rack ?? 0,
                picture_front: assetModel.picture_front ?? null,
                picture_rear: assetModel.picture_rear ?? null,
            }
        };

    }
    static createModelObject(assetModel: Partial<AssetModel>, endpoint: string): Object {
        if (assetModel.name) {
            if (DC_MODELS.includes(endpoint)) {
                return AssetService.createDCModelObject(assetModel)
            }
            return AssetService.createSimpleModelObject(assetModel)
        }
        return {}
    }
    static createTypeObject(assetType: Partial<AssetType>): Object {
        if (assetType.name) {
            return {
                name: assetType.name,
                comment: assetType.comment
            }
        }
        return {}
    }

    static async linkDocumentToItem(
        itemId: number,
        documentId: number,
        itemType: string
    ): Promise<void> {
        await glpiApi.postV1('/Document_Item', {
            input: {
                documents_id: documentId,
                itemtype: itemType,
                items_id: itemId,
            }
        })
    }
}   