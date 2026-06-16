import { Router } from "express";
import { ticketCostController } from "./ticketCost.controller";


const router = Router();
router.get('/', ticketCostController.getAll);
export default router;