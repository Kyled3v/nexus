export type InvoiceType = "receivable" | "payable";
export type InvoiceStatus = "draft" | "unpaid" | "paid" | "overdue" | "partially_paid";

export interface InvoiceLineItem {
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType; // receivable (Customer) vs payable (Supplier)
  entityName: string;
  entityEmail: string;
  entityPhone?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentTerms: string;
  items: InvoiceLineItem[];
  notes?: string;
}

export const DEMO_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2024-001",
    type: "receivable",
    entityName: "BuildMax Commercial Contractors",
    entityEmail: "accounts@buildmax.co.za",
    entityPhone: "+27 11 892 4000",
    status: "unpaid",
    issueDate: "2024-01-05",
    dueDate: "2024-02-05",
    subtotal: 48500,
    vatAmount: 7275,
    totalAmount: 55775,
    amountPaid: 0,
    balanceDue: 55775,
    paymentTerms: "Net 30 Days",
    items: [
      { description: "Dulux Weathershield 20L (Pure White)", sku: "DLX-WS-20L", quantity: 35, unitPrice: 1100, taxRate: 15 },
      { description: "Plascon Velvaglo 5L (Base White)", sku: "PLS-VG-5L", quantity: 20, unitPrice: 500, taxRate: 15 },
    ],
    notes: "Site delivery to Waterfall City Office Park Project",
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2024-002",
    type: "receivable",
    entityName: "Apex Interior Architecture",
    entityEmail: "billing@apexinteriors.co.za",
    entityPhone: "+27 21 440 1200",
    status: "paid",
    issueDate: "2024-01-02",
    dueDate: "2024-01-16",
    subtotal: 18200,
    vatAmount: 2730,
    totalAmount: 20930,
    amountPaid: 20930,
    balanceDue: 0,
    paymentTerms: "Net 14 Days",
    items: [
      { description: "Crown Trade Clean Extreme Matt 20L", sku: "CRN-TM-20L", quantity: 15, unitPrice: 880, taxRate: 15 },
      { description: "Hamilton's Professional Rollers & Trays", sku: "HAM-BRS-75", quantity: 25, unitPrice: 200, taxRate: 15 },
    ],
    notes: "Paid in full via EFT ref EFT-849102",
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-2024-003",
    type: "receivable",
    entityName: "Pretoria Paint Masters CC",
    entityEmail: "info@ptapaintmasters.co.za",
    entityPhone: "+27 12 360 8800",
    status: "overdue",
    issueDate: "2023-12-10",
    dueDate: "2024-01-10",
    subtotal: 31000,
    vatAmount: 4650,
    totalAmount: 35650,
    amountPaid: 10000,
    balanceDue: 25650,
    paymentTerms: "Net 30 Days",
    items: [
      { description: "Dulux Trade High Gloss 20L", sku: "DLX-HG-20L", quantity: 20, unitPrice: 950, taxRate: 15 },
      { description: "Powafix All Purpose Crack Filler 10kg", sku: "POW-CF-10KG", quantity: 40, unitPrice: 300, taxRate: 15 },
    ],
    notes: "Overdue reminder notice dispatched on 12 Jan",
  },
  {
    id: "inv-004",
    invoiceNumber: "BILL-2024-101",
    type: "payable",
    entityName: "Dulux Paints South Africa",
    entityEmail: "finance.sa@dulux.com",
    entityPhone: "+27 11 861 1000",
    status: "unpaid",
    issueDate: "2024-01-08",
    dueDate: "2024-02-08",
    subtotal: 78000,
    vatAmount: 11700,
    totalAmount: 89700,
    amountPaid: 0,
    balanceDue: 89700,
    paymentTerms: "Net 30 Days",
    items: [
      { description: "Dulux Weathershield Bulk Factory Pallet (100 units)", sku: "DLX-WS-20L", quantity: 100, unitPrice: 780, taxRate: 15 },
    ],
    notes: "Monthly bulk factory replenishment purchase",
  },
  {
    id: "inv-005",
    invoiceNumber: "BILL-2024-102",
    type: "payable",
    entityName: "Powafix Chemicals & Solvents",
    entityEmail: "accounts@powafix.co.za",
    entityPhone: "+27 31 452 3000",
    status: "paid",
    issueDate: "2024-01-03",
    dueDate: "2024-01-17",
    subtotal: 14500,
    vatAmount: 2175,
    totalAmount: 16675,
    amountPaid: 16675,
    balanceDue: 0,
    paymentTerms: "Net 14 Days",
    items: [
      { description: "Powafix Mineral Turpentine 5L", sku: "POW-MIN-5L", quantity: 50, unitPrice: 150, taxRate: 15 },
      { description: "Powafix Lacquer Thinners 5L", sku: "POW-LT-5L", quantity: 50, unitPrice: 140, taxRate: 15 },
    ],
    notes: "Paid via bank EFT batch 402",
  },
  {
    id: "inv-006",
    invoiceNumber: "INV-2024-004",
    type: "receivable",
    entityName: "Kopanong Construction & Renovations",
    entityEmail: "tenders@kopanong-build.co.za",
    entityPhone: "+27 11 555 9012",
    status: "partially_paid",
    issueDate: "2024-01-12",
    dueDate: "2024-01-26",
    subtotal: 22000,
    vatAmount: 3300,
    totalAmount: 25300,
    amountPaid: 12000,
    balanceDue: 13300,
    paymentTerms: "Net 14 Days",
    items: [
      { description: "Plascon Micatex Exterior 20L", sku: "PLS-MIC-20L", quantity: 18, unitPrice: 1100, taxRate: 15 },
      { description: "Hamilton's Perfection Sash Cutters", sku: "HAM-SASH", quantity: 22, unitPrice: 100, taxRate: 15 },
    ],
    notes: "First milestone payment received",
  },
];
