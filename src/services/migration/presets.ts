import { MigrationSourceConfig, MigrationSourceId, MigrationEntityType, FieldMappingDefinition } from "./types";

export const MIGRATION_SOURCES: MigrationSourceConfig[] = [
  {
    id: "sage_pastel",
    name: "Sage Pastel / Sage Evolution / Sage 50",
    category: "accounting",
    logoIcon: "Layers",
    badgeText: "South Africa Standard",
    description: "Import customer master files, debitor accounts, inventory items, and supplier lists exported as CSV, TXT, or Excel from Sage.",
    commonFileTypes: [".csv", ".txt", ".xlsx"],
    supportedEntities: ["customers", "products", "suppliers", "invoices"],
    sampleFileName: "sage_pastel_customers_export.csv",
  },
  {
    id: "quickbooks",
    name: "QuickBooks (Online & Desktop)",
    category: "accounting",
    logoIcon: "DollarSign",
    badgeText: "Intuit QBO / QBD",
    description: "Direct CSV export mapping for QuickBooks Customer Contact Lists, Item Lists, and Vendor master files.",
    commonFileTypes: [".csv", ".xlsx", ".iif"],
    supportedEntities: ["customers", "products", "suppliers", "invoices"],
    sampleFileName: "quickbooks_customers_report.csv",
  },
  {
    id: "xero",
    name: "Xero Accounting",
    category: "accounting",
    logoIcon: "FileText",
    badgeText: "Xero CSV",
    description: "Native mapping for Xero Contacts export, Inventory Items, and Sales Invoices with tax-inclusive pricing.",
    commonFileTypes: [".csv"],
    supportedEntities: ["customers", "products", "suppliers", "invoices"],
    sampleFileName: "xero_contacts_export.csv",
  },
  {
    id: "vend_lightspeed",
    name: "Vend / Lightspeed POS",
    category: "pos",
    logoIcon: "ShoppingCart",
    badgeText: "Retail POS",
    description: "Import POS customer customer records, loyalty tags, barcode inventories, and variants.",
    commonFileTypes: [".csv"],
    supportedEntities: ["customers", "products", "suppliers"],
    sampleFileName: "vend_customers_export.csv",
  },
  {
    id: "shopify",
    name: "Shopify / WooCommerce",
    category: "ecommerce",
    logoIcon: "Globe",
    badgeText: "E-Commerce",
    description: "Import online store customers, order histories, SKUs, and stock quantities directly into NEXUS ERP.",
    commonFileTypes: [".csv"],
    supportedEntities: ["customers", "products"],
    sampleFileName: "shopify_customers_export.csv",
  },
  {
    id: "omni_accounts",
    name: "Omni Accounts / IQ Retail / Palladium",
    category: "erp",
    logoIcon: "Building2",
    badgeText: "SA Trade ERP",
    description: "Designed for South African wholesale & hardware retail systems with contractor pricing tiers.",
    commonFileTypes: [".csv", ".txt"],
    supportedEntities: ["customers", "products", "suppliers"],
    sampleFileName: "omni_debtor_master.csv",
  },
  {
    id: "universal_csv",
    name: "Universal Excel / CSV / Pasted Table",
    category: "generic",
    logoIcon: "Sparkles",
    badgeText: "AI Smart Match",
    description: "Upload any custom spreadsheet or paste tabular data directly from Microsoft Excel or Google Sheets.",
    commonFileTypes: [".csv", ".tsv", ".txt", ".json"],
    supportedEntities: ["customers", "products", "suppliers", "invoices"],
    sampleFileName: "universal_customer_template.csv",
  },
];

// Target Schema Definitions per entity type
export const CUSTOMER_FIELD_DEFINITIONS: FieldMappingDefinition[] = [
  {
    targetField: "name",
    label: "Customer / Company Name",
    required: true,
    type: "string",
    description: "Full trade name, trading name, or company title",
    aliases: [
      "name", "customer name", "company", "company name", "trading name",
      "customer", "client", "client name", "business name", "account name",
      "cust_name", "custname", "cust_desc", "description", "full name",
      "customer/company", "display name"
    ],
  },
  {
    targetField: "accountNumber",
    label: "Account Number / Code",
    required: false,
    type: "string",
    description: "Unique debtor code or reference (e.g. CUST001, ACM001)",
    aliases: [
      "account number", "acc no", "acc_no", "account_no", "cust_code",
      "customer code", "code", "debtor code", "account id", "customer id",
      "cust id", "ref", "reference", "sage_acc", "card id"
    ],
  },
  {
    targetField: "email",
    label: "Email Address",
    required: false,
    type: "email",
    description: "Primary billing, accounts, or contact email",
    aliases: [
      "email", "e-mail", "email address", "e-mail address", "contact email",
      "billing email", "accounts email", "mail", "cust_email", "e_mail"
    ],
  },
  {
    targetField: "phone",
    label: "Telephone / Mobile",
    required: false,
    type: "phone",
    description: "Primary South African or international contact phone number",
    aliases: [
      "phone", "telephone", "tel", "tel no", "tel_no", "phone number",
      "cell", "mobile", "cell phone", "mobile phone", "contact number",
      "phone 1", "work phone", "cust_tel", "primary phone"
    ],
  },
  {
    targetField: "taxNumber",
    label: "SARS VAT / Tax Registration Number",
    required: false,
    type: "string",
    description: "South African 10-digit VAT registration number",
    aliases: [
      "tax number", "tax_number", "vat number", "vat_number", "vat no",
      "vat_no", "sars vat", "tax reg", "tax registration", "vat registration",
      "tax_id", "vat id", "vat reg no", "tax_no"
    ],
  },
  {
    targetField: "creditLimit",
    label: "Credit Limit (ZAR)",
    required: false,
    type: "currency",
    description: "Authorized maximum credit facility in Rands",
    aliases: [
      "credit limit", "credit_limit", "credit", "limit", "max credit",
      "credit facility", "terms limit", "authorized credit", "credit_limit_zar"
    ],
  },
  {
    targetField: "paymentTerms",
    label: "Payment Terms (Days)",
    required: false,
    type: "number",
    description: "Standard settlement period in days (e.g. 30, 60, 15, 7)",
    aliases: [
      "payment terms", "payment_terms", "terms", "terms days", "credit terms",
      "days", "due days", "term", "payment terms (days)", "terms (days)"
    ],
  },
  {
    targetField: "address",
    label: "Physical / Delivery Address",
    required: false,
    type: "string",
    description: "Street address, suburb, city, and postal code",
    aliases: [
      "address", "physical address", "delivery address", "billing address",
      "street", "street address", "address 1", "addr1", "postal address",
      "location", "site address", "address line 1"
    ],
  },
  {
    targetField: "outstandingBalance",
    label: "Opening / Current Balance (ZAR)",
    required: false,
    type: "currency",
    description: "Current ledger balance owed by customer",
    aliases: [
      "balance", "outstanding balance", "balance due", "current balance",
      "opening balance", "amount due", "outstanding", "debtor balance",
      "total due", "bal_due"
    ],
  },
  {
    targetField: "tags",
    label: "Customer Category / Tier / Tags",
    required: false,
    type: "tags",
    description: "Customer classification (e.g. Contractor, Retail, Trade, VIP)",
    aliases: [
      "tags", "category", "customer group", "group", "tier", "customer tier",
      "classification", "type", "customer type", "price list", "segment"
    ],
  },
  {
    targetField: "notes",
    label: "Internal Notes",
    required: false,
    type: "string",
    description: "Special instructions, discount agreements, or contact notes",
    aliases: [
      "notes", "memo", "comments", "description", "remarks", "special terms"
    ],
  },
];

export const PRODUCT_FIELD_DEFINITIONS: FieldMappingDefinition[] = [
  {
    targetField: "sku",
    label: "SKU / Item Code",
    required: true,
    type: "string",
    description: "Unique product identifier or inventory code",
    aliases: ["sku", "item code", "code", "product code", "item_code", "part number", "item_no", "item no", "sage_code"],
  },
  {
    targetField: "name",
    label: "Product Name / Description",
    required: true,
    type: "string",
    description: "Full product title or sales description",
    aliases: ["name", "product name", "item description", "description", "title", "product title", "desc", "item name"],
  },
  {
    targetField: "barcode",
    label: "Barcode / EAN / UPC",
    required: false,
    type: "string",
    description: "Scannable 13-digit EAN/UPC barcode",
    aliases: ["barcode", "ean", "upc", "barcode_no", "gtin", "scancode"],
  },
  {
    targetField: "sellingPrice",
    label: "Selling Price (ZAR)",
    required: true,
    type: "currency",
    description: "Retail selling price per unit",
    aliases: ["selling price", "price", "retail price", "unit price", "price excl", "price incl", "selling_price", "sales price"],
  },
  {
    targetField: "costPrice",
    label: "Cost Price (ZAR)",
    required: false,
    type: "currency",
    description: "Supplier purchase cost per unit",
    aliases: ["cost price", "cost", "purchase cost", "supplier cost", "avg cost", "unit cost", "cost_price"],
  },
  {
    targetField: "currentStock",
    label: "Opening Stock Quantity",
    required: false,
    type: "number",
    description: "Current on-hand physical stock quantity",
    aliases: ["current stock", "stock", "quantity", "qty", "on hand", "qty on hand", "quantity on hand", "stock on hand", "opening stock"],
  },
  {
    targetField: "categoryName",
    label: "Category",
    required: false,
    type: "string",
    description: "Product department or category (e.g. Paint, Primers, Tools)",
    aliases: ["category", "category name", "department", "group", "item group", "product group"],
  },
  {
    targetField: "brandName",
    label: "Brand / Manufacturer",
    required: false,
    type: "string",
    description: "Brand name (e.g. Dulux, Plascon, Rust-Oleum)",
    aliases: ["brand", "brand name", "manufacturer", "make", "vendor"],
  },
  {
    targetField: "reorderLevel",
    label: "Reorder Point",
    required: false,
    type: "number",
    description: "Minimum threshold to trigger automated replenishment",
    aliases: ["reorder level", "reorder point", "min level", "min stock", "reorder_level"],
  },
];

export const SUPPLIER_FIELD_DEFINITIONS: FieldMappingDefinition[] = [
  {
    targetField: "name",
    label: "Supplier Name",
    required: true,
    type: "string",
    description: "Company or distributor name",
    aliases: ["name", "supplier name", "vendor", "vendor name", "company", "creditor name", "supplier"],
  },
  {
    targetField: "email",
    label: "Contact Email",
    required: false,
    type: "email",
    description: "Supplier ordering or accounts email",
    aliases: ["email", "e-mail", "supplier email", "order email", "contact email"],
  },
  {
    targetField: "phone",
    label: "Telephone",
    required: false,
    type: "phone",
    description: "Direct supplier trade desk telephone",
    aliases: ["phone", "telephone", "tel", "tel no", "phone number", "contact number"],
  },
  {
    targetField: "taxNumber",
    label: "SARS VAT Registration",
    required: false,
    type: "string",
    description: "Supplier SARS 10-digit VAT registration",
    aliases: ["tax number", "vat number", "vat no", "tax_number", "sars vat", "vat reg"],
  },
  {
    targetField: "paymentTerms",
    label: "Payment Terms (Days)",
    required: false,
    type: "number",
    description: "Settlement terms (e.g. 30, 60 days)",
    aliases: ["payment terms", "terms", "terms days", "credit terms"],
  },
];

// Sample Datasets for 1-Click Instant Testing
export const SAMPLE_MIGRATION_DATA: Record<MigrationSourceId, Record<MigrationEntityType, string>> = {
  sage_pastel: {
    customers: `Account Code,Customer Description,Telephone,E-mail Address,VAT Registration No,Credit Limit,Payment Terms,Physical Address 1,Current Balance,Category
ACME001,Acme Construction & Renovations Ltd,011 555 4910,accounts@acmecon.co.za,4990123456,75000.00,30,14 Commerce Crescent Sandton,18450.00,Contractor
APEX002,Apex Commercial Decorators,011 555 8821,info@apexdecor.co.za,4880987654,50000.00,30,88 Main Reef Road Industria,0.00,Contractor
HIGH003,Highveld Property Solutions,012 555 3344,purchasing@highveldprop.co.za,4770112233,35000.00,15,45 Pretorius St Pretoria,9200.00,Commercial
CAPE004,Cape Coast Painting & Waterproofing,021 555 7711,orders@capecoatings.co.za,4660334455,100000.00,60,12 Paarden Eiland Rd Cape Town,42100.00,VIP Trade
MOD005,Modern Home Interiors & DIY,082 555 9012,hello@modernhomediy.co.za,,10000.00,7,210 Jan Smuts Ave Rosebank,0.00,Retail`,
    products: `Item Code,Item Description,Barcode,Selling Price,Cost Price,Quantity On Hand,Category,Reorder Level
DUL-WEATH-20L,Dulux Weathershield Exterior 20L White,6001234567890,1850.00,1050.00,48,Exterior Paint,15
PLA-VELV-5L,Plascon Velvaglo Polyurethane Enamel 5L,6009876543210,649.00,380.00,24,Enamels & Trims,8
RUST-PRIM-1L,Rust-Oleum High Performance Metal Primer 1L,6005556667778,245.00,135.00,67,Primers,20
ACAD-ROLR-SET,Academy Contractor Roller & Tray Set 225mm,6004443332221,189.00,95.00,120,Brushware & Tools,30`,
    suppliers: `Supplier Code,Supplier Name,E-mail Address,Telephone,VAT Registration No,Payment Terms
AKZ001,AkzoNobel Coatings South Africa,orders@akzonobel.co.za,011 861 0300,4110192834,30
PLA002,Kansai Plascon Africa Ltd,tradeorders@plascon.co.za,011 951 4500,4220918273,60
RST003,Rust-Oleum RSA Distribution,sales@rustoleumsa.co.za,011 444 8900,4330182736,30`,
    invoices: `Invoice No,Date,Customer Code,Subtotal,VAT Amount,Total Amount,Status
INV-2024-001,2024-08-01,ACME001,16043.48,2406.52,18450.00,Overdue
INV-2024-002,2024-08-15,HIGH003,8000.00,1200.00,9200.00,Due
INV-2024-003,2024-08-20,CAPE004,36608.70,5491.30,42100.00,Due`,
  },
  quickbooks: {
    customers: `Customer,Company,Email,Phone,Tax ID,Credit Limit,Terms,Billing Address,Balance
"Smith, John","Summit Builders","john@summitbuilders.co.za","083 555 1199","4910293847","40000","Net 30","19 Rivonia Road, Sandton","12500"
"Pretorius, Andre","Pretoria Waterproofing Pros","andre@pretoriaproof.co.za","012 555 8890","4820394857","60000","Net 30","99 Lynnwood Rd, Pretoria","0"
"Naidoo, Rajen","Durban Coastal Paint & Plaster","rajen@coastalpaint.co.za","031 555 4433","4730495867","80000","Net 60","5 Umgeni Rd, Durban","28900"
"Van der Merwe, Johan","Eco Green Coatings","johan@ecogreen.co.za","082 555 7766","","15000","Net 15","74 Stellenbosch Arterial, Cape Town","0"`,
    products: `Item,Description,UPC,Sales Price,Cost,Quantity On Hand,Product Category,Reorder Point
"Dulux Weathershield 20L","Dulux Weathershield Exterior Acrylic 20L White","6001234567890","1850.00","1050.00","48","Exterior Acrylics","15"
"Plascon Velvaglo 5L","Plascon Velvaglo Satin White 5L","6009876543210","649.00","380.00","24","Enamels","8"
"Rust-Oleum Primer 1L","Rust-Oleum Clean Metal Primer 1L","6005556667778","245.00","135.00","67","Primers","20"`,
    suppliers: `Vendor,Company,Email,Phone,Tax Reg,Terms
"AkzoNobel SA","AkzoNobel Coatings South Africa","orders@akzonobel.co.za","011 861 0300","4110192834","Net 30"
"Plascon Paints","Kansai Plascon Africa Ltd","tradeorders@plascon.co.za","011 951 4500","4220918273","Net 60"`,
    invoices: `Invoice No,Date,Customer,Subtotal,Tax,Total,Status
"QBO-1001","2024-08-05","Summit Builders","10869.57","1630.43","12500.00","Overdue"
"QBO-1002","2024-08-18","Durban Coastal Paint & Plaster","25130.43","3769.57","28900.00","Due"`,
  },
  xero: {
    customers: `ContactName,AccountNumber,EmailAddress,PhoneNumber,TaxNumber,CreditLimit,PaymentTermsDays,PostalAddress,Balance,Group
"Benchmark Renovators","BM001","accounts@benchmarkreno.co.za","+27 11 555 9988","4950192837","50000","30","12 Kelvin Drive Sandton","15400.00","Contractor"
"Elite Industrial Coatings","EIC002","finance@elitecoatings.co.za","+27 11 555 7766","4860283948","120000","60","33 Power St Germiston","65000.00","Key Account"
"Sandton DIY Studio","SAN003","info@sandtondiy.co.za","+27 82 555 3322","","20000","15","140 Grayston Dr Sandton","0.00","Retail Trade"`,
    products: `ItemCode,ItemName,Barcode,UnitPrice,CostPrice,TotalOnHand,InventoryCategory,MinStock
"DUL-WEATH-20L","Dulux Weathershield Exterior 20L White","6001234567890","1850.00","1050.00","48","Exterior Paint","15"
"PLA-VELV-5L","Plascon Velvaglo Polyurethane 5L","6009876543210","649.00","380.00","24","Enamels","8"`,
    suppliers: `ContactName,EmailAddress,PhoneNumber,TaxNumber,PaymentTermsDays
"AkzoNobel SA","orders@akzonobel.co.za","011 861 0300","4110192834","30"
"Plascon Africa","tradeorders@plascon.co.za","011 951 4500","4220918273","60"`,
    invoices: `InvoiceNumber,Date,ContactName,Subtotal,Tax,Total,Status
"XERO-881","2024-08-10","Benchmark Renovators","13391.30","2008.70","15400.00","Due"
"XERO-882","2024-08-12","Elite Industrial Coatings","56521.74","8478.26","65000.00","Overdue"`,
  },
  vend_lightspeed: {
    customers: `customer_name,customer_code,email,mobile,tax_number,credit_limit,address,customer_group
"ProCoat Paint Masters","PRO01","info@procoat.co.za","083 444 5566","4930192847","35000","15 Spartan Rd Kempton Park","Contractors"
"Urban Living Projects","URB02","projects@urbanliving.co.za","082 333 4455","4840293847","45000","80 Oxford Rd Rosebank","Trade"`,
    products: `sku,handle,name,retail_price,supply_price,count,category_name,barcode
"DUL-20L","dulux-weathershield-20l","Dulux Weathershield 20L","1850.00","1050.00","48","Paint","6001234567890"`,
    suppliers: `supplier_name,email,phone,tax_no
"AkzoNobel RSA","orders@akzonobel.co.za","011 861 0300","4110192834"`,
    invoices: ``,
  },
  shopify: {
    customers: `First Name,Last Name,Email,Phone,Company,Address1,Total Spent,Orders Count,Tags
"David","Botha","david@bothacarpentry.co.za","+27825551234","Botha Fine Carpentry","12 Waterfall Way Midrand","18900.00","6","Trade, VIP"
"Sarah","Jenkins","sarah.jenkins@designstudio.co.za","+27835559876","Jenkins Interior Architecture","44 Illovo Blvd Illovo","34500.00","12","Specifier, Contractor"`,
    products: `Handle,Title,Variant SKU,Variant Barcode,Variant Price,Variant Cost,Variant Inventory Qty,Type
"dulux-weathershield-20l","Dulux Weathershield 20L White","DUL-WEATH-20L","6001234567890","1850.00","1050.00","48","Exterior Paint"`,
    suppliers: ``,
    invoices: ``,
  },
  omni_accounts: {
    customers: `Debtor Code,Debtor Name,Tel No,Email Address,VAT No,Credit Limit,Terms (Days),Street Address,Current Bal,Price Group
"OMN-001","Sandton Commercial Painting Pty","011 555 7700","accounts@sandtonpaint.co.za","4990887766","80000","30","22 West St Sandton","22400.00","Contractor A"
"OMN-002","Highland Refurbishments CC","011 555 8811","info@highlandrefurb.co.za","4880776655","40000","30","55 Bezuidenhout St Troyeville","14800.00","Contractor B"`,
    products: `Stock Code,Description,Barcode,Selling Price Excl,Cost Price,Physical Qty,Dept,Min Level
"DUL-20L","Dulux Weathershield 20L","6001234567890","1608.70","1050.00","48","PAINT","15"`,
    suppliers: `Creditor Code,Creditor Name,Email,Telephone,VAT Reg No,Terms
"SUP-AKZ","AkzoNobel Coatings SA","orders@akzonobel.co.za","011 861 0300","4110192834","30"`,
    invoices: ``,
  },
  universal_csv: {
    customers: `Customer Name,Account Number,Email,Phone,SARS VAT Number,Credit Limit (ZAR),Payment Terms Days,Physical Address,Opening Balance,Category
"Acme Construction Ltd","ACME001","accounts@acmecon.co.za","011 555 4910","4990123456","75000","30","14 Commerce Crescent Sandton","18450","Contractor"
"Apex Paint & Decorators","APEX002","info@apexdecor.co.za","011 555 8821","4880987654","50000","30","88 Main Reef Road Industria","0","Contractor"
"Highveld Renovation CC","HIGH003","purchasing@highveldprop.co.za","012 555 3344","4770112233","35000","15","45 Pretorius St Pretoria","9200","Commercial"
"Modern Living Rosebank","MOD005","hello@modernhomediy.co.za","082 555 9012","","10000","7","210 Jan Smuts Ave Rosebank","0","Retail"`,
    products: `SKU,Product Name,Barcode,Selling Price,Cost Price,Current Stock,Category,Brand,Reorder Level
"DUL-WEATH-20L","Dulux Weathershield Exterior 20L White","6001234567890","1850.00","1050.00","48","Exterior Paint","Dulux","15"
"PLA-VELV-5L","Plascon Velvaglo Polyurethane 5L","6009876543210","649.00","380.00","24","Enamels","Plascon","8"
"RUST-PRIM-1L","Rust-Oleum Metal Primer 1L","6005556667778","245.00","135.00","67","Primers","Rust-Oleum","20"`,
    suppliers: `Supplier Name,Email,Phone,SARS VAT Number,Payment Terms Days
"AkzoNobel Coatings South Africa","orders@akzonobel.co.za","011 861 0300","4110192834","30"
"Kansai Plascon Africa Ltd","tradeorders@plascon.co.za","011 951 4500","4220918273","60"`,
    invoices: `Invoice Number,Date,Customer Name,Subtotal,VAT Amount,Total Amount,Status
"INV-2024-001","2024-08-01","Acme Construction Ltd","16043.48","2406.52","18450.00","Overdue"
"INV-2024-002","2024-08-15","Highveld Renovation CC","8000.00","1200.00","9200.00","Due"`,
  },
};
