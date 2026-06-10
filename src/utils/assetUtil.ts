export const V1_ONLY_ITEMTYPES = [
  "Cable",
  "Cartridge",
  "CartridgeItem",
  "Consumable",
  "ConsumableItem",
  "Rack",
  "Enclosure",
  "PDU",
  "Cluster",
] as const;
export type V1OnlyItemtype = (typeof V1_ONLY_ITEMTYPES)[number];
export const translations: Record<V1OnlyItemtype, string> = {
  Cable: "Câble",
  Cartridge: "Cartouche",
  CartridgeItem: "Type de cartouche",
  Consumable: "Consommable",
  ConsumableItem: "Type de consommable",
  Rack: "Baie",
  Enclosure: "Boîtier",
  PDU: "PDU",
  Cluster: "Cluster"
};


export const DC_MODELS = [
  'ComputerModel',
  'NetworkEquipmentModel',
  'RackModel',
  'EnclosureModel',
  'PDUModel',
  'PassiveDCEquipmentModel'
]

export const ASSET_ENDPOINTS = [
    { itemtype: 'Computer',           endpoint: '/Computer' },
    { itemtype: 'Monitor',            endpoint: '/Monitor' },
    // { itemtype: 'Rack',               endpoint: '/Rack' },
    // // { itemtype: 'PDU',                endpoint: '/PDU' },
    // { itemtype: 'Enclosure',          endpoint: '/Enclosure' },
    // { itemtype: 'Appliance',          endpoint: '/Appliance' },
    // { itemtype: 'NetworkEquipment',   endpoint: '/NetworkEquipment' },
    // { itemtype: 'PassiveDCEquipment', endpoint: '/PassiveDCEquipment' },
    // { itemtype: 'Printer',            endpoint: '/Printer' },
    { itemtype: 'Phone',              endpoint: '/Phone' },
    // { itemtype: 'Peripheral',         endpoint: '/Peripheral' },
    // { itemtype: 'Software',           endpoint: '/Software' },
]
