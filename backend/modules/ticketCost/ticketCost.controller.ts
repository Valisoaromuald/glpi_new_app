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
}