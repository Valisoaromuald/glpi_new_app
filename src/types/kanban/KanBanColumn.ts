import type { IKanbanCard } from "./kanbanCard"

export interface IKanbanColumn{
    title: string
    status:number
    cards: Partial<IKanbanCard>[]
}