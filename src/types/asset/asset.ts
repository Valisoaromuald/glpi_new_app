export interface Asset {
    itemtype: string,
    name: string,
    href: string
}
export interface BaseAsset {
    name: string,
    entities_id: 0,
    otherserial: string,
    states_id: number | string,
    locations_id: number ,
    manufacturers_id: number | string,
    users_id: number,
    comment: string,
    [key: string]: any 
}