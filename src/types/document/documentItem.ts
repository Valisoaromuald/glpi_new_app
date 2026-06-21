export interface DocumentItem{
    id: number,
    documents_id: string | number,
    items_id: number | string,
    itemtype: string,
    entities_id: number | string,
    is_recursive: number,
    date_mod: string,
    users_id: string | number,
    timeline_position: number,
    date_creation:  string,
    [key:string] : any
}