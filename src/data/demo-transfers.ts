export interface TransferLineItem {
  sku: string;
  name: string;
  quantity: number;
}

export type TransferStatus = "draft" | "in_transit" | "received" | "cancelled";

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  status: TransferStatus;
  items: TransferLineItem[];
  carrier: string;
  trackingNumber: string;
  requestedBy: string;
  createdAt: string;
  dispatchedAt?: string;
  receivedAt?: string;
  notes?: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  code: string;
  type: "warehouse" | "retail_store" | "depot";
  city: string;
  address: string;
}

export const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: "loc-jhb-main",
    name: "Johannesburg Central DC",
    code: "JHB-DC01",
    type: "warehouse",
    city: "Johannesburg",
    address: "88 Main Reef Rd, Industria, Johannesburg",
  },
  {
    id: "loc-sandton",
    name: "Sandton City Branch",
    code: "JHB-RET02",
    type: "retail_store",
    city: "Sandton",
    address: "Shop L24, Sandton City Mall, Sandton",
  },
  {
    id: "loc-pretoria",
    name: "Pretoria East Depot",
    code: "PTA-DEP01",
    type: "depot",
    city: "Pretoria",
    address: "14 Solomon Mahlangu Dr, Pretoria",
  },
  {
    id: "loc-cpt",
    name: "Cape Town Waterfront Store",
    code: "CPT-RET01",
    type: "retail_store",
    city: "Cape Town",
    address: "Dock Rd, V&A Waterfront, Cape Town",
  },
  {
    id: "loc-dbn",
    name: "Durban North Branch",
    code: "DBN-RET01",
    type: "retail_store",
    city: "Durban",
    address: "42 Swapo Rd, Durban North",
  },
];

export const DEMO_TRANSFERS: StockTransfer[] = [
  {
    id: "tr-001",
    transferNumber: "TR-2024-001",
    fromLocationId: "loc-jhb-main",
    fromLocationName: "Johannesburg Central DC",
    toLocationId: "loc-sandton",
    toLocationName: "Sandton City Branch",
    status: "in_transit",
    items: [
      { sku: "DLX-WS-20L", name: "Dulux Weathershield 20L", quantity: 25 },
      { sku: "PLS-VG-5L", name: "Plascon Velvaglo 5L", quantity: 40 },
    ],
    carrier: "Express Freight SA",
    trackingNumber: "EXP-9842104-ZA",
    requestedBy: "Kyle Admin",
    createdAt: "2024-01-14",
    dispatchedAt: "2024-01-15 08:30",
    notes: "Replenishing retail stock ahead of weekend promo sale",
  },
  {
    id: "tr-002",
    transferNumber: "TR-2024-002",
    fromLocationId: "loc-jhb-main",
    fromLocationName: "Johannesburg Central DC",
    toLocationId: "loc-pretoria",
    toLocationName: "Pretoria East Depot",
    status: "received",
    items: [
      { sku: "CRN-TM-20L", name: "Crown Trade Matt 20L", quantity: 50 },
      { sku: "HAM-BRS-75", name: "Hamilton's Professional Brush 75mm", quantity: 100 },
      { sku: "POW-MIN-5L", name: "Powafix Mineral Turpentine 5L", quantity: 60 },
    ],
    carrier: "Internal Fleet Truck 03",
    trackingNumber: "INT-FLEET-03",
    requestedBy: "Store Manager PTA",
    createdAt: "2024-01-10",
    dispatchedAt: "2024-01-11 09:00",
    receivedAt: "2024-01-11 15:45",
    notes: "Monthly bulk depot replenishment completed",
  },
  {
    id: "tr-003",
    transferNumber: "TR-2024-003",
    fromLocationId: "loc-sandton",
    fromLocationName: "Sandton City Branch",
    toLocationId: "loc-cpt",
    toLocationName: "Cape Town Waterfront Store",
    status: "draft",
    items: [
      { sku: "BST-SNT-1KG", name: "Bostik Super Nova Tile Grout 1kg", quantity: 30 },
      { sku: "RST-STP-1L", name: "Rust-Oleum Rust Reformer 1L", quantity: 15 },
    ],
    carrier: "Courier Guy Direct",
    trackingNumber: "TCG-4819203",
    requestedBy: "CPT Inventory Lead",
    createdAt: "2024-01-16",
    notes: "Inter-branch balance adjustment",
  },
  {
    id: "tr-004",
    transferNumber: "TR-2024-004",
    fromLocationId: "loc-jhb-main",
    fromLocationName: "Johannesburg Central DC",
    toLocationId: "loc-dbn",
    toLocationName: "Durban North Branch",
    status: "in_transit",
    items: [
      { sku: "DLX-WS-20L", name: "Dulux Weathershield 20L", quantity: 30 },
      { sku: "CRN-TM-20L", name: "Crown Trade Matt 20L", quantity: 20 },
    ],
    carrier: "Time Freight SA",
    trackingNumber: "TF-7729103",
    requestedBy: "Logistics Controller",
    createdAt: "2024-01-15",
    dispatchedAt: "2024-01-16 07:15",
    notes: "Urgent contractor order stock transfer",
  },
];
