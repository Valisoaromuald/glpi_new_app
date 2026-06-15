import type { IKanbanCard } from "./kanbanCard"

export interface IKanbanColumn{
    title: string
    status:number
    cards: Partial<IKanbanCard>[]
    label_mg:string
    color:string
}