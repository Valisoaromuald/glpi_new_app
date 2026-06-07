export const RESOURCES_TO_RESET = [
  // Ordre important : d'abord les dépendants
  { name: 'Tickets',          endpoint: '/Assistance/Ticket' },
  { name: 'Changes',          endpoint: '/Assistance/Change' },
  { name: 'Problems',         endpoint: '/Assistance/Problem' },
  { name: 'Computers',        endpoint: '/Assets/Computer' },
  { name: 'Monitors',         endpoint: '/Assets/Monitor' },
  { name: 'NetworkEquipment', endpoint: '/Assets/NetworkEquipment' },
  { name: 'Printers',         endpoint: '/Assets/Printer' },
  { name: 'Phones',           endpoint: '/Assets/Phone' },
  { name: 'Peripherals',      endpoint: '/Assets/Peripheral' },
  { name: 'Software',         endpoint: '/Assets/Software' },
  { name: 'SoftwareLicense',  endpoint: '/Assets/SoftwareLicense' },
  { name: 'Certificates',  endpoint: '/Assets/Certificate' },
  { name: 'Contracts',        endpoint: '/Management/Contract' },
  { name: 'Documents',        endpoint: '/Management/Document' },
  { name: 'Budgets',          endpoint: '/Management/Budget' },
  { name: 'Suppliers',        endpoint: '/Management/Supplier' },
  { name: 'Contacts',         endpoint: '/Management/Contact' },
  { name: 'Projects',         endpoint: '/Project' },
  // { name: 'KnowledgeBase',    endpoint: '/Setup/KnowledgeBase' },
  // Users en dernier, avec exceptions
  { name: 'Users',            endpoint: '/Administration/User',
    protectedIds: [1,2,3,4,5,6] },
  // { name:'Groups', endpoint:'/Administration/Group',protectedIds:[0]},
  {name:'Entities', endpoint: '/Administration/Entity', protectedIds:[0]},
  {name:'Profiles', endpoint:'	/Administration/Profile', protectedIds:[1,2,3,4,5,6,7,8]}
  
];