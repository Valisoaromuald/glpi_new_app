import { Router } from 'express';
import { statusController } from './status.controller';
 
const router = Router();
 
router.get('/', statusController.getAll);
 
export default router;