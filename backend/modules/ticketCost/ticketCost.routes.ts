import { Router } from "express";
import { ticketCostController } from "./ticketCost.controller";


const router = Router();
router.get('/', ticketCostController.getAll);
router.get('/:category',ticketCostController.getDetailsPerItemByCategory)
export default router;