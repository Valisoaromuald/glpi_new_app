export interface Column {
  id: number;
  label: string;
  label_mg: string;
  color: string;
}

export interface TicketActor {
  id?: number;
  user_id: number;
  user_name?: string;
  role: 'requester' | 'assigned' | 'observer';
}

export interface TicketItem {
  id?: number;
  item_type: string;  // itemtype GLPI: 'Computer', 'Monitor', ...
  item_id: number;
  item_name?: string;
}
export interface Ticket {
  id: number;
  titre: string;
  description?: string;
  statut_id: number;
  status_label: string;
  status_label_mg: string;
  urgency: number;
  impact: number;
  priority: number;
  glpi_cost?: number;
  super_cost?: number;
  extra_info?: string | null;
  date_creation: string;
  date_mod: string;
  actors?: TicketActor[];
  items?: TicketItem[];
}

export interface PendingStatusChange {
  ticketId: number;
  targetStatusId: number;
  targetLabel: string;
  previousStatusId: number;
}

export interface DraggableChangeEvent {
  added?: { element: Ticket; newIndex: number };
  removed?: { element: Ticket; oldIndex: number };
  moved?: { element: Ticket; newIndex: number; oldIndex: number };
}