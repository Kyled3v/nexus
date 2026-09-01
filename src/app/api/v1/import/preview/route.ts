import { NextResponse } from "next/server";
import {
  parseRawDelimitedText,
  autoDetectMappings,
  validateAndMapRows,
} from "@/services/migration/parser";
import { MigrationSourceId, MigrationEntityType } from "@/services/migration/types";
import { SAMPLE_MIGRATION_DATA } from "@/services/migration/presets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sourceId: MigrationSourceId = body.sourceId || "universal_csv";
    const entityType: MigrationEntityType = body.entityType || "customers";
    let rawText: string = body.rawText || "";
    const customMappings: Record<string, string> | undefined = body.mappings;

    // Fallback to sample data if requested or empty
    if (!rawText.trim() && body.useSample) {
      const sourceSamples = SAMPLE_MIGRATION_DATA[sourceId] || SAMPLE_MIGRATION_DATA.universal_csv;
      rawText = sourceSamples[entityType] || "";
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "No data content or file provided for preview" },
        { status: 400 }
      );
    }

    const { headers, rows } = parseRawDelimitedText(rawText);

    if (headers.length === 0 || rows.length === 0) {
      return NextResponse.json(
        { error: "Could not detect tabular columns. Please check your CSV/file format." },
        { status: 400 }
      );
    }

    // Determine column mappings (custom override or automatic detection)
    const activeMappings = customMappings && Object.keys(customMappings).length > 0
      ? customMappings
      : autoDetectMappings(headers, entityType);

    const preview = validateAndMapRows(headers, rows, entityType, activeMappings, sourceId);

    return NextResponse.json({
      success: true,
      data: preview,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process import preview", details: String(error) },
      { status: 500 }
    );
  }
}
