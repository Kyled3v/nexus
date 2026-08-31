"use client";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, RotateCcw, CheckCircle2, Sparkles, CreditCard, Scan, Camera, FileText } from "lucide-react";
import { BarcodeScannerModal } from "@/components/pos/BarcodeScannerModal";
import { ThermalReceiptModal } from "@/components/pos/ThermalReceiptModal";

interface PosProduct {
  id:             string;
  sku:            string;
  barcode?:       string | null;
  name:           string;
  category?:      string;
  sellingPrice:   number;
  taxRate:        number;
  taxInclusive:   boolean;
  currentStock:   number;
  reservedStock:  number;
  availableStock: number;
}

interface CartItem {
  productId:  string;
  sku:        string;
  name:       string;
  unitPrice:  number;
  taxRate:    number;
  quantity:   number;
  discount:   number;
}

type PaymentMethod = "cash" | "card" | "split" | "account";

function calcItem(item: CartItem) {
  const subtotal      = item.unitPrice * item.quantity;
  const discountAmt   = subtotal * (item.discount / 100);
  const afterDiscount = subtotal - discountAmt;
  const taxAmt        = afterDiscount * (item.taxRate / 100) / (1 + item.taxRate / 100);
  return { subtotal, discountAmt, afterDiscount, taxAmt };
}

export default function POSPage() {
  const [products,       setProducts]       = useState<PosProduct[]>([]);
  const [source,         setSource]         = useState<string>("loading");
  const [search,         setSearch]         = useState("");
  const [selectedCat,    setSelectedCat]    = useState("all");
  const [cart,           setCart]           = useState<CartItem[]>([]);
  const [paymentMethod,  setPaymentMethod]  = useState<PaymentMethod>("cash");
  const [cashTendered,   setCashTendered]   = useState("");
  const [splitCash,      setSplitCash]      = useState("");
  const [customerName,   setCustomerName]   = useState("");
  const [saleComplete,   setSaleComplete]   = useState(false);
  const [receiptNumber,  setReceiptNumber]  = useState("");
  const [lastReceipt,    setLastReceipt]    = useState<CartItem[]>([]);
  const [lastTotal,      setLastTotal]      = useState(0);
  const [submitting,     setSubmitting]     = useState(false);
  const [toastMessage,   setToastMessage]   = useState<string | null>(null);
  const [isScannerOpen,  setIsScannerOpen]  = useState(false);
  const [isThermalOpen,  setIsThermalOpen]  = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBarcodeScanned = (barcode: string) => {
    const clean = barcode.toLowerCase();
    const found = products.find(
      (p) =>
        p.sku.toLowerCase() === clean ||
        (p.barcode && p.barcode.toLowerCase() === clean) ||
        p.name.toLowerCase().includes(clean)
    );

    if (found) {
      addToCart(found);
      showToast(`Scanned & added: ${found.name}`);
    } else {
      showToast(`No product matched barcode "${barcode}".`);
      setSearch(barcode);
    }
  };

  useEffect(() => {
    fetch("/api/v1/pos")
      .then(r => r.json())
      .then((data: { products?: PosProduct[]; source?: string }) => {
        if (data.products) {
          setProducts(data.products);
          setSource(data.source ?? "live");
        }
      })
      .catch(() => setSource("error"));
  }, []);

  useEffect(() => {
    if (search.length === 0) return;
    const t = setTimeout(() => {
      fetch("/api/v1/pos?search=" + encodeURIComponent(search))
        .then(r => r.json())
        .then((data: { products?: PosProduct[] }) => {
          if (data.products) setProducts(data.products);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const addToCart = useCallback((product: PosProduct) => {
    if (product.availableStock <= 0) {
      showToast(`${product.name} is out of stock!`);
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.availableStock) {
          showToast(`Max stock reached for ${product.name}`);
          return prev;
        }
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        productId: product.id,
        sku:       product.sku,
        name:      product.name,
        unitPrice: product.sellingPrice,
        taxRate:   product.taxRate,
        quantity:  1,
        discount:  0,
      }];
    });
  }, []);

  const updateQty = (productId: string, delta: number) => {
    const prod = products.find(p => p.id === productId);
    setCart(prev => prev.map(i => {
      if (i.productId === productId) {
        const nextQty = i.quantity + delta;
        if (prod && nextQty > prod.availableStock) {
          showToast(`Cannot exceed available stock (${prod.availableStock})`);
          return i;
        }
        return { ...i, quantity: Math.max(1, nextQty) };
      }
      return i;
    }));
  };

  const removeItem = (productId: string) => setCart(prev => prev.filter(i => i.productId !== productId));

  const totals = cart.reduce((acc, item) => {
    const { afterDiscount, taxAmt } = calcItem(item);
    return { subtotal: acc.subtotal + afterDiscount, tax: acc.tax + taxAmt, items: acc.items + item.quantity };
  }, { subtotal: 0, tax: 0, items: 0 });

  const total       = totals.subtotal;
  const cashAmount  = parseFloat(cashTendered) || 0;
  const change      = cashAmount - total;

  const splitCashAmount = parseFloat(splitCash) || 0;
  const splitCardAmount = Math.max(0, total - splitCashAmount);

  const completeSale = async () => {
    if (cart.length === 0 || submitting) return;
    setSubmitting(true);

    const items = cart.map(item => {
      const subtotal      = item.unitPrice * item.quantity;
      const discountAmt   = subtotal * (item.discount / 100);
      const afterDiscount = subtotal - discountAmt;
      const taxAmt        = afterDiscount * (item.taxRate / 100) / (1 + item.taxRate / 100);
      return {
        productId:      item.productId,
        sku:            item.sku,
        name:           item.name,
        quantity:       item.quantity,
        unitPrice:      item.unitPrice,
        taxRate:        item.taxRate,
        taxAmount:      taxAmt,
        discountPct:    item.discount,
        discountAmount: discountAmt,
        lineTotal:      afterDiscount,
      };
    });

    try {
      await fetch("/api/v1/sales/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          items,
          subtotal:       totals.subtotal,
          taxAmount:      totals.tax,
          discountAmount: 0,
          total,
          paymentMethod,
          customerName:   customerName.trim() || undefined,
        }),
      });
    } catch {
      // continue to receipt even if offline
    }

    const seq = (cart.reduce((s, it) => s + it.quantity, 0) * 31 + 1058).toString();
    setLastReceipt([...cart]);
    setLastTotal(total);
    setReceiptNumber(seq);
    setSaleComplete(true);
    setCart([]);
    setSearch("");
    setCustomerName("");
    setCashTendered("");
    setSplitCash("");
    setSubmitting(false);
  };

  const filteredProducts = products.filter(p => {
    if (selectedCat === "all") return true;
    return (p.name.toLowerCase().includes(selectedCat.toLowerCase()) || p.sku.toLowerCase().includes(selectedCat.toLowerCase()));
  });

  if (saleComplete) {
    return (
      <div className="page flex flex-col items-center justify-center min-h-[70vh] max-w-lg mx-auto py-8">
        <div className="w-full bg-[#11161d] border border-white/10 rounded-2xl p-6 shadow-2xl text-center">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-3">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Sale Completed</h2>
          <p className="text-xs text-white/50 mb-4">Till 01 · Main Branch · Receipt #NX-{receiptNumber}</p>

          <div className="bg-white/5 rounded-xl p-4 my-4 text-left font-mono text-xs space-y-2">
            <div className="flex justify-between font-bold text-white text-sm pb-2 border-b border-white/10">
              <span>TOTAL PAID</span>
              <span className="text-emerald-400">R {lastTotal.toFixed(2)}</span>
            </div>
            {paymentMethod === "cash" && change >= 0 && (
              <div className="flex justify-between text-white/70">
                <span>Tendered: R {cashAmount.toFixed(2)}</span>
                <span>Change: R {change.toFixed(2)}</span>
              </div>
            )}
            {paymentMethod === "split" && (
              <div className="flex justify-between text-white/70">
                <span>Cash: R {splitCashAmount.toFixed(2)}</span>
                <span>Card: R {splitCardAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-white/10 space-y-1">
              {lastReceipt.map(item => (
                <div key={item.productId} className="flex justify-between text-white/80">
                  <span className="truncate pr-2">{item.name} x{item.quantity}</span>
                  <span>R {(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <Button variant="secondary" onClick={() => setIsThermalOpen(true)}>
              <FileText size={14} className="mr-1" />80mm Thermal Slip
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer size={14} className="mr-1" />Print
            </Button>
            <Button onClick={() => setSaleComplete(false)}>
              <RotateCcw size={14} className="mr-1" />New Sale
            </Button>
          </div>
        </div>

        {/* 80mm Thermal Slip Modal */}
        <ThermalReceiptModal
          isOpen={isThermalOpen}
          onClose={() => setIsThermalOpen(false)}
          receiptNumber={`NX-${receiptNumber}`}
          items={lastReceipt}
          paymentMethod={paymentMethod}
          cashTendered={paymentMethod === "cash" ? cashAmount : undefined}
          changeGiven={paymentMethod === "cash" && change >= 0 ? change : undefined}
        />
      </div>
    );
  }

  return (
    <div className="pos">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#1a2332] border border-cyan-500/30 text-cyan-400 px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={16} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
        sampleProducts={products.map((p) => ({ sku: p.sku, barcode: p.barcode || undefined, name: p.name }))}
      />

      <section className="pos__products" aria-label="Product selection">
        <div className="pos__search">
          <div className="flex-1 flex items-center relative">
            <input
              type="search"
              placeholder="Search product, SKU or scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              aria-label="Search products"
              className="w-full"
            />
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="absolute right-2 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 hover:text-emerald-400 flex items-center gap-1.5 border border-neutral-700 transition-colors"
              title="Open Barcode Camera Scanner"
            >
              <Scan size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">Camera Scan</span>
            </button>
          </div>
          <div className="pos__terminal-info">
            <span className="pos__terminal-status" data-status="active" aria-label="Till active" />
            <span>Till 01 · Main Branch</span>
            {source === "empty" && <Badge variant="warning">No products in DB</Badge>}
            {source === "loading" && <Badge variant="muted">Loading...</Badge>}
          </div>
        </div>

        <div className="flex gap-1.5 px-4 pt-2 overflow-x-auto text-xs">
          {["all", "Dulux", "Plascon", "Crown", "Rust-Oleum"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={[
                "px-2.5 py-1 rounded-md transition-colors",
                selectedCat === cat ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-white/5 text-white/60 hover:bg-white/10"
              ].join(" ")}
            >
              {cat === "all" ? "All Brands" : cat}
            </button>
          ))}
        </div>

        <ul className="pos__product-grid">
          {filteredProducts.length === 0 && source !== "loading" && (
            <li className="empty-state">No products found. Add products to catalogue.</li>
          )}
          {filteredProducts.map((product) => {
            const inCart     = cart.find(i => i.productId === product.id);
            const outOfStock = product.availableStock <= 0;
            return (
              <li key={product.id}>
                <button
                  onClick={() => addToCart(product)}
                  disabled={outOfStock}
                  className={["pos__product-card", inCart ? "pos__product-card--in-cart" : "", outOfStock ? "pos__product-card--out-of-stock" : ""].join(" ").trim()}
                  aria-pressed={!!inCart}
                  data-out-of-stock={outOfStock}
                >
                  <code className="pos__product-sku">{product.sku}</code>
                  <span className="pos__product-name">{product.name}</span>
                  <span className="pos__product-price">R {product.sellingPrice.toFixed(2)}</span>
                  <span className="pos__product-stock" data-stock-level={outOfStock ? "out" : "ok"}>
                    {outOfStock ? "Out of stock" : product.availableStock + " in stock"}
                  </span>
                  {inCart && <span className="pos__product-qty-badge" aria-label={"In cart: " + inCart.quantity}>{inCart.quantity}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="pos__cart" aria-label="Cart">
        <div className="pos__customer">
          <label htmlFor="pos-customer">Customer Account</label>
          <input
            id="pos-customer"
            type="text"
            placeholder="Walk-in Client / Account #"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <section className="pos__cart-items" aria-label="Cart items">
          <header className="pos__cart-header">
            <h2>Cart {cart.length > 0 && <Badge variant="default">{totals.items}</Badge>}</h2>
            {cart.length > 0 && <button onClick={() => setCart([])} aria-label="Clear cart">Clear</button>}
          </header>
          {cart.length === 0 ? (
            <p className="empty-state">Cart is empty</p>
          ) : (
            <ul>
              {cart.map((item) => (
                <li key={item.productId} className="pos__cart-item">
                  <div className="pos__cart-item-info">
                    <span className="pos__cart-item-name">{item.name}</span>
                    <span className="pos__cart-item-unit-price">R {item.unitPrice.toFixed(2)} each</span>
                  </div>
                  <div className="pos__cart-item-controls">
                    <button onClick={() => updateQty(item.productId, -1)} aria-label="Decrease quantity">-</button>
                    <span aria-label={"Quantity: " + item.quantity}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, 1)} aria-label="Increase quantity">+</button>
                  </div>
                  <span className="pos__cart-item-total">R {(item.unitPrice * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeItem(item.productId)} aria-label={"Remove " + item.name}>✕</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pos__totals" aria-label="Order totals">
          <dl>
            <div><dt>Subtotal (excl. VAT)</dt><dd>R {(totals.subtotal - totals.tax).toFixed(2)}</dd></div>
            <div><dt>VAT (15%)</dt><dd>R {totals.tax.toFixed(2)}</dd></div>
            <div className="pos__totals-grand"><dt>Total</dt><dd>R {total.toFixed(2)}</dd></div>
          </dl>
        </section>

        <section className="pos__payment" aria-label="Payment">
          <fieldset>
            <legend>Payment Method</legend>
            <div className="pos__payment-methods" role="radiogroup">
              {(["cash","card","split"] as PaymentMethod[]).map((m) => (
                <label key={m} className={["pos__payment-method", paymentMethod === m ? "pos__payment-method--selected" : ""].join(" ").trim()}>
                  <input type="radio" name="paymentMethod" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </label>
              ))}
            </div>
          </fieldset>

          {paymentMethod === "cash" && (
            <div className="pos__cash-tendered">
              <label htmlFor="cash-tendered">Cash Tendered</label>
              <input
                id="cash-tendered"
                type="number"
                placeholder="0.00"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                min={0}
                step="0.01"
              />
              {cashAmount >= total && total > 0 && (
                <output htmlFor="cash-tendered" className="text-emerald-400 font-semibold">
                  Change: R {change.toFixed(2)}
                </output>
              )}
            </div>
          )}

          {paymentMethod === "card" && (
            <p className="pos__card-instruction flex items-center gap-1.5 justify-center py-2 text-cyan-400">
              <CreditCard size={14} />
              <span>Tap / Insert Card on POS Terminal</span>
            </p>
          )}

          {paymentMethod === "split" && (
            <div className="space-y-2 py-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Cash Portion:</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={splitCash}
                  onChange={(e) => setSplitCash(e.target.value)}
                  className="bg-white/10 px-2 py-1 rounded w-24 text-right text-white focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Card Balance:</span>
                <strong className="text-cyan-400 font-mono">R {splitCardAmount.toFixed(2)}</strong>
              </div>
            </div>
          )}

          <Button
            className="pos__complete-btn"
            size="lg"
            disabled={cart.length === 0 || submitting}
            onClick={completeSale}
          >
            {submitting ? "Processing..." : "Complete Sale · R " + total.toFixed(2)}
          </Button>
        </section>
      </aside>
    </div>
  );
}
