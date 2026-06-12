export interface TicketUser {
  id:         number
  tickets_id: number
  users_id:   string | number  // string si expand_dropdowns=1, number sinon
  type:       1 | 2 | 3
  use_notification: number
  alternative_email: string
}
export interface TicketGroup {
  id:         number
  tickets_id: number
  groups_id:  string | number
  type:       1 | 2 | 3
}