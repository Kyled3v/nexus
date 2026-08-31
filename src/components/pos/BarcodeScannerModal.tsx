"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Volume2, AlertCircle, Scan, CheckCircle2 } from "lucide-react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
  description?: string;
  sampleProducts?: { sku: string; barcode?: string; name: string }[];
}

export function BarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
  title = "Barcode & SKU Scanner",
  description = "Align barcode within viewfinder or select a quick-scan product test code",
  sampleProducts = [],
}: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  // Play crisp POS terminal beep using Web Audio API
  const playBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1760, ctx.currentTime); // High pitch POS beep (A6)
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // AudioContext not permitted before user interaction
    }
  }, []);

  const handleBarcodeDetected = useCallback(
    (code: string) => {
      const cleanCode = code.trim();
      if (!cleanCode) return;
      playBeep();
      setScannedFeedback(cleanCode);
      setTimeout(() => {
        onScan(cleanCode);
        setScannedFeedback(null);
        onClose();
      }, 400);
    },
    [onScan, onClose, playBeep]
  );

  useEffect(() => {
    let isCancelled = false;

    async function initCamera() {
      if (!isOpen) return;
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API is not supported in this browser environment.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
        setCameraError(null);
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : "Unable to access camera";
          setCameraError(msg);
          setCameraActive(false);
        }
      }
    }

    if (isOpen) {
      initCamera();
    }

    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      setScannedFeedback(null);
    };
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleBarcodeDetected(manualInput.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} maxWidth="md">
      <div className="space-y-4">
        {/* Scanned Feedback Overlay */}
        {scannedFeedback && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500 rounded-lg flex items-center gap-2 text-emerald-300 text-sm font-medium animate-pulse">
            <CheckCircle2 size={16} />
            <span>Barcode Scanned: <strong>{scannedFeedback}</strong></span>
          </div>
        )}

        {/* Viewfinder / Video Container */}
        <div className="relative w-full aspect-[4/3] bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Reticle */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                <div className="relative w-3/4 h-1/2 border-2 border-emerald-500/70 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center">
                  {/* Laser Scan Animation Line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-[bounce_2s_infinite]" />
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 bg-neutral-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    ALIGN BARCODE
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center space-y-3">
              <Camera size={36} className="mx-auto text-neutral-600" />
              <div className="text-xs text-neutral-400">
                {cameraError ? (
                  <div className="text-amber-400 flex items-center justify-center gap-1.5">
                    <AlertCircle size={14} />
                    <span>{cameraError}</span>
                  </div>
                ) : (
                  <span>Camera initializing...</span>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={startCamera} className="gap-1.5 text-xs">
                <RefreshCw size={12} />
                Retry Camera
              </Button>
            </div>
          )}
        </div>

        {/* Manual Barcode / SKU Input */}
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Type Barcode or SKU (e.g. 6001234567890 or DLX-WS-20L)..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-emerald-500"
          />
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
            <Scan size={14} className="mr-1.5" />
            Scan
          </Button>
        </form>

        {/* Quick Test Barcodes for Demo & Testing */}
        {sampleProducts.length > 0 && (
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-medium">Quick Test Barcodes (Click to simulate scan):</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Volume2 size={12} /> Sound Enabled
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {sampleProducts.slice(0, 6).map((p) => {
                const codeToScan = p.barcode || p.sku;
                return (
                  <button
                    key={p.sku}
                    type="button"
                    onClick={() => handleBarcodeDetected(codeToScan)}
                    className="p-2 rounded bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700/70 text-left transition-colors flex flex-col group"
                  >
                    <span className="text-xs text-white font-medium truncate group-hover:text-emerald-400">
                      {p.name}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400 truncate">
                      {codeToScan}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
