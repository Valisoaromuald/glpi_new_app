import { NextFunction, Request, Response } from "express";
import { statusService } from "./status.service";

export const statusController = {
    getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const status = statusService.getAll();
            res.json(status);
        } catch (err) {
            next(err);
        }
    },
}