import type { Ticket } from "./assistance/ticket";
import type { IKanbanCard } from "./kanban/kanbanCard";

export interface Column {
  id: number;
  label: string;
  label_mg: string;
  color: string;
}
export interface PendingStatusChange {
  ticketId: number;
  targetStatusId: number;
  targetLabel: string;
  previousStatusId: number;
}

export interface DraggableChangeEvent {
  added?: { element: IKanbanCard; newIndex: number };
  removed?: { element: IKanbanCard; oldIndex: number };
  moved?: { element: IKanbanCard; newIndex: number; oldIndex: number };
}