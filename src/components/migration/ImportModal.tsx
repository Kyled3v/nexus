"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  CheckCircle2,
  ArrowRight,
  Download,
  Sparkles,
  Check,
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

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEntity?: MigrationEntityType;
  onSuccess?: () => void;
}

export function ImportModal({
  isOpen,
  onClose,
  defaultEntity = "customers",
  onSuccess,
}: ImportModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSource, setSelectedSource] = useState<MigrationSourceId>("sage_pastel");
  const [entityType, setEntityType] = useState<MigrationEntityType>(defaultEntity);
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewResult | null>(null);
  const [customMappings, setCustomMappings] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<{
    success: boolean;
    count: number;
    message: string;
  } | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<"skip" | "update" | "create_new">("update");

  const definitions: FieldMappingDefinition[] = getFieldDefinitions(entityType);

  const loadSample = () => {
    const samples = SAMPLE_MIGRATION_DATA[selectedSource] || SAMPLE_MIGRATION_DATA.universal_csv;
    const sampleContent = samples[entityType] || "";
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
        });
        setStep(4);
        if (onSuccess) onSuccess();
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
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetAll();
        onClose();
      }}
      title="Data Migration & Import Wizard"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-medium">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-cyan-400 font-semibold" : "text-white/40"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? "bg-cyan-500 text-black font-bold" : "bg-white/10 text-white/40"}`}>1</span>
            <span>Source & Data</span>
          </div>
          <ArrowRight size={12} className="text-white/20" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-cyan-400 font-semibold" : "text-white/40"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? "bg-cyan-500 text-black font-bold" : "bg-white/10 text-white/40"}`}>2</span>
            <span>Smart Mapping</span>
          </div>
          <ArrowRight size={12} className="text-white/20" />
          <div className={`flex items-center gap-2 ${step >= 3 ? "text-cyan-400 font-semibold" : "text-white/40"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? "bg-cyan-500 text-black font-bold" : "bg-white/10 text-white/40"}`}>3</span>
            <span>Validation & Preview</span>
          </div>
          <ArrowRight size={12} className="text-white/20" />
          <div className={`flex items-center gap-2 ${step >= 4 ? "text-emerald-400 font-semibold" : "text-white/40"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 4 ? "bg-emerald-500 text-black font-bold" : "bg-white/10 text-white/40"}`}>4</span>
            <span>Complete</span>
          </div>
        </div>

        {/* STEP 1: Select Source & Input Data */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block mb-2">
                1. Select Source Accounting or POS Software
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {MIGRATION_SOURCES.map((source) => {
                  const isSelected = selectedSource === source.id;
                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => setSelectedSource(source.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                          : "bg-white/[0.02] border-white/5 hover:border-white/20 text-white/70"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-white text-xs font-semibold">{source.name.split("/")[0]}</strong>
                        {isSelected && <Check size={14} className="text-cyan-400" />}
                      </div>
                      <span className="text-[10px] text-white/40 block truncate">{source.badgeText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Entity Selector */}
            <div>
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block mb-2">
                2. Target Record Type to Import
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: "customers", label: "Customers & Debtors" },
                  { id: "products", label: "Products & Stock" },
                  { id: "suppliers", label: "Suppliers & Creditors" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEntityType(t.id as MigrationEntityType)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      entityType === t.id
                        ? "bg-white/10 text-white border-cyan-500/40"
                        : "bg-transparent text-white/50 border-white/5 hover:border-white/15"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload or Paste */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  3. Upload CSV / Excel File or Paste Table
                </label>
                <button
                  type="button"
                  onClick={loadSample}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                >
                  <Sparkles size={12} /> Load {selectedSource.replace("_", " ")} Sample Data
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                  <Upload size={24} className="text-cyan-400 mb-2" />
                  <span className="text-xs font-semibold text-white">Choose CSV / TSV File</span>
                  <span className="text-[11px] text-white/40 mt-0.5">
                    {fileName || "Drag & drop or click to browse"}
                  </span>
                  <input
                    type="file"
                    accept=".csv,.txt,.tsv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <textarea
                  rows={5}
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    setFileName("pasted_data.csv");
                  }}
                  placeholder="Or paste table rows directly from Excel or Google Sheets (with headers)..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white/90 font-mono focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
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
                {loading ? "Analyzing..." : "Analyze & Map Columns"} <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Smart Column Mapping */}
        {step === 2 && previewData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl text-xs text-cyan-300">
              <span className="flex items-center gap-2">
                <Sparkles size={14} />
                KDOS Smart Matcher automatically mapped {Object.keys(customMappings).length} fields from your file.
              </span>
              <Badge variant="default">{previewData.totalRows} records found</Badge>
            </div>

            <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
              <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-white/40 uppercase px-3 py-1">
                <span className="col-span-4">NEXUS Target Field</span>
                <span className="col-span-5">Source File Column</span>
                <span className="col-span-3">Sample Value</span>
              </div>

              {definitions.map((def) => {
                const mappedSource = customMappings[def.targetField] || "";
                const sampleRow = previewData.rows[0]?.originalData || {};
                const sampleVal = mappedSource ? sampleRow[mappedSource] || "(empty)" : "-";

                return (
                  <div
                    key={def.targetField}
                    className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                  >
                    <div className="col-span-4">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white font-medium">{def.label}</strong>
                        {def.required && (
                          <span className="text-[10px] text-amber-400 font-bold">*</span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/40 block truncate">{def.description}</span>
                    </div>

                    <div className="col-span-5">
                      <select
                        value={mappedSource}
                        onChange={(e) => handleMappingChange(def.targetField, e.target.value)}
                        className="w-full bg-[#131b26] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-cyan-500/50"
                      >
                        <option value="">-- Do Not Import --</option>
                        {previewData.headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3 text-[11px] text-white/60 font-mono truncate bg-black/20 px-2 py-1 rounded">
                      {sampleVal}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="primary" size="sm" onClick={() => setStep(3)}>
                Preview & Validate Records <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Preview & Validation Diagnostics */}
        {step === 3 && previewData && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-400 text-lg font-bold block">{previewData.validCount}</span>
                <span className="text-[11px] text-white/60">Ready to Import</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400 text-lg font-bold block">{previewData.warningCount}</span>
                <span className="text-[11px] text-white/60">Warnings (Auto-Formatted)</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-rose-400 text-lg font-bold block">{previewData.errorCount}</span>
                <span className="text-[11px] text-white/60">Skipped (Missing Required)</span>
              </div>
            </div>

            {/* Duplicate Strategy */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
              <span className="text-white/80 font-medium">If customer or item already exists:</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-white/70">
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === "update"}
                    onChange={() => setDuplicateStrategy("update")}
                  />
                  <span>Update & Merge</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-white/70">
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === "skip"}
                    onChange={() => setDuplicateStrategy("skip")}
                  />
                  <span>Skip Duplicate</span>
                </label>
              </div>
            </div>

            {/* Data Grid Preview */}
            <div className="max-h-[260px] overflow-x-auto overflow-y-auto rounded-xl border border-white/10 bg-black/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#111923] sticky top-0 border-b border-white/10 text-[11px] uppercase tracking-wider text-white/50">
                  <tr>
                    <th className="p-2.5">Row</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Name / Title</th>
                    <th className="p-2.5">Contact / Phone</th>
                    <th className="p-2.5">VAT / Tax ID</th>
                    <th className="p-2.5">Balance / Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {previewData.rows.slice(0, 8).map((r) => {
                    const mapped = r.mappedData as Record<string, string | number>;
                    return (
                      <tr key={r.rowNumber} className="hover:bg-white/[0.02]">
                        <td className="p-2.5 text-white/40">#{r.rowNumber}</td>
                        <td className="p-2.5">
                          {r.status === "valid" && <Badge variant="success">Valid</Badge>}
                          {r.status === "warning" && <Badge variant="warning">Cleaned</Badge>}
                          {r.status === "error" && <Badge variant="danger">Invalid</Badge>}
                        </td>
                        <td className="p-2.5 text-white font-sans font-medium">{String(mapped.name || "-")}</td>
                        <td className="p-2.5 text-white/70">{String(mapped.phone || mapped.email || "-")}</td>
                        <td className="p-2.5 text-cyan-400">{String(mapped.taxNumber || "-")}</td>
                        <td className="p-2.5 text-emerald-400">
                          {mapped.outstandingBalance != null
                            ? `R ${Number(mapped.outstandingBalance).toLocaleString()}`
                            : mapped.sellingPrice != null
                            ? `R ${Number(mapped.sellingPrice).toLocaleString()}`
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="secondary" size="sm" onClick={() => setStep(2)}>
                Back to Mapping
              </Button>
              <Button
                variant="primary"
                disabled={previewData.validCount === 0 || loading}
                onClick={executeImport}
              >
                {loading ? "Importing Records..." : `Confirm & Import ${previewData.validCount} Records`}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Result */}
        {step === 4 && importResult && (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Migration Complete!</h3>
              <p className="text-xs text-white/60 mt-1 max-w-md mx-auto">
                {importResult.message}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 max-w-sm mx-auto text-xs text-left space-y-1.5">
              <div className="flex justify-between text-white/70">
                <span>Source System:</span>
                <strong className="text-white">{selectedSource.replace("_", " ").toUpperCase()}</strong>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Imported Records:</span>
                <strong className="text-emerald-400">{importResult.count} records</strong>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Audit Trail:</span>
                <span className="text-cyan-400">Logged to KDOS Multi-Agent Registry</span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetAll();
                  onClose();
                }}
              >
                Close Wizard
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  resetAll();
                  onClose();
                }}
              >
                View {entityType.charAt(0).toUpperCase() + entityType.slice(1)} List
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
