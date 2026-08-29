// Multi-business extension schema
// Users can belong to multiple organisations
// This extends the base schema for multi-tenancy

import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./schema";
import { organisations } from "./schema";

// User can belong to multiple organisations
export const userOrganisationMemberships = pgTable("user_organisation_memberships", {
  id:             uuid("id").primaryKey().defaultRandom(),
  userId:         text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id, { onDelete: "cascade" }),
  role:           text("role").notNull().default("owner"),
  isDefault:      boolean("is_default").notNull().default(false),
  status:         text("status").notNull().default("active"),
  invitedBy:      text("invited_by"),
  joinedAt:       timestamp("joined_at").notNull().defaultNow(),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
});

// Active organisation per session (which business is currently active)
export const userActiveOrganisation = pgTable("user_active_organisation", {
  userId:         text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  organisationId: uuid("organisation_id").notNull().references(() => organisations.id),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
});

export const userOrganisationMembershipsRelations = relations(userOrganisationMemberships, ({ one }) => ({
  user:         one(user,          { fields: [userOrganisationMemberships.userId],         references: [user.id] }),
  organisation: one(organisations, { fields: [userOrganisationMemberships.organisationId], references: [organisations.id] }),
}));
