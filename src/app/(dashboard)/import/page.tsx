"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  CheckCircle2,
  ArrowRight,
  Download,
  Sparkles,
  Check,
  Building2,
  ShoppingCart,
  Database,
  History,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  MIGRATION_SOURCES,
  SAMPLE_MIGRATION_DATA,
} from "@/services/migration/presets";
import {
  MigrationSourceId,
  MigrationEntityType,
  ImportPreviewResult,
  FieldMappingDefinition,
} from "@/services/migration/types";
import { getFieldDefinitions } from "@/services/migration/parser";

function ImportHubContent() {
  const searchParams = useSearchParams();
  const initialEntity = (searchParams.get("entity") || "customers") as MigrationEntityType;
  const initialSource = (searchParams.get("source") || "sage_pastel") as MigrationSourceId;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSource, setSelectedSource] = useState<MigrationSourceId>(initialSource);
  const [entityType, setEntityType] = useState<MigrationEntityType>(initialEntity);
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewResult | null>(null);
  const [customMappings, setCustomMappings] = useState<Record<string, string>>({});
  const [duplicateStrategy, setDuplicateStrategy] = useState<"skip" | "update" | "create_new">("update");
  const [importResult, setImportResult] = useState<{
    success: boolean;
    count: number;
    message: string;
    batchId: string;
  } | null>(null);

  // Recent migration history (in-memory demonstration log)
  const [migrationLogs, setMigrationLogs] = useState([
    {
      id: "mig-001",
      source: "Sage Pastel Accounting",
      entity: "Customers & Debtors",
      records: 48,
      date: "Today, 08:30 SAST",
      status: "Completed",
    },
    {
      id: "mig-002",
      source: "Xero Contacts CSV",
      entity: "Contractor Price Lists",
      records: 124,
      date: "Yesterday, 16:45 SAST",
      status: "Completed",
    },
  ]);

  const definitions: FieldMappingDefinition[] = getFieldDefinitions(entityType);

  const loadSample = () => {
    const samples = SAMPLE_MIGRATION_DATA[selectedSource] || SAMPLE_MIGRATION_DATA.universal_csv;
    const sampleContent = samples[entityType] || SAMPLE_MIGRATION_DATA.universal_csv[entityType] || "";
    setRawText(sampleContent);
    setFileName(`sample_${selectedSource}_${entityType}.csv`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content || "");
    };
    reader.readAsText(file);
  };

  const generatePreview = async (overrideMappings?: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: selectedSource,
          entityType,
          rawText,
          mappings: overrideMappings || customMappings,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPreviewData(data.data);
        setCustomMappings(data.data.detectedMappings || {});
        setStep(2);
      }
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (targetField: string, sourceHeader: string) => {
    const next = { ...customMappings, [targetField]: sourceHeader };
    setCustomMappings(next);
    generatePreview(next);
  };

  const executeImport = async () => {
    if (!previewData) return;
    setLoading(true);
    try {
      const validRows = previewData.rows
        .filter((r) => r.isValid)
        .map((r) => ({ rowNumber: r.rowNumber, data: r.mappedData }));

      const sourceObj = MIGRATION_SOURCES.find((s) => s.id === selectedSource);

      const res = await fetch("/api/v1/import/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          sourceName: sourceObj?.name || "External Migration",
          items: validRows,
          options: {
            duplicateStrategy,
          },
        }),
      });
      const result = await res.json();
      if (result.success) {
        setImportResult({
          success: true,
          count: result.importedCount,
          message: result.message,
          batchId: result.auditBatchId,
        });
        setMigrationLogs((prev) => [
          {
            id: result.auditBatchId,
            source: sourceObj?.name || "External System",
            entity: entityType.charAt(0).toUpperCase() + entityType.slice(1),
            records: result.importedCount,
            date: "Just now",
            status: "Completed",
          },
          ...prev,
        ]);
        setStep(4);
      }
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setRawText("");
    setFileName(null);
    setPreviewData(null);
    setImportResult(null);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <div className="flex items-center gap-2">
            <h1 className="page-header__title">Data Migration & Import Hub</h1>
            <Badge variant="default" className="text-cyan-300 bg-cyan-500/10 border-cyan-500/30">
              KDOS Smart Ingest
            </Badge>
          </div>
          <p className="page-header__sub">
            Effortlessly migrate customers, debtor accounts, products, and supplier price lists from Sage Pastel, QuickBooks, Xero, Vend, or Excel spreadsheets.
          </p>
        </div>
      </header>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { num: 1, title: "1. Select & Upload", desc: "Choose software source & paste data" },
          { num: 2, title: "2. Column Mapping", desc: "AI smart auto-match fields" },
          { num: 3, title: "3. Diagnostics Preview", desc: "VAT, phone & duplicate checks" },
          { num: 4, title: "4. Ingest Complete", desc: "Audit trail & AI synchronization" },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border transition-all ${
              step === s.num
                ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300"
                : step > s.num
                ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400"
                : "bg-white/[0.02] border-white/5 text-white/40"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>{s.title}</span>
              {step > s.num && <Check size={14} className="text-emerald-400" />}
            </div>
            <span className="text-[11px] opacity-70 block truncate mt-0.5">{s.desc}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Select Source, Entity, Upload */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Choose Source Accounting / ERP Platform</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {MIGRATION_SOURCES.map((s) => {
                  const isSelected = selectedSource === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSource(s.id)}
                      className={`p-4 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                          : "bg-white/[0.02] border-white/5 hover:border-white/20 text-white/70"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <strong className="text-white text-sm font-semibold">{s.name.split("/")[0]}</strong>
                        {isSelected && <Check size={16} className="text-cyan-400" />}
                      </div>
                      <Badge variant="muted" className="text-[10px] mb-2">{s.badgeText}</Badge>
                      <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                        {s.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle>2. Select Data Type & Upload File</CardTitle>
                  <button
                    type="button"
                    onClick={loadSample}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 font-medium bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20"
                  >
                    <Sparkles size={13} /> Load {selectedSource.replace("_", " ")} Demo CSV
                  </button>
                </div>
              </CardHeader>

              {/* Entity Selector */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-white/70 block mb-2">
                  Select Record Category:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "customers", label: "Customers & Debtors", icon: Building2 },
                    { id: "products", label: "Products & Stock", icon: ShoppingCart },
                    { id: "suppliers", label: "Suppliers & Creditors", icon: Database },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = entityType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setEntityType(t.id as MigrationEntityType)}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-white/10 text-white border-cyan-500/50"
                            : "bg-white/[0.02] text-white/50 border-white/5 hover:border-white/15"
                        }`}
                      >
                        <Icon size={16} className={isSelected ? "text-cyan-400" : "text-white/40"} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* File Upload Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all text-center">
                  <Upload size={28} className="text-cyan-400 mb-2" />
                  <span className="text-sm font-semibold text-white">Upload CSV / TSV File</span>
                  <span className="text-xs text-white/40 mt-1">
                    {fileName || "Drag & drop or click to browse files"}
                  </span>
                  <span className="text-[10px] text-white/30 mt-2">Supports .CSV, .TXT, .TSV up to 50MB</span>
                  <input
                    type="file"
                    accept=".csv,.txt,.tsv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div>
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={(e) => {
                      setRawText(e.target.value);
                      setFileName("pasted_spreadsheet.csv");
                    }}
                    placeholder="Or paste table rows directly from Excel or Google Sheets (with header row)..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white/90 font-mono focus:outline-none focus:border-cyan-500/50 resize-none h-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                <a
                  href={`/api/v1/import/template?source=${selectedSource}&entity=${entityType}`}
                  download
                  className="text-xs text-white/50 hover:text-white flex items-center gap-1.5"
                >
                  <Download size={13} /> Download Blank {selectedSource.replace("_", " ")} Template (.CSV)
                </a>

                <Button
                  variant="primary"
                  disabled={!rawText.trim() || loading}
                  onClick={() => generatePreview()}
                >
                  {loading ? "Analyzing File..." : "Analyze & Map Columns"} <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar & Recent Ingestion Logs */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <CardTitle>NEXUS Ingest Guarantees</CardTitle>
                </div>
              </CardHeader>
              <ul className="text-xs text-white/70 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>South African SARS VAT Check</strong>: Validates 10-digit tax numbers automatically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>Phone Sanitization</strong>: Standardizes <code>082...</code> to <code>+27 82...</code> format.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>AI Multi-Agent Sync</strong>: Debtor & marketing agents immediately recognize imported accounts.</span>
                </li>
              </ul>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <History size={16} className="text-cyan-400" />
                  <CardTitle>Recent Migration Batches</CardTitle>
                </div>
              </CardHeader>
              <div className="space-y-3">
                {migrationLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-white font-medium">{log.source}</strong>
                      <Badge variant="success" className="text-[10px]">{log.status}</Badge>
                    </div>
                    <div className="flex justify-between text-white/50 text-[11px]">
                      <span>{log.entity} ({log.records} rows)</span>
                      <span>{log.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* STEP 2: Smart Column Mapping */}
      {step === 2 && previewData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Step 2: Verify AI Smart Field Mapping</CardTitle>
                <p className="text-xs text-white/50 mt-1">
                  We automatically mapped {Object.keys(customMappings).length} fields from your {selectedSource.replace("_", " ")} file. You can adjust any mapping below.
                </p>
              </div>
              <Badge variant="default" className="text-cyan-300">
                {previewData.totalRows} Records Detected
              </Badge>
            </div>
          </CardHeader>

          <div className="space-y-2 mb-6">
            <div className="grid grid-cols-12 gap-3 text-[11px] font-semibold text-white/40 uppercase px-4 py-2 bg-white/[0.02] rounded-lg">
              <span className="col-span-4">NEXUS Target Schema Field</span>
              <span className="col-span-5">Source File Column</span>
              <span className="col-span-3">Live Sample Record Value</span>
            </div>

            {definitions.map((def) => {
              const mappedSource = customMappings[def.targetField] || "";
              const sampleRow = previewData.rows[0]?.originalData || {};
              const sampleVal = mappedSource ? sampleRow[mappedSource] || "(empty)" : "-";

              return (
                <div
                  key={def.targetField}
                  className="grid grid-cols-12 gap-3 items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs hover:border-white/10 transition-all"
                >
                  <div className="col-span-4">
                    <div className="flex items-center gap-1.5">
                      <strong className="text-white font-medium">{def.label}</strong>
                      {def.required && (
                        <span className="text-[10px] text-amber-400 font-bold">*</span>
                      )}
                    </div>
                    <span className="text-[11px] text-white/40 block truncate">{def.description}</span>
                  </div>

                  <div className="col-span-5">
                    <select
                      value={mappedSource}
                      onChange={(e) => handleMappingChange(def.targetField, e.target.value)}
                      className="w-full bg-[#131b26] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500/50"
                    >
                      <option value="">-- Do Not Import This Field --</option>
                      {previewData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3 text-[11px] text-cyan-300 font-mono truncate bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/5">
                    {sampleVal}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back to Source & File
            </Button>
            <Button variant="primary" onClick={() => setStep(3)}>
              Proceed to Validation & Preview <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Preview & Validation Diagnostics */}
      {step === 3 && previewData && (
        <div className="space-y-6">
          {/* Health Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-emerald-400 text-2xl font-bold block">{previewData.validCount}</span>
              <span className="text-xs text-white/70 font-medium">Valid & Ready for Ingest</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-amber-400 text-2xl font-bold block">{previewData.warningCount}</span>
              <span className="text-xs text-white/70 font-medium">Sanitized / Auto-Formatted</span>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <span className="text-rose-400 text-2xl font-bold block">{previewData.errorCount}</span>
              <span className="text-xs text-white/70 font-medium">Errors (Missing Required)</span>
            </div>
          </div>

          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Duplicate Handling & Conflict Strategy</CardTitle>
            </CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <span className="text-white/70">
                When a record with matching name, tax ID, or SKU is already present in your database:
              </span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="radio"
                    name="dupStrategyHub"
                    checked={duplicateStrategy === "update"}
                    onChange={() => setDuplicateStrategy("update")}
                  />
                  <span>Update & Merge Existing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="radio"
                    name="dupStrategyHub"
                    checked={duplicateStrategy === "skip"}
                    onChange={() => setDuplicateStrategy("skip")}
                  />
                  <span>Skip Duplicate</span>
                </label>
              </div>
            </div>
          </Card>

          {/* Data Table */}
          <Card padding="none">
            <div className="overflow-x-auto max-h-[380px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#111923] sticky top-0 border-b border-white/10 text-[11px] uppercase tracking-wider text-white/50">
                  <tr>
                    <th className="p-3">Row</th>
                    <th className="p-3">Validation Status</th>
                    <th className="p-3">Customer / Entity Name</th>
                    <th className="p-3">Phone / Contact</th>
                    <th className="p-3">SARS Tax / VAT</th>
                    <th className="p-3">Opening Balance / Price</th>
                    <th className="p-3">Notes & Diagnostics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {previewData.rows.map((r) => {
                    const mapped = r.mappedData as Record<string, string | number>;
                    return (
                      <tr key={r.rowNumber} className="hover:bg-white/[0.02]">
                        <td className="p-3 text-white/40">#{r.rowNumber}</td>
                        <td className="p-3">
                          {r.status === "valid" && <Badge variant="success">Valid</Badge>}
                          {r.status === "warning" && <Badge variant="warning">Cleaned</Badge>}
                          {r.status === "error" && <Badge variant="danger">Invalid</Badge>}
                        </td>
                        <td className="p-3 text-white font-sans font-medium">{String(mapped.name || "-")}</td>
                        <td className="p-3 text-white/70">{String(mapped.phone || mapped.email || "-")}</td>
                        <td className="p-3 text-cyan-400">{String(mapped.taxNumber || "-")}</td>
                        <td className="p-3 text-emerald-400">
                          {mapped.outstandingBalance != null
                            ? `R ${Number(mapped.outstandingBalance).toLocaleString()}`
                            : mapped.sellingPrice != null
                            ? `R ${Number(mapped.sellingPrice).toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="p-3 text-[11px] font-sans text-white/50">
                          {r.warnings.length > 0 ? (
                            <span className="text-amber-400">{r.warnings.join(", ")}</span>
                          ) : r.errors.length > 0 ? (
                            <span className="text-rose-400">{r.errors.join(", ")}</span>
                          ) : (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Ready
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Back to Column Mapping
            </Button>
            <Button
              variant="primary"
              disabled={previewData.validCount === 0 || loading}
              onClick={executeImport}
            >
              {loading ? "Ingesting Records..." : `Confirm & Import ${previewData.validCount} Records`}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Ingestion Complete & AI Notification */}
      {step === 4 && importResult && (
        <Card>
          <div className="text-center py-10 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Migration Ingest Successful!</h2>
              <p className="text-sm text-white/60 mt-1 max-w-md mx-auto">
                {importResult.message}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 max-w-md mx-auto text-xs text-left space-y-2">
              <div className="flex justify-between text-white/70">
                <span>Source Accounting System:</span>
                <strong className="text-white">{selectedSource.replace("_", " ").toUpperCase()}</strong>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Total Ingested Records:</span>
                <strong className="text-emerald-400 font-semibold">{importResult.count} records</strong>
              </div>
              <div className="flex justify-between text-white/70">
                <span>KDOS AI Coordination:</span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <Zap size={12} /> Auto-Notified KDOS Agents
                </span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Batch Audit ID:</span>
                <code className="text-white/80 font-mono text-[10px]">{importResult.batchId}</code>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-4">
              <Button variant="secondary" onClick={resetAll}>
                Import Another File / System
              </Button>
              <a
                href={entityType === "customers" ? "/customers" : entityType === "products" ? "/products" : "/suppliers"}
              >
                <Button variant="primary">
                  View {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Dashboard <ArrowRight size={14} />
                </Button>
              </a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function ImportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white/50">Loading Migration Hub...</div>}>
      <ImportHubContent />
    </Suspense>
  );
}
