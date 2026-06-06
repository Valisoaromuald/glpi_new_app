

export interface Computer{
    id: number,
    name: string,
    comment: string,
    status: {
      id: number,
      name: string
    },
    entity:{
       id: number,
      name: string,
      completename: string
    },
    is_recursive: true,
    manufacturer: {
      id: number,
      name: string
    },
    user: {
      id: number,
      name: string
    },
    user_tech:  {
      id: number,
      name: string
    },
    contact: string,
    contact_num: string,
    serial: string,
    otherserial: string,
    is_deleted: true,
    date_creation: string,
    date_mod: string,
    location: {
      id: number,
      name: string
    },
    type: {
      id: number,
      name: string
    },
    model: {
      id: number,
      name: string
    },
    group: Array<
      {
        id: number,
        name: string
      }
    >,
    group_tech: Array<
      {
        id: number,
        name: string
      }
    >,
    uuid: string,
    network: {
      id: number,
      name: string
    },
    autoupdatesystem: {
      id: number,
      name: string
    },
    is_template: false,
    template_name: string,
    is_dynamic: false,
    ticket_tco: number,
    last_inventory_update: string,
    last_boot: string
  }