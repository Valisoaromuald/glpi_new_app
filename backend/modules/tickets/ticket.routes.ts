import { Router } from "express";
import { ticketController } from "./ticket.controller";

const router = Router();
router.post('/',ticketController.create)
router.post('/:ticketId/Item_Ticket', ticketController.insertBySelfId);
router.get('/:glpiId', ticketController.getByGlpiId);
router.get('/', ticketController.getAll);
router.patch('/:ticketId/status', ticketController.updateStatus);
router.get('/:ticketId/costs/recent',ticketController.getAllRecentCosts)
router.get('/:ticketId/costs/first',ticketController.getFirsts)
router.get('/:ticketId/costs/all',ticketController.getAllById)
router.get('/:ticketId/costs/grouped',ticketController.getTotalCostsForEachCategory)
router.delete('/:ticketId/costs/recent',ticketController.deleteAllRecentTicketCosts)
export default router;