import type { NextFunction, Request, Response } from "express";
import { ticketService } from "./ticket.service";


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
            console.log("ticketId eto e: ",ticketId)
            const newStatus = Number(req.body.data.statut_id);
            console.log("newStatus eto e: ",newStatus)

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
    }

}
