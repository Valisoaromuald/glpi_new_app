import type { Ticket } from "./ticket"
import type { TicketItem } from "./ticketItem"

export interface LinkedElement {
  uid: string
  id: string
  type: string
  name: string
  serialNumber: string
  availableElements?: LinkedElement[]
}

export interface TicketForm {
  ticket: Partial<Ticket>
  elements: TicketItem[]
}