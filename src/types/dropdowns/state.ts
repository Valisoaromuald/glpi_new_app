export interface State {
    id: number,
    name: string,
    completename: string,
    comment: string,
    entity: {
        id: number,
        name: string
    },
    is_recursive: boolean | number,
    parent: {
        id: number,
        name: string
    },
    level: number,
    is_visible_helpdesk: boolean,
    date_creation: string,
    date_mod: string,
    visibilities: {
        computer: boolean,
        monitor: boolean,
        networkequipment: boolean,
        peripheral: boolean,
        phone: boolean,
        printer: boolean,
        softwarelicense: boolean,
        certificate: boolean,
        enclosure: boolean,
        pdu: boolean,
        line: boolean,
        rack: boolean,
        softwareversion: boolean,
        cluster: boolean,
        contract: boolean,
        appliance: boolean,
        databaseinstance: boolean,
        cable: boolean,
        unmanaged: boolean,
        passivedcequipment: boolean
    }
    entitites_id? : number,
    [key: string]: any 
}