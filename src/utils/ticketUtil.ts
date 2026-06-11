// ticketUtil.ts

export type TicketType = 'incident' | 'request'
export type ActorRole = 'requester' | 'observer' | 'assigned'
export const PRIORITY_MAP: Record<string, number> = {
    'Très basse': 1,
    'Basse': 2,
    'Moyenne': 3,
    'Haute': 4,
    'Très haute': 5
}
export const IMPACT_MAP: Record<string, number> = {
  'Très bas': 1,
  'Bas':      2,
  'Moyen':    3,
  'Haut':      4,
  'Très haut': 5,
}

export const TICKET_STATUS_MAP: Record<string, number> = {
  'Nouveau':                1,
  'En cours (attribué)':    2,
  'En cours (planifié)':    3,
  'En attente':             4,
  'Résolu':                 5,
  'Clos':                   6,
}