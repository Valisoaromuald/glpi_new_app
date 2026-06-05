export interface Profile{
    id: number,
  name: string,
  comment: string,
  is_default: boolean,
  helpdesk_hardware: number,
  helpdesk_item_type: string,
  managed_domainrecordtypes: string,
  mfa_enforced: boolean
}