import { SAMPLE_MIGRATION_DATA } from "@/services/migration/presets";
import { MigrationSourceId, MigrationEntityType } from "@/services/migration/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourceId = (searchParams.get("source") || "universal_csv") as MigrationSourceId;
  const entityType = (searchParams.get("entity") || "customers") as MigrationEntityType;

  const sourceData = SAMPLE_MIGRATION_DATA[sourceId] || SAMPLE_MIGRATION_DATA.universal_csv;
  const csvContent = sourceData[entityType] || SAMPLE_MIGRATION_DATA.universal_csv[entityType] || "";

  const filename = `${sourceId}_${entityType}_template.csv`;

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
