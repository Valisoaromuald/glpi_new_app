import type { NextFunction, Request, Response } from "express";
import { ticketService } from "./ticket.service.js";


export const ticketController = {
    create(req: Request, res: Response, next: NextFunction) {
        try {
            if(req.body && req.body.data){
                const result = ticketService.create(req.body.data);
                res.status(201).json(result);
            }
            else{
                
            }
        } catch (err) {
            next(err);
        }
    },
}