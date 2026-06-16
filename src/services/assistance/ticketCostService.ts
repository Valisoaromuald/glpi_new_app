import { glpiApi } from "@/api/GlpiApi"
import type { TicketCost } from "@/types/assistance/ticketCost";

export default class TicketCostService {
    static createObject(ticketId: number, actionTime: number, timeCost: number,costFixed: number): Partial<TicketCost> {
        if (ticketId && actionTime>=0 && timeCost>=0 && costFixed>=0) {
            return {
                tickets_id: ticketId,
                entities_id: 0,
                name: "Coût", 
                actiontime: actionTime,
                cost_time: String(timeCost),
                cost_fixed: String(costFixed)
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
    static getTotalCost(ticketCost:Partial<TicketCost>):number{
        let result: number = 0
        let actiontime = ticketCost.actiontime
        let cost_time = ticketCost.cost_time
        let cost_fixed = ticketCost.cost_fixed
        let cost_material= ticketCost.cost_material
        if(actiontime && cost_time){
            result += (Number(actiontime)* Number(cost_time))/3600
        }
        if(cost_fixed){
            result+=Number(cost_fixed)
        }
        if(cost_material){
            result+=Number(cost_material)
        }
        return result;
    }
}