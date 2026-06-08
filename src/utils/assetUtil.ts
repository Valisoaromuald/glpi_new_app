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