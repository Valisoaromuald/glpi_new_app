import { Request, Response, NextFunction } from 'express';
import { resetService } from './reset.service';

export const resetController = {
  reset(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = resetService.resetDatabase();
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};