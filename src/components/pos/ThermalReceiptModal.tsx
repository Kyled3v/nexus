"use client";
import { useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Printer, Download, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ReceiptItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptNumber: string;
  items: ReceiptItem[];
  paymentMethod: "cash" | "card" | "split" | "account";
  cashTendered?: number;
  changeGiven?: number;
  cashierName?: string;
  businessName?: string;
  taxNumber?: string;
  address?: string;
  dateStr?: string;
}

export function ThermalReceiptModal({
  isOpen,
  onClose,
  receiptNumber,
  items,
  paymentMethod,
  cashTendered,
  changeGiven,
  cashierName = "Admin Cashier",
  businessName = "NEXUS COMMERCE STORE",
  taxNumber = "4123456789",
  address = "12 Commerce St, Johannesburg",
  dateStr,
}: ThermalReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const disc = item.discount || 0;
    const priceAfterDisc = item.unitPrice * (1 - disc / 100);
    return sum + priceAfterDisc * item.quantity;
  }, 0);

  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + tax;
  const now = dateStr || new Date().toLocaleString("en-ZA");

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const lines: string[] = [
      "================================",
      `     ${businessName}     `,
      `  VAT REG: ${taxNumber}  `,
      `  ${address}  `,
      "================================",
      `RECEIPT #: ${receiptNumber}`,
      `DATE: ${now}`,
      `CASHIER: ${cashierName}`,
      "--------------------------------",
      "QTY  ITEM              TOTAL",
      "--------------------------------",
      ...items.map((i) => {
        const itemTotal = (i.unitPrice * (1 - (i.discount || 0) / 100) * i.quantity).toFixed(2);
        const nameTrunc = i.name.padEnd(16).slice(0, 16);
        return `${i.quantity}x   ${nameTrunc} R ${itemTotal}`;
      }),
      "--------------------------------",
      `SUBTOTAL (EXCL):    R ${subtotal.toFixed(2)}`,
      `VAT (15%):          R ${tax.toFixed(2)}`,
      `TOTAL AMOUNT:       R ${total.toFixed(2)}`,
      "--------------------------------",
      `PAYMENT:            ${paymentMethod.toUpperCase()}`,
      cashTendered ? `CASH TENDERED:      R ${cashTendered.toFixed(2)}` : "",
      changeGiven !== undefined ? `CHANGE:             R ${changeGiven.toFixed(2)}` : "",
      "================================",
      "   THANK YOU FOR YOUR BUSINESS! ",
      "      POWERED BY NEXUS ERP      ",
      "================================",
    ].filter(Boolean);

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${receiptNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    const text = `RECEIPT #${receiptNumber}\nTOTAL: R ${total.toFixed(2)}\nDATE: ${now}\nITEMS: ${items.length}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="80mm Thermal Receipt"
      description="Standard ESC/POS thermal paper format with tax breakdown"
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Receipt Slip Container */}
        <div
          ref={receiptRef}
          id="printable-thermal-receipt"
          className="bg-neutral-100 text-neutral-900 p-5 rounded-lg font-mono text-[12px] leading-tight shadow-inner border border-neutral-300 max-w-[320px] mx-auto select-text"
        >
          {/* Business Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-neutral-400">
            <h2 className="font-bold text-sm tracking-wider uppercase">{businessName}</h2>
            <p className="text-[11px] text-neutral-600">VAT REG: {taxNumber}</p>
            <p className="text-[11px] text-neutral-600">{address}</p>
          </div>

          {/* Meta */}
          <div className="py-2 space-y-0.5 text-[11px] border-b border-dashed border-neutral-400 text-neutral-700">
            <div className="flex justify-between">
              <span>TAX INVOICE / SLIP:</span>
              <span className="font-bold font-mono">#{receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE & TIME:</span>
              <span>{now}</span>
            </div>
            <div className="flex justify-between">
              <span>CASHIER:</span>
              <span>{cashierName}</span>
            </div>
          </div>

          {/* Items Header */}
          <div className="py-2 border-b border-neutral-400">
            <div className="flex justify-between font-bold text-[11px] mb-1.5">
              <span>ITEM & QTY</span>
              <span>AMOUNT</span>
            </div>

            {/* Line Items */}
            <div className="space-y-1.5">
              {items.map((item, idx) => {
                const itemTotal = item.unitPrice * (1 - (item.discount || 0) / 100) * item.quantity;
                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-medium">
                      <span className="truncate pr-2">{item.name}</span>
                      <span>R {itemTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-600">
                      <span>{item.quantity} x R {item.unitPrice.toFixed(2)} {item.discount ? `(-${item.discount}%)` : ""}</span>
                      <span className="font-mono">{item.sku}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-neutral-400">
            <div className="flex justify-between">
              <span>SUBTOTAL (EXCL. VAT):</span>
              <span>R {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>VAT @ 15%:</span>
              <span>R {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-neutral-300">
              <span>TOTAL (INCL. VAT):</span>
              <span>R {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Tender Breakdown */}
          <div className="py-2 space-y-0.5 text-[11px] border-b border-dashed border-neutral-400">
            <div className="flex justify-between">
              <span>PAYMENT METHOD:</span>
              <span className="uppercase font-semibold">{paymentMethod}</span>
            </div>
            {cashTendered !== undefined && (
              <div className="flex justify-between text-neutral-600">
                <span>CASH TENDERED:</span>
                <span>R {cashTendered.toFixed(2)}</span>
              </div>
            )}
            {changeGiven !== undefined && (
              <div className="flex justify-between font-medium">
                <span>CHANGE GIVEN:</span>
                <span>R {changeGiven.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Barcode / Footer */}
          <div className="pt-3 text-center space-y-2">
            <div className="inline-block px-3 py-1 bg-white border border-neutral-300 rounded font-mono text-[10px] tracking-widest">
              ||| | |||| | ||| || ||| {receiptNumber}
            </div>
            <p className="text-[10px] uppercase text-neutral-500 font-semibold tracking-wider">
              Thank you for shopping with us!
            </p>
            <p className="text-[9px] text-neutral-400">Powered by KDOS & NEXUS POS</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800">
          <Button variant="outline" size="sm" onClick={handleDownloadTxt} className="gap-1.5 text-xs">
            <Download size={13} />
            Export TXT
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyText} className="gap-1.5 text-xs">
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" onClick={handlePrint} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
              <Printer size={13} />
              Print Receipt (80mm)
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
