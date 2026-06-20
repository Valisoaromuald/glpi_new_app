import type { NextFunction, Request, Response } from "express";
import { ticketService } from "./ticket.service";
import { ticketCostService } from "../ticketCost/ticketCost.service";


export const ticketController = {
    create(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.body && req.body.data) {
                const result = ticketService.create(req.body.data);
                res.status(201).json(result);
            }
        } catch (err) {
            next(err);
        }
    },
    getById(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.params) {
                const ticket = ticketService.getById(Number(req.params.id));
                res.json(ticket);
            }
        } catch (err) {
            next(err);
        }
    },
    getByGlpiId(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.params) {
                const ticket = ticketService.getByGlpiId(Number(req.params.glpiId));
                res.json(ticket);
            }
        } catch (err) {
            next(err);
        }
    },

    getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const config = ticketService.getAll();
            res.json(config);
        } catch (err) {
            next(err);
        }
    },
    updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const ticketId = Number(req.params.ticketId);
            const newStatus = Number(req.body.data.statut_id);

            if (isNaN(ticketId) || isNaN(newStatus)) {
                return res.status(400).json({
                    error: "ticketId ou status invalide"
                });
            }

            ticketService.updateStatus(ticketId, newStatus);

            return res.json({ success: true });

        } catch (err) {
            next(err);
        }
    },
    insertBySelfId(req: Request, res: Response, next: NextFunction) {
        try {
            const ticket_id = req.params.ticketId;
            if (typeof ticket_id === "string") {
                if (!ticket_id) {
                    return res.status(400).json({
                        error: "ticketId invalide"
                    });
                }
                const items = req.body.data.items;
                const cost = req.body.data.cost ? Number(req.body.data.cost) : 0
                const cost_type = req.body.data.cost_type ?? ''
                ticketService.insertCostBySelfId(Number(ticket_id), items, cost, cost_type)
                return res.json({ success: true });
            }
        } catch (error) {
            next(error);
        }
    },

    getAllRecentCosts(req: Request, res: Response, next: NextFunction) {
        const ticketId = Number(req.params.ticketId);

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({ error: 'ticketId invalide' });
        }
        try {
            const costs = ticketCostService.getMostRecentCostsByTicket(ticketId);
            return res.status(200).json({ data: costs });
        } catch (err) {
            console.error('Erreur getMostRecentCostsByTicket:', err);
            next(err)
        }
    },
    getFirsts(req: Request, res: Response, next: NextFunction) {
        const ticketId = Number(req.params.ticketId);

        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({ error: 'ticketId invalide' });
        }
        try {
            const costs = ticketCostService.getFirst(ticketId);


            return res.status(200).json({ data: costs });
        } catch (err) {
            console.error('Erreur getMostRecentCostsByTicket:', err);
            next(err)
        }
    },
    getAllById(req: Request, res: Response, next: NextFunction) {
        const ticketId = Number(req.params.ticketId);
        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({ error: 'ticketId invalide' });
        }
        try {
            const costs = ticketCostService.getAllByTicketId(ticketId);

            return res.status(200).json({ data: costs });
        } catch (err) {
            next(err)
        }
    },
    deleteAllRecentTicketCosts(req: Request, res: Response, next: NextFunction) {
        try {
            const ticketId = Number(req.params.ticketId);
            

            if (!Number.isInteger(ticketId) || ticketId <= 0) {
                res.status(400).json({ error: 'ticketId invalide' });
                return;
            }
            const count = ticketCostService.deleteAllRecentTicketCosts(ticketId);
            res.status(200).json({ deletedCount: count });
        } catch (error) {
            next(error)
        }
    },  
    getTotalCostsForEachCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const rows = ticketCostService.getTotalCostsForEachCategory();
            res.status(200).json({ data: rows });
        } catch (error) {
            next(error);
        }
    }

}
