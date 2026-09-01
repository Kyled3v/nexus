export type MigrationSourceId =
  | "sage_pastel"
  | "quickbooks"
  | "xero"
  | "vend_lightspeed"
  | "shopify"
  | "omni_accounts"
  | "universal_csv";

export type MigrationEntityType =
  | "customers"
  | "products"
  | "suppliers"
  | "invoices";

export interface MigrationSourceConfig {
  id: MigrationSourceId;
  name: string;
  category: "accounting" | "erp" | "pos" | "ecommerce" | "generic";
  logoIcon: string;
  badgeText?: string;
  description: string;
  commonFileTypes: string[];
  supportedEntities: MigrationEntityType[];
  sampleFileName: string;
}

export interface FieldMappingDefinition {
  targetField: string;
  label: string;
  required: boolean;
  type: "string" | "number" | "email" | "phone" | "currency" | "tags" | "boolean" | "date";
  description: string;
  aliases: string[]; // Known header names from various software
}

export interface ParsedRowValidation {
  rowNumber: number;
  originalData: Record<string, string>;
  mappedData: Record<string, unknown>;
  isValid: boolean;
  warnings: string[];
  errors: string[];
  status: "valid" | "warning" | "error" | "duplicate";
}

export interface ImportPreviewResult {
  sourceId: MigrationSourceId;
  entityType: MigrationEntityType;
  totalRows: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  headers: string[];
  detectedMappings: Record<string, string>; // TargetField -> SourceHeader
  rows: ParsedRowValidation[];
  samplePreview: Record<string, unknown>[];
}

export interface BatchImportOptions {
  duplicateStrategy: "skip" | "update" | "create_new";
  defaultPaymentTermsDays?: number;
  defaultTaxRate?: number;
  defaultBranchId?: string;
  tagWithSource?: boolean;
}

export interface BatchImportResult {
  success: boolean;
  entityType: MigrationEntityType;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  errors: { row: number; identifier: string; message: string }[];
  importedIds: string[];
  auditBatchId: string;
  message: string;
}
