import { Router } from "express";
import { ticketController } from "./ticket.controller";

const router = Router();
router.post('/',ticketController.create)
router.put('/:ticketId/status', ticketController.updateStatus);
export default router;