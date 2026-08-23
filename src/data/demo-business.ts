import type { Business, Branch } from "@/domain/business/types";

export const DEMO_BUSINESS: Business = {
  id: "demo-business-001",
  name: "KyleDev Commerce Demo",
  tradingName: "KyleDev Demo Store",
  registrationNumber: "2024/000001/07",
  taxNumber: "4123456789",
  address: {
    line1: "12 Commerce Street",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "2001",
    country: "South Africa",
  },
  contact: {
    phone: "+27 11 000 0000",
    email: "demo@kyledev.co.za",
    website: "https://kyledev.co.za",
  },
  currency: { code: "ZAR", symbol: "R", name: "South African Rand", decimalPlaces: 2 },
  timezone: "Africa/Johannesburg",
  status: "active",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  settings: {
    taxEnabled: true,
    defaultTaxRate: 15,
    stockTrackingEnabled: true,
    lowStockAlertsEnabled: true,
    autoReorderEnabled: false,
    receiptFooter: "Thank you for your business!",
    invoicePrefix: "INV",
    purchaseOrderPrefix: "PO",
  },
};

export const DEMO_BRANCHES: Branch[] = [
  {
    id: "demo-branch-main",
    businessId: "demo-business-001",
    name: "Main Branch",
    code: "MAIN",
    address: { line1: "12 Commerce Street", city: "Johannesburg", province: "Gauteng", postalCode: "2001", country: "South Africa" },
    contact: { phone: "+27 11 000 0001", email: "main@kyledev.co.za" },
    isHeadOffice: true,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "demo-branch-east",
    businessId: "demo-business-001",
    name: "East Branch",
    code: "EAST",
    address: { line1: "45 Industrial Road", city: "Johannesburg", province: "Gauteng", postalCode: "2007", country: "South Africa" },
    contact: { phone: "+27 11 000 0002", email: "east@kyledev.co.za" },
    isHeadOffice: false,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];
