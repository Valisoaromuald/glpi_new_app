import { Router } from 'express';
import { kanbanController } from './kanban.controller';
 
const router = Router();
 
router.get('/', kanbanController.getAll);
router.put('/:statusId', kanbanController.update);
 
export default router;