import { NextResponse } from "next/server";
import { DEMO_INVOICES, Invoice } from "@/data/demo-invoices";

const invoicesCache: Invoice[] = [...DEMO_INVOICES];

export async function GET() {
  const receivable = invoicesCache.filter((i) => i.type === "receivable");
  const payable = invoicesCache.filter((i) => i.type === "payable");

  const totalReceivableBalance = receivable.reduce((s, i) => s + i.balanceDue, 0);
  const totalPayableBalance = payable.reduce((s, i) => s + i.balanceDue, 0);
  const totalOverdueBalance = invoicesCache
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + i.balanceDue, 0);
  const totalCollected = receivable.reduce((s, i) => s + i.amountPaid, 0);

  return NextResponse.json({
    invoices: invoicesCache,
    metrics: {
      totalReceivableBalance,
      totalPayableBalance,
      totalOverdueBalance,
      totalCollected,
      totalCount: invoicesCache.length,
      overdueCount: invoicesCache.filter((i) => i.status === "overdue").length,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Action: Record payment against an invoice
    if (body.action === "record_payment") {
      const { id, amount } = body;
      const idx = invoicesCache.findIndex((i) => i.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      const inv = invoicesCache[idx];
      const payAmount = Math.min(Number(amount) || 0, inv.balanceDue);
      const newAmountPaid = inv.amountPaid + payAmount;
      const newBalanceDue = Math.max(0, inv.totalAmount - newAmountPaid);
      const newStatus = newBalanceDue === 0 ? "paid" : "partially_paid";

      invoicesCache[idx] = {
        ...inv,
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
        notes: `${inv.notes || ""} | Payment of R ${payAmount.toLocaleString("en-ZA")} recorded on ${new Date().toISOString().split("T")[0]}`.trim(),
      };

      return NextResponse.json({ success: true, invoice: invoicesCache[idx] });
    }

    // Action: Create new Invoice or Bill
    const items = body.items || [
      { description: "General Trade Supplies", quantity: 1, unitPrice: 1000, taxRate: 15 },
    ];
    const subtotal = items.reduce(
      (sum: number, it: { quantity: number; unitPrice: number }) => sum + it.quantity * it.unitPrice,
      0
    );
    const vatAmount = subtotal * 0.15;
    const totalAmount = subtotal + vatAmount;

    const isPayable = body.type === "payable";
    const prefix = isPayable ? "BILL-2024-" : "INV-2024-";

    const newInvoice: Invoice = {
      id: "inv-" + Date.now(),
      invoiceNumber: `${prefix}00${invoicesCache.length + 1}`,
      type: isPayable ? "payable" : "receivable",
      entityName: body.entityName || (isPayable ? "Dulux SA" : "Trade Customer"),
      entityEmail: body.entityEmail || "accounts@client.co.za",
      entityPhone: body.entityPhone || "+27 11 000 0000",
      status: "unpaid",
      issueDate: body.issueDate || new Date().toISOString().split("T")[0],
      dueDate: body.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      subtotal,
      vatAmount,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      paymentTerms: body.paymentTerms || "Net 30 Days",
      items,
      notes: body.notes || "",
    };

    invoicesCache.unshift(newInvoice);
    return NextResponse.json({ success: true, invoice: newInvoice }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to process invoice request" }, { status: 400 });
  }
}
