import type { ID, BaseEntity, Status, Address, ContactInfo, Currency } from '@/types/core';

export interface Business extends BaseEntity {
  name: string;
  tradingName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  address: Address;
  contact: ContactInfo;
  currency: Currency;
  timezone: string;
  status: Status;
  settings: BusinessSettings;
}

export interface BusinessSettings {
  taxEnabled: boolean;
  defaultTaxRate: number;
  stockTrackingEnabled: boolean;
  lowStockAlertsEnabled: boolean;
  autoReorderEnabled: boolean;
  receiptFooter?: string;
  invoicePrefix: string;
  purchaseOrderPrefix: string;
}

export interface Branch extends BaseEntity {
  businessId: ID;
  name: string;
  code: string;
  address: Address;
  contact: ContactInfo;
  isHeadOffice: boolean;
  status: Status;
}

export interface Location extends BaseEntity {
  businessId: ID;
  branchId: ID;
  name: string;
  code: string;
  description?: string;
  status: Status;
}
