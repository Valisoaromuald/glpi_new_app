export interface AssetModel {
    id: number,
    name: string,
    comment: string,
    product_number: string,
    weight: number,
    rack_units: number,
    depth: number,
    power_connections: number,
    power_consumption: number,
    is_half_rack: false,
    picture_front: string,
    picture_rear: string,
    pictures: string[],
    date_creation: string,
    date_mod: string,
    [key: string]: any 
}