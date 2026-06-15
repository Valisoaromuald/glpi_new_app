import { Router } from "express";
import { ticketController } from "./ticket.controller";

const router = Router();
router.post('/',ticketController.create)
router.get('/', ticketController.getAll);
router.patch('/:ticketId/status', ticketController.updateStatus);
export default router;