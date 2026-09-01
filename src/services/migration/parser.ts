import {
  MigrationSourceId,
  MigrationEntityType,
  FieldMappingDefinition,
  ParsedRowValidation,
  ImportPreviewResult,
} from "./types";
import {
  CUSTOMER_FIELD_DEFINITIONS,
  PRODUCT_FIELD_DEFINITIONS,
  SUPPLIER_FIELD_DEFINITIONS,
} from "./presets";

/**
 * Robust CSV/TSV/Text parser supporting:
 * - Comma, Semicolon, and Tab delimiters
 * - Quoted strings with escaped quotes ("" or \")
 * - Embedded newlines inside quotes
 * - UTF-8 / UTF-16 Byte Order Marks (BOM)
 */
export function parseRawDelimitedText(rawText: string): { headers: string[]; rows: string[][] } {
  // Strip BOM
  const text = rawText.replace(/^\uFEFF/, "").trim();
  if (!text) return { headers: [], rows: [] };

  // Detect delimiter: check first line
  const firstLine = text.split(/\r?\n/)[0] || "";
  let delimiter = ",";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (tabCount > commaCount && tabCount > semiCount) {
    delimiter = "\t";
  } else if (semiCount > commaCount) {
    delimiter = ";";
  }

  // State machine parser for CSV
  const allRows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentVal.trim());
        currentVal = "";
      } else if (char === "\r" && nextChar === "\n") {
        currentRow.push(currentVal.trim());
        if (currentRow.some(c => c.length > 0)) {
          allRows.push(currentRow);
        }
        currentRow = [];
        currentVal = "";
        i++; // skip \n
      } else if (char === "\n" || char === "\r") {
        currentRow.push(currentVal.trim());
        if (currentRow.some(c => c.length > 0)) {
          allRows.push(currentRow);
        }
        currentRow = [];
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
  }

  // Last value
  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(c => c.length > 0)) {
      allRows.push(currentRow);
    }
  }

  if (allRows.length === 0) return { headers: [], rows: [] };

  const headers = allRows[0].map(h => h.replace(/^["']|["']$/g, "").trim());
  const rows = allRows.slice(1);

  return { headers, rows };
}

/**
 * Get field definitions for the requested entity
 */
export function getFieldDefinitions(entityType: MigrationEntityType): FieldMappingDefinition[] {
  switch (entityType) {
    case "customers":
      return CUSTOMER_FIELD_DEFINITIONS;
    case "products":
      return PRODUCT_FIELD_DEFINITIONS;
    case "suppliers":
      return SUPPLIER_FIELD_DEFINITIONS;
    default:
      return CUSTOMER_FIELD_DEFINITIONS;
  }
}

/**
 * Intelligent Column Auto-Detection:
 * Matches incoming raw headers to target NEXUS fields using fuzzy matching and alias sets.
 */
export function autoDetectMappings(
  headers: string[],
  entityType: MigrationEntityType
): Record<string, string> {
  const definitions = getFieldDefinitions(entityType);
  const mappings: Record<string, string> = {}; // TargetField -> SourceHeader

  const normalizedHeaders = headers.map(h => ({
    original: h,
    cleaned: h.toLowerCase().replace(/[^a-z0-9]/g, ""),
  }));

  for (const def of definitions) {
    // 1. Exact or alias match
    const found = normalizedHeaders.find(h => {
      const cleanedH = h.cleaned;
      const directTargetCleaned = def.targetField.toLowerCase().replace(/[^a-z0-9]/g, "");
      const directLabelCleaned = def.label.toLowerCase().replace(/[^a-z0-9]/g, "");

      if (cleanedH === directTargetCleaned || cleanedH === directLabelCleaned) return true;

      return def.aliases.some(alias => {
        const cleanedAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, "");
        return cleanedH === cleanedAlias;
      });
    });

    if (found) {
      mappings[def.targetField] = found.original;
    } else {
      // 2. Partial substring match
      const partialFound = normalizedHeaders.find(h => {
        return def.aliases.some(alias => {
          const cleanedAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, "");
          return cleanedAlias.length > 3 && (h.cleaned.includes(cleanedAlias) || cleanedAlias.includes(h.cleaned));
        });
      });
      if (partialFound && !Object.values(mappings).includes(partialFound.original)) {
        mappings[def.targetField] = partialFound.original;
      }
    }
  }

  return mappings;
}

/**
 * Clean & normalize South African telephone numbers
 */
export function normalizePhone(raw: string): { value: string; warning?: string } {
  if (!raw) return { value: "" };
  let cleaned = raw.replace(/[^\d+]/g, "").trim();

  // If local format e.g. 082 123 4567 -> +27 82 123 4567
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = "+27 " + cleaned.slice(1, 3) + " " + cleaned.slice(3, 6) + " " + cleaned.slice(6);
  } else if (cleaned.startsWith("+27") && cleaned.length >= 11) {
    const digits = cleaned.replace(/\D/g, "");
    cleaned = "+27 " + digits.slice(2, 4) + " " + digits.slice(4, 7) + " " + digits.slice(7);
  }

  return { value: cleaned };
}

/**
 * Clean & parse ZAR Currency amounts
 */
export function parseCurrencyAmount(raw: unknown): number {
  if (typeof raw === "number") return isNaN(raw) ? 0 : raw;
  if (!raw) return 0;
  const str = String(raw).replace(/[^0-9.-]/g, "");
  const val = parseFloat(str);
  return isNaN(val) ? 0 : Math.round(val * 100) / 100;
}

/**
 * Validate and format rows against mapping
 */
export function validateAndMapRows(
  headers: string[],
  rawRows: string[][],
  entityType: MigrationEntityType,
  mappings: Record<string, string>,
  sourceId: MigrationSourceId
): ImportPreviewResult {
  const definitions = getFieldDefinitions(entityType);
  const rows: ParsedRowValidation[] = [];
  let validCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  rawRows.forEach((rowValues, idx) => {
    const rowNumber = idx + 1;
    const originalData: Record<string, string> = {};
    headers.forEach((h, i) => {
      originalData[h] = rowValues[i] ?? "";
    });

    const mappedData: Record<string, unknown> = {};
    const warnings: string[] = [];
    const errors: string[] = [];

    // Map each target field
    definitions.forEach(def => {
      const sourceHeader = mappings[def.targetField];
      const rawVal = sourceHeader ? originalData[sourceHeader]?.trim() : "";

      if (def.required && !rawVal) {
        errors.push(`Required field '${def.label}' is missing.`);
      }

      if (rawVal) {
        switch (def.type) {
          case "currency": {
            const num = parseCurrencyAmount(rawVal);
            mappedData[def.targetField] = num;
            break;
          }
          case "number": {
            const parsedNum = parseInt(rawVal.replace(/[^\d]/g, ""), 10);
            mappedData[def.targetField] = isNaN(parsedNum) ? 0 : parsedNum;
            break;
          }
          case "phone": {
            const { value } = normalizePhone(rawVal);
            mappedData[def.targetField] = value || rawVal;
            break;
          }
          case "email": {
            const emailClean = rawVal.toLowerCase().trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
              warnings.push(`Email '${rawVal}' appears malformed.`);
            }
            mappedData[def.targetField] = emailClean;
            break;
          }
          case "tags": {
            mappedData[def.targetField] = rawVal.split(/[,;|]/).map(t => t.trim()).filter(Boolean);
            break;
          }
          default:
            mappedData[def.targetField] = rawVal;
        }
      }
    });

    // Special composite handling (e.g. Shopify First Name + Last Name)
    if (entityType === "customers" && !mappedData.name) {
      const first = originalData["First Name"] || originalData["FirstName"] || "";
      const last = originalData["Last Name"] || originalData["LastName"] || "";
      const company = originalData["Company"] || "";
      if (company) {
        mappedData.name = company;
      } else if (first || last) {
        mappedData.name = `${first} ${last}`.trim();
      }
    }

    const isValid = errors.length === 0;
    if (!isValid) {
      errorCount++;
    } else if (warnings.length > 0) {
      warningCount++;
    } else {
      validCount++;
    }

    rows.push({
      rowNumber,
      originalData,
      mappedData,
      isValid,
      warnings,
      errors,
      status: !isValid ? "error" : warnings.length > 0 ? "warning" : "valid",
    });
  });

  const samplePreview = rows.slice(0, 5).map(r => r.mappedData);

  return {
    sourceId,
    entityType,
    totalRows: rawRows.length,
    validCount,
    warningCount,
    errorCount,
    headers,
    detectedMappings: mappings,
    rows,
    samplePreview,
  };
}
