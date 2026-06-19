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
    
}