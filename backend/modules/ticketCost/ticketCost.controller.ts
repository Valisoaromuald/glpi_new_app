import { NextFunction, Request, Response } from "express";
import { ticketCostService } from "./ticketCost.service";

export const ticketCostController = {
    getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const ticketCosts = ticketCostService.getAll();
            res.json(ticketCosts);
        } catch (err) {
            next(err);
        }
    },
    delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                res.status(400).json({ error: 'id invalide' });
                return;
            }
            const deleted = ticketCostService.deleteTicketCost(id);
            if (!deleted) {
                res.status(404).json({ error: 'Aucun ticket_cost trouvé pour cet id' });
                return;
            }
            res.status(204).send();
        } catch (error) {
            next(error)
        }
    },
    getDetailsPerItemByCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const category_name = req.params.category

            if(!category_name){
                res.status(400).json({ error: 'aucune categorie fournie pour ' });
            }
            if(typeof category_name == "string"){
                const rows = ticketCostService.getDetailsPerItemByCategory(category_name);
                res.status(200).json(rows);
            }
            else{
                res.status(400).json({ error: 'le nom de la categorie doit etre une chaine de caractere' });
            }
            
        } catch (error) {
            next(error);
        }
    }
}