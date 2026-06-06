import type { Entity } from "../administration/user/entity";

export interface Location{
    id: number,
    name: string,
    completename: string,
    code: string,
    alias: string,
    comment: string,
    entity: Partial<Entity>,
    is_recursive: boolean,
    parent: Partial<Location>,
    level: number,
    room: string,
    building: string,
    address: string,
    town: string,
    postcode: string,
    state: string,
    country: string,
    latitude: string,
    longitude: string,
    altitude: string,
    date_creation: string,
    date_mod: string
  }