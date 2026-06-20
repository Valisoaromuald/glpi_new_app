export interface ITicketCostGrouped {
    category: string;
    item_id:number,
    super_cost: number;
    glpi_cost: number;
    reopening: number;
    close: number;
    total: number;
    [key:string]: any
}