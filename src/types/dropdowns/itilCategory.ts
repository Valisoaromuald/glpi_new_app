import type { Entity } from "../administration/user/entity"
import type { User } from "../administration/user/user"

export interface ITILCategory{
    id: number,
    name: string,
    completename: string,
    level: number,
    comment: string,
    entity: Partial<Entity>,
    is_recursive: boolean,
    parent:Partial<ITILCategory>,
    user: Partial<User>,
    group: {
      id: number,
      name: string
    },
    code: string,
    is_helpdesk_visible: boolean,
    ticket_incident_template: {
      id: number,
      name: string
    },
    ticket_request_template: {
      id: number,
      name: string
    },
    change_template: {
      id: number,
      name: string
    },
    problem_template: {
      id: number,
      name: string
    },
    is_incident_visible: boolean,
    is_request_visible: boolean,
    is_change_visible: boolean,
    is_problem_visible: boolean,
    knowbase_category: {
      id: number,
      name: string
    },
    date_creation: string,
    date_mod: string
  }