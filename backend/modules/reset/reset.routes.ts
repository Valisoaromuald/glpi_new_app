import { Router } from 'express';
import { resetController } from './reset.controller';

const router = Router();

router.post('/', resetController.reset);

export default router;