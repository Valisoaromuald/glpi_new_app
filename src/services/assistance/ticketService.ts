import { glpiApi } from "@/api/GlpiApi";
import type { Ticket } from "@/types/assistance/ticket";
import PromiseUtil from "@/utils/promiseUtil";

export default class TicketService {
    private readonly subEndPoint = 'Ticket'
    private readonly endPointPrefix = `/Assistance/${this.subEndPoint}`
    async getTotalByType(typeId: number): Promise<number> {
        try {
            // En v2, l'endpoint imbriqué est correct
            const endpoint: string = `${this.endPointPrefix}?filter=type==${typeId}`;

            const response = await glpiApi.get(endpoint, {
                headers: {
                    // Équivalent du limit 0-0 pour ne charger aucune donnée, juste le total
                    'Range': '0-0'
                }
            });
            const contentRange = response.headers['content-range'];
            if (contentRange) {
                const totalElements = parseInt(contentRange.split('/')[1], 10);
                return totalElements;
            }
            return 0;
        } catch (error) {
            throw error;
        }
    }
    async getAllIds(): Promise<number[]> {
        try {
            const endpoint = `query { ${this.subEndPoint} { id } }`;
            const response = await glpiApi.graphql<{ Computer: { id: number | string }[] }>(endpoint);
            if (response.Computer) {
                return response.Computer.map(computer => Number(computer.id));
            }

            return [];
        } catch (error) {
            // Le "throw error" dans un bloc catch simple est redondant, 
            // mais si tu prévois d'ajouter des logs ici, tu peux le laisser.
            throw error;
        }
    }

    async deleteById(id: number | string): Promise<void> {
        try {
            const endpoint = `${this.endPointPrefix}/${id}?force=1`
            const response = await glpiApi.delete(endpoint)
        } catch (error) {
            throw error;
        }
    }
    async deleteAll(): Promise<void> {
        const pas: number = 5;
        try {
            const ids: number[] = await this.getAllIds();
            for (let i = 0; i < ids.length; i += pas) {
                const subIds: number[] = ids.slice(i, i + pas);
                const promises: Promise<void>[] = PromiseUtil.buildPromises<number, void>(subIds, this.deleteById);
                await Promise.all(promises)
            }
        } catch (error) {
            throw error;
        }
    }

    static createItemTicketObject(ticketId: number, item: { itemtype: string, items_id: number }): Object {
        return {
            tickets_id: ticketId,
            itemtype: item.itemtype,
            items_id: item.items_id
        }
    }
    static async  getByExternalId(externalId: string | undefined): Promise<Partial<Ticket>> {
    // 1. Sécurité : Si l'externalId est vide ou indéfini, on s'arrête tout de suite
    const cleanId = externalId?.trim();
    if (!cleanId) {
        console.warn("getByExternalId: L'identifiant externe fourni est vide.");
        return {};
    }

    try {
        // 2. Appel à l'API GLPI avec le searchText sur le champ externalid
        const response = await glpiApi.getV1(`/Ticket?searchText[externalid]=${cleanId}`);
        
        // 3. Traitement de la réponse
        // GLPI retourne souvent un tableau. On vérifie s'il y a au moins un résultat.
        if (Array.isArray(response.data) && response.data.length > 0) {
            return response.data[0]; // On retourne le premier ticket correspondant trouvé
        }

        // Si la réponse est déjà un objet unique contenant le ticket
        if (response && response.data.externalid === cleanId) {
            return response.data[0] as Partial<Ticket>;
        }

        // Si rien n'a été trouvé
        return {};

    } catch (error) {
        console.error(`Erreur lors de la récupération du ticket avec l'externalid [${cleanId}] :`, error);
        throw error; 
    }
}
}
