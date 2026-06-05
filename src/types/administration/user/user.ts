import type { Email } from "./email"
import type { Entity } from "./entity"
import type { Profile } from "./profile"
import type { UserCategory } from "./userCategory"
import type { UserTitle } from "./userTitle"

export interface User {
    id: number ,
    username: string,
    realname: string,
    firstname: string,
    phone: string,
    phone2: string,
    mobile: string,
    emails: Email[],
    comment: string,
    is_active: true,
    is_deleted: true,
    picture: string,
    date_password_change: string,
    location: Location,
    authtype: number,
    last_login: string,
    default_profile: Partial<Profile>,
    default_entity: Partial<Entity>,
    date_creation: string,
    date_mod: string,
    date_sync: string,
    title: Partial<UserTitle>,
    category: Partial<UserCategory>,
    registration_number: string,
    begin_date: string,
    end_date: string,
    nickname: string,
    substitution_start_date: string,
    substitution_end_date: string
  }