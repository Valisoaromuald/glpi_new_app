
import type { NextFunction, Request, Response } from 'express';
import { kanbanService } from './kanban.service';


export const kanbanController = {
    getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const config = kanbanService.getAll();
            res.json(config);
        } catch (err) {
            next(err);
        }
    },

    update(req: Request, res: Response, next: NextFunction) {
        try {
            const { color, label_mg } = req.body.input ?? {};
            if(req.params.statusId){
                if(typeof req.params.statusId === "string"){
                    kanbanService.update(req.params.statusId, { color, label_mg });
                    res.json({ success: true });
                }
                else { 
                    res.json({error: "l'id doit etre obligatoire et unique"})
                }
            }
        } catch (err) {
            next(err);
        }
    },
};