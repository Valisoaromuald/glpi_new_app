export interface State {
    id: 0,
    name: string,
    completename: string,
    comment: string,
    entity: {
        id: 0,
        name: string
    },
    is_recursive: boolean,
    parent: {
        id: 0,
        name: string
    },
    level: 0,
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
}