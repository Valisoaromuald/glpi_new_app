export interface KanbanConfigRow {
  id: string;
  label: string;
  label_mg: string | null;
  color: string;
  status_id: number;
}

export interface UpdateKanbanConfigInput {
  color?: string;
  label_mg?: string;
}