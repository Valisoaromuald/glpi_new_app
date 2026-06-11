import { glpiApi } from "@/api/GlpiApi"

export default class TicketCostService {
    static createObject(ticketId: number, actionTime: number, timeCost: number,costFixed: number): Object {
        if (ticketId && actionTime>=0 && timeCost>=0 && costFixed>=0) {
            return {
                tickets_id: ticketId,
                entities_id: 0,
                name: "Coût", 
                actiontime: actionTime,
                cost_time: timeCost,
                cost_fixed: costFixed
            }
        }
        return {}
    }   
    static async getByColumns(ticketId: number, actionTime: number, effortCost: number, cost: number): Promise<Object> {
        try {
            // Construction dynamique de l'URL avec tous les critères de recherche
            const realEndPoint: string = `/TicketCost` +
                `?searchText[tickets_id]=${ticketId}` +
                `&searchText[actiontime]=${actionTime}` +
                `&searchText[cost]=${cost}`+
                `&searchText[effortcost]=${effortCost}`;
            // Exécution de la requête GET sur l'API GLPI
            const response = await glpiApi.getV1(realEndPoint);
            
            // Si GLPI retourne un tableau de résultats, on le renvoie
            if (Array.isArray(response) && response.length > 0) {
                return response.data; // Retourne la liste des coûts correspondants
            }

            return {}; // Rien trouvé
        } catch (error) {
            console.error("Erreur lors de la récupération du TicketCost par colonnes :", error);
            throw error;
        }
    }
}