import type { Entity } from "../administration/user/entity"
import type { User } from "../administration/user/user"
import type { ITILCategory } from "../dropdowns/itilCategory"
import type { Location } from "../dropdowns/location"

export interface Ticket {
    id: number,
    name: string,
    content: string,
    user_recipient: Partial<User>,
    user_editor: Partial<User>,
    is_deleted: boolean,
    category:Partial<ITILCategory>,
    location: Partial<Location>,
    urgency: number,
    impact: number,
    priority: number,
    actiontime: number,
    begin_waiting_date: string,
    waiting_duration: number,
    resolution_duration: number,
    close_duration: number,
    resolution_date: string,
    date_creation: string,
    date_mod: string,
    date: string,
    date_solve: string,
    date_close: string,
    type: number,
    external_id: string,
    request_type: {
        id: number,
        name: string
    },
    take_into_account_date: string,
    take_into_account_duration: number,
    sla_ttr: {
        id: number,
        name: string
    },
    sla_tto: {
        id: number,
        name: string
    },
    ola_ttr: {
        id: number,
        name: string
    },
    ola_tto: {
        id: number,
        name: string
    },
    sla_level_ttr: {
        id: number,
        name: string
    },
    ola_level_ttr: {
        id: number,
        name: string
    },
    sla_waiting_duration: number,
    ola_waiting_duration: number,
    ola_ttr_begin_date: string,
    ola_tto_begin_date: string,
    internal_resolution_date: string,
    internal_take_into_account_date: string,
    global_validation: number,
    status: {
        id: number,
        name: string
    },
    entity: Partial<Entity>,
    team: 
        {
            id: number,
            name: string,
            type: string,
            role: string
        }[]
    ,
    costs: {id: number}[]
    
}