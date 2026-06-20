import express from 'express';
import cors from 'cors';
import ticketRoutes from "./modules/tickets/ticket.routes"
import { errorHandler } from './middleware/error.middleware';
import kanbanRoutes from './modules/kanban/kanban.routes';
import resetRoutes from './modules/reset/reset.routes';
import ticketCostRoutes from './modules/ticketCost/ticketCost.routes';
import statusRoutes from './modules/status/status.routes';



const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tickets', ticketRoutes);
app.use('/api/ticketCosts', ticketCostRoutes);
app.use('/api/kanban-config', kanbanRoutes);
app.use('/api/status', statusRoutes);

app.use('/api/reset', resetRoutes);
app.use(errorHandler);

export default app; 