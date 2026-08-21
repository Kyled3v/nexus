// Core entity types used across all domains

export type ID = string;

export type Timestamp = string; // ISO 8601

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AuditedEntity extends BaseEntity {
  createdBy: ID;
  updatedBy: ID;
}

export type Status = 'active' | 'inactive' | 'archived';

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
};

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  province?: string;
  postalCode?: string;
  country: string;
};

export type ContactInfo = {
  phone?: string;
  email?: string;
  website?: string;
};

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SortOrder = 'asc' | 'desc';

export type SortParams = {
  field: string;
  order: SortOrder;
};

export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function err<T>(error: string): Result<T> {
  return { success: false, error };
}
