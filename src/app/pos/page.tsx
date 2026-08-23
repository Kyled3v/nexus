"use client";

import { useState, useCallback } from "react";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import type { ProductWithStock } from "@/domain/products/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, Plus, Minus, ShoppingCart, CreditCard, Banknote, Trash2, User, Receipt } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CartItem {
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  taxRate: number;
  quantity: number;
  discount: number;
}

type PaymentMethod = "cash" | "card" | "split";

function calcItem(item: CartItem) {
  const subtotal = item.unitPrice * item.quantity;
  const discountAmt = subtotal * (item.discount / 100);
  const afterDiscount = subtotal - discountAmt;
  const taxAmt = afterDiscount * (item.taxRate / 100) / (1 + item.taxRate / 100);
  return { subtotal, discountAmt, afterDiscount, taxAmt };
}

export default function POSPage() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cashTendered, setCashTendered] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [saleComplete, setSaleComplete] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<CartItem[]>([]);
  const [lastTotal, setLastTotal] = useState(0);

  const filtered = search.length > 0
    ? DEMO_PRODUCTS.filter(p =>
        p.status === "active" && (
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()) ||
          (p.barcode ?? "").includes(search)
        )
      ).slice(0, 12)
    : DEMO_PRODUCTS.filter(p => p.status === "active").slice(0, 12);

  const addToCart = useCallback((product: ProductWithStock) => {
    if (product.availableStock <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        unitPrice: product.sellingPrice,
        taxRate: product.taxRate,
        quantity: 1,
        discount: 0,
      }];
    });
  }, []);

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const removeItem = (productId: string) => setCart(prev => prev.filter(i => i.productId !== productId));

  const cartTotals = cart.reduce((acc, item) => {
    const { afterDiscount, taxAmt } = calcItem(item);
    return { subtotal: acc.subtotal + afterDiscount, tax: acc.tax + taxAmt, items: acc.items + item.quantity };
  }, { subtotal: 0, tax: 0, items: 0 });

  const total = cartTotals.subtotal;
  const cashAmount = parseFloat(cashTendered) || 0;
  const change = cashAmount - total;

  const completeSale = () => {
    if (cart.length === 0) return;
    setLastReceipt([...cart]);
    setLastTotal(total);
    setSaleComplete(true);
    setCart([]);
    setSearch("");
    setCustomerName("");
    setCashTendered("");
  };

  const newSale = () => setSaleComplete(false);

  if (saleComplete) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-card border border-base rounded-2xl shadow-modal p-8 w-full max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <Receipt size={28} className="text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-primary">Sale Complete</h2>
          <p className="text-3xl font-bold text-primary">R {lastTotal.toFixed(2)}</p>
          {paymentMethod === "cash" && change >= 0 && (
            <p className="text-sm text-green-600 font-medium">Change: R {change.toFixed(2)}</p>
          )}
          <div className="text-left border border-base rounded-lg p-4 space-y-1">
            {lastReceipt.map(item => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-secondary">{item.name} x{item.quantity}</span>
                <span className="text-primary font-medium">R {(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1">Print Receipt</Button>
            <Button className="flex-1" onClick={newSale}>New Sale</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">

      {/* Left — product selection */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search product, SKU or scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-base rounded-lg text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-card border border-base rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs font-medium text-secondary">Till 01 &middot; Main Branch</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filtered.map((product) => {
              const inCart = cart.find(i => i.productId === product.id);
              const outOfStock = product.availableStock <= 0;
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={outOfStock}
                  className={cn(
                    "text-left p-3 rounded-xl border transition-all",
                    outOfStock
                      ? "opacity-40 cursor-not-allowed bg-page border-base"
                      : inCart
                        ? "bg-accent-subtle border-[var(--accent)] shadow-sm"
                        : "bg-card border-base hover:border-[var(--accent)] hover:shadow-sm active:scale-95"
                  )}
                >
                  <p className="text-xs font-mono text-muted">{product.sku}</p>
                  <p className="text-sm font-medium text-primary mt-0.5 leading-snug line-clamp-2">{product.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-base font-bold text-primary">R {product.sellingPrice.toFixed(2)}</p>
                    {inCart && <span className="text-xs bg-[var(--accent)] text-white px-1.5 py-0.5 rounded-full font-medium">{inCart.quantity}</span>}
                  </div>
                  <p className={cn("text-xs mt-0.5", product.availableStock <= 3 ? "text-amber-600" : "text-muted")}>
                    {outOfStock ? "Out of stock" : product.availableStock + " in stock"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right — cart and payment */}
      <div className="w-80 shrink-0 flex flex-col gap-3">

        {/* Customer */}
        <div className="flex items-center gap-2 px-3 py-2 bg-card border border-base rounded-lg">
          <User size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Customer (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="flex-1 text-sm bg-transparent text-primary placeholder:text-muted focus:outline-none"
          />
        </div>

        {/* Cart */}
        <div className="flex-1 bg-card border border-base rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-base">
            <div className="flex items-center gap-2">
              <ShoppingCart size={14} className="text-muted" />
              <span className="text-sm font-semibold text-primary">Cart</span>
              {cart.length > 0 && <Badge variant="default">{cartTotals.items}</Badge>}
            </div>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                <Trash2 size={12} />Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <ShoppingCart size={24} className="text-muted mb-2" />
                <p className="text-xs text-muted">Cart is empty</p>
              </div>
            )}
            {cart.map((item) => (
              <div key={item.productId} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary leading-snug truncate">{item.name}</p>
                    <p className="text-xs text-muted">R {item.unitPrice.toFixed(2)} each</p>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-muted hover:text-red-500 shrink-0">
                    <X size={12} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.productId, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-page border border-base hover:bg-gray-200 transition-colors">
                      <Minus size={10} />
                    </button>
                    <span className="text-sm font-semibold text-primary w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-page border border-base hover:bg-gray-200 transition-colors">
                      <Plus size={10} />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-primary">R {(item.unitPrice * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-base px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-xs text-muted">
              <span>Subtotal (excl. VAT)</span>
              <span>R {(cartTotals.subtotal - cartTotals.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>VAT (15%)</span>
              <span>R {cartTotals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-primary pt-1 border-t border-base">
              <span>Total</span>
              <span>R {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-card border border-base rounded-xl p-4 space-y-3">
          <div className="flex gap-2">
            {(["cash", "card", "split"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-colors capitalize",
                  paymentMethod === m ? "bg-[var(--accent)] text-white border-transparent" : "bg-page text-secondary border-base hover:text-primary"
                )}
              >
                {m === "cash" ? <Banknote size={12} /> : m === "card" ? <CreditCard size={12} /> : null}
                {m}
              </button>
            ))}
          </div>

          {paymentMethod === "cash" && (
            <div>
              <label className="text-xs text-muted mb-1 block">Cash Tendered</label>
              <input
                type="number"
                placeholder="0.00"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-page border border-base rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
              {cashAmount >= total && total > 0 && (
                <p className="text-xs text-green-600 mt-1 font-medium">Change: R {change.toFixed(2)}</p>
              )}
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="text-center py-2">
              <p className="text-xs text-muted">Card payment — present terminal to customer</p>
            </div>
          )}

          {paymentMethod === "split" && (
            <div className="text-center py-2">
              <p className="text-xs text-muted">Split payment configuration coming soon</p>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={cart.length === 0 || (paymentMethod === "cash" && cashAmount < total && cashTendered !== "")}
            onClick={completeSale}
          >
            Complete Sale &middot; R {total.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
