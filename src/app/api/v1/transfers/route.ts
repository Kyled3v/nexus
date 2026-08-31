import { NextResponse } from "next/server";
import { DEMO_TRANSFERS, STORE_LOCATIONS, StockTransfer } from "@/data/demo-transfers";

const transfersCache: StockTransfer[] = [...DEMO_TRANSFERS];

export async function GET() {
  return NextResponse.json({
    transfers: transfersCache,
    locations: STORE_LOCATIONS,
    total: transfersCache.length,
    inTransitCount: transfersCache.filter((t) => t.status === "in_transit").length,
    receivedCount: transfersCache.filter((t) => t.status === "received").length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "update_status") {
      const { id, status } = body;
      const idx = transfersCache.findIndex((t) => t.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
      }

      transfersCache[idx] = {
        ...transfersCache[idx],
        status,
        ...(status === "in_transit" && !transfersCache[idx].dispatchedAt
          ? { dispatchedAt: new Date().toISOString().replace("T", " ").slice(0, 16) }
          : {}),
        ...(status === "received"
          ? { receivedAt: new Date().toISOString().replace("T", " ").slice(0, 16) }
          : {}),
      };

      return NextResponse.json({ success: true, transfer: transfersCache[idx] });
    }

    // Create new transfer
    const newTransfer: StockTransfer = {
      id: "tr-" + Date.now(),
      transferNumber: `TR-2024-00${transfersCache.length + 1}`,
      fromLocationId: body.fromLocationId || "loc-jhb-main",
      fromLocationName: body.fromLocationName || "Johannesburg Central DC",
      toLocationId: body.toLocationId || "loc-sandton",
      toLocationName: body.toLocationName || "Sandton City Branch",
      status: body.status || "draft",
      items: body.items || [
        { sku: "DLX-WS-20L", name: "Dulux Weathershield 20L", quantity: 10 },
      ],
      carrier: body.carrier || "Courier Guy Direct",
      trackingNumber: body.trackingNumber || `TCG-${Math.floor(1000000 + Math.random() * 9000000)}`,
      requestedBy: body.requestedBy || "Inventory Admin",
      createdAt: new Date().toISOString().split("T")[0],
      dispatchedAt: body.status === "in_transit" ? new Date().toISOString().replace("T", " ").slice(0, 16) : undefined,
      notes: body.notes || "",
    };

    transfersCache.unshift(newTransfer);
    return NextResponse.json({ success: true, transfer: newTransfer }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to process transfer request" }, { status: 400 });
  }
}
