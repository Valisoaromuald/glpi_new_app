export interface TicketCost{
    id: number,
    tickets_id: number,
    name: string,
    comment: string | null,
    begin_date: string | null,
    end_date: string | null,
    actiontime: number,
    cost_time: string,
    cost_fixed: string,
    cost_material: string,
    [key :string]: any
}