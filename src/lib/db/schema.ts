import {
  pgTable, uuid, text, boolean, integer,
  numeric, timestamp, jsonb, uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
};

// ============================================================
// ORGANISATIONS
// ============================================================
export const organisations = pgTable("organisations", {
  id:          uuid("id").primaryKey().defaultRandom(),
  name:        text("name").notNull(),
  tradingName: text("trading_name"),
  slug:        text("slug").notNull().unique(),
  plan:        text("plan").notNull().default("starter"),
  status:      text("status").notNull().default("active"),
  logoUrl:     text("logo_url"),
  settings:    jsonb("settings").notNull().default({}),
  ...timestamps,
});

// ============================================================
// BRANCHES
// ============================================================
export const branches = pgTable("branches", {
  id:             uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  name:           text("name").notNull(),
  code:           text("code").notNull(),
  isHeadOffice:   boolean("is_head_office").notNull().default(false),
  address:        jsonb("address").notNull().default({}),
  contact:        jsonb("contact").notNull().default({}),
  status:         text("status").notNull().default("active"),
  ...timestamps,
});

// ============================================================
// BETTER AUTH TABLES
// ============================================================
export const user = pgTable("user", {
  id:            text("id").primaryKey(),
  name:          text("name").notNull(),
  email:         text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image:         text("image"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id:             text("id").primaryKey(),
  expiresAt:      timestamp("expires_at").notNull(),
  token:          text("token").notNull().unique(),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
  ipAddress:      text("ip_address"),
  userAgent:      text("user_agent"),
  userId:         text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  activeOrganisationId: text("active_organisation_id"),
});

export const account = pgTable("account", {
  id:                   text("id").primaryKey(),
  accountId:            text("account_id").notNull(),
  providerId:           text("provider_id").notNull(),
  userId:               text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken:          text("access_token"),
  refreshToken:         text("refresh_token"),
  idToken:              text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt:timestamp("refresh_token_expires_at"),
  scope:                text("scope"),
  password:             text("password"),
  createdAt:            timestamp("created_at").notNull().defaultNow(),
  updatedAt:            timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id:         text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value:      text("value").notNull(),
  expiresAt:  timestamp("expires_at").notNull(),
  createdAt:  timestamp("created_at").defaultNow(),
  updatedAt:  timestamp("updated_at").defaultNow(),
});

// ============================================================
// USER PROFILES (links Better Auth user to organisation)
// ============================================================
export const userProfiles = pgTable("user_profiles", {
  id:             uuid("id").primaryKey().defaultRandom(),
  userId:         text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  role:           text("role").notNull().default("owner"),
  branchId:       uuid("branch_id").references(() => branches.id),
  permissions:    text("permissions").array().notNull().default([]),
  status:         text("status").notNull().default("active"),
  ...timestamps,
});

// ============================================================
// MODULE ENTITLEMENTS
// ============================================================
export const moduleEntitlements = pgTable("module_entitlements", {
  id:             uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }).unique(),
  enabledModules: text("enabled_modules").array().notNull().default([]),
  customLimits:   jsonb("custom_limits").notNull().default({}),
  licensedUntil:  timestamp("licensed_until"),
  ...timestamps,
});

// ============================================================
// PRODUCTS
// ============================================================
export const products = pgTable("products", {
  id:             uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  sku:            text("sku").notNull(),
  barcode:        text("barcode"),
  name:           text("name").notNull(),
  description:    text("description"),
  categoryId:     uuid("category_id"),
  brandId:        uuid("brand_id"),
  unit:           text("unit").notNull().default("Each"),
  costPrice:      numeric("cost_price", { precision: 12, scale: 2 }).notNull().default("0"),
  sellingPrice:   numeric("selling_price", { precision: 12, scale: 2 }).notNull().default("0"),
  taxRate:        numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("15"),
  taxInclusive:   boolean("tax_inclusive").notNull().default(true),
  supplierId:     uuid("supplier_id"),
  reorderLevel:   integer("reorder_level").notNull().default(0),
  targetStock:    integer("target_stock").notNull().default(0),
  minStock:       integer("min_stock").notNull().default(0),
  maxStock:       integer("max_stock").notNull().default(0),
  status:         text("status").notNull().default("active"),
  imageUrl:       text("image_url"),
  attributes:     jsonb("attributes").notNull().default({}),
  ...timestamps,
});

// ============================================================
// INVENTORY
// ============================================================
export const inventory = pgTable("inventory", {
  id:             uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  branchId:       uuid("branch_id").notNull().references(() => branches.id, { onDelete: "cascade" }),
  productId:      uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  currentStock:   integer("current_stock").notNull().default(0),
  reservedStock:  integer("reserved_stock").notNull().default(0),
  lastMovementAt: timestamp("last_movement_at").notNull().defaultNow(),
  ...timestamps,
});

// ============================================================
// CUSTOMERS
// ============================================================
export const customers = pgTable("customers", {
  id:                 uuid("id").primaryKey().defaultRandom(),
  organisationId:     uuid("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  name:               text("name").notNull(),
  email:              text("email"),
  phone:              text("phone"),
  address:            text("address"),
  taxNumber:          text("tax_number"),
  status:             text("status").notNull().default("active"),
  tags:               text("tags").array().notNull().default([]),
  notes:              text("notes"),
  totalSpend:         numeric("total_spend", { precision: 12, scale: 2 }).notNull().default("0"),
  transactionCount:   integer("transaction_count").notNull().default(0),
  lastPurchaseAt:     timestamp("last_purchase_at"),
  creditLimit:        numeric("credit_limit", { precision: 12, scale: 2 }),
  outstandingBalance: numeric("outstanding_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  ...timestamps,
});

// ============================================================
// LEADS
// ============================================================
export const leads = pgTable("leads", {
  id:             uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  name:           text("name").notNull(),
  company:        text("company"),
  email:          text("email"),
  phone:          text("phone"),
  source:         text("source").notNull(),
  stage:          text("stage").notNull().default("new"),
  estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 }).notNull().default("0"),
  ownerId:        text("owner_id"),
  customerId:     uuid("customer_id").references(() => customers.id),
  notes:          text("notes"),
  followUpAt:     timestamp("follow_up_at"),
  wonAt:          timestamp("won_at"),
  lostAt:         timestamp("lost_at"),
  lostReason:     text("lost_reason"),
  ...timestamps,
});

// ============================================================
// SALES
// ============================================================
export const sales = pgTable("sales", {
  id:             uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  branchId:       uuid("branch_id").notNull().references(() => branches.id),
  tillId:         text("till_id").notNull(),
  saleNumber:     text("sale_number").notNull(),
  customerId:     uuid("customer_id").references(() => customers.id),
  cashierId:      text("cashier_id").notNull(),
  status:         text("status").notNull().default("pending"),
  subtotal:       numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  taxAmount:      numeric("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  total:          numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  notes:          text("notes"),
  completedAt:    timestamp("completed_at"),
  ...timestamps,
});

// ============================================================
// AUDIT LOGS
// ============================================================
export const auditLogs = pgTable("audit_logs", {
  id:             uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  branchId:       uuid("branch_id"),
  userId:         text("user_id").notNull(),
  userRole:       text("user_role").notNull(),
  action:         text("action").notNull(),
  entityType:     text("entity_type").notNull(),
  entityId:       uuid("entity_id").notNull(),
  description:    text("description").notNull(),
  beforeState:    jsonb("before_state"),
  afterState:     jsonb("after_state"),
  source:         text("source").notNull().default("user"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// NOTIFICATIONS
// ============================================================
export const notifications = pgTable("notifications", {
  id:             uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  userId:         text("user_id"),
  type:           text("type").notNull(),
  category:       text("category").notNull(),
  title:          text("title").notNull(),
  message:        text("message").notNull(),
  read:           boolean("read").notNull().default(false),
  actionUrl:      text("action_url"),
  actionLabel:    text("action_label"),
  expiresAt:      timestamp("expires_at"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// RELATIONS
// ============================================================
export const organisationsRelations = relations(organisations, ({ many }) => ({
  branches:           many(branches),
  userProfiles:       many(userProfiles),
  moduleEntitlements: many(moduleEntitlements),
  products:           many(products),
  customers:          many(customers),
  leads:              many(leads),
  sales:              many(sales),
  auditLogs:          many(auditLogs),
  notifications:      many(notifications),
}));

export const branchesRelations = relations(branches, ({ one }) => ({
  organisation: one(organisations, { fields: [branches.organisationId], references: [organisations.id] }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  organisation: one(organisations, { fields: [userProfiles.organisationId], references: [organisations.id] }),
  user:         one(user, { fields: [userProfiles.userId], references: [user.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  organisation: one(organisations, { fields: [products.organisationId], references: [organisations.id] }),
  inventory:    many(inventory),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  organisation: one(organisations, { fields: [inventory.organisationId], references: [organisations.id] }),
  branch:       one(branches,      { fields: [inventory.branchId],       references: [branches.id] }),
  product:      one(products,      { fields: [inventory.productId],       references: [products.id] }),
}));

export const customersRelations = relations(customers, ({ one }) => ({
  organisation: one(organisations, { fields: [customers.organisationId], references: [organisations.id] }),
}));

// ============================================================
// SALE ITEMS
// ============================================================
export const saleItems = pgTable("sale_items", {
  id:             uuid("id").primaryKey().defaultRandom(),
  saleId:         uuid("sale_id").notNull().references(() => sales.id, { onDelete: "cascade" }),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  productId:      uuid("product_id").references(() => products.id),
  sku:            text("sku").notNull(),
  name:           text("name").notNull(),
  quantity:       integer("quantity").notNull().default(1),
  unitPrice:      numeric("unit_price",       { precision: 12, scale: 2 }).notNull().default("0"),
  taxRate:        numeric("tax_rate",         { precision: 5,  scale: 2 }).notNull().default("15"),
  taxAmount:      numeric("tax_amount",       { precision: 12, scale: 2 }).notNull().default("0"),
  discountPct:    numeric("discount_pct",     { precision: 5,  scale: 2 }).notNull().default("0"),
  discountAmount: numeric("discount_amount",  { precision: 12, scale: 2 }).notNull().default("0"),
  lineTotal:      numeric("line_total",       { precision: 12, scale: 2 }).notNull().default("0"),
  ...timestamps,
});

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale:         one(sales,         { fields: [saleItems.saleId],         references: [sales.id] }),
  organisation: one(organisations, { fields: [saleItems.organisationId], references: [organisations.id] }),
  product:      one(products,      { fields: [saleItems.productId],      references: [products.id] }),
}));
