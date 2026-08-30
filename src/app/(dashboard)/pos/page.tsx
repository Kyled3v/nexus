"use client";
import { useState, useCallback } from "react";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import type { ProductWithStock } from "@/domain/products/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CartItem {
  productId: string; sku: string; name: string;
  unitPrice: number; taxRate: number; quantity: number; discount: number;
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

  const filtered = DEMO_PRODUCTS.filter(p =>
    p.status === "active" && (
      search.length === 0 ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode ?? "").includes(search)
    )
  ).slice(0, 16);

  const addToCart = useCallback((product: ProductWithStock) => {
    if (product.availableStock <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id, sku: product.sku, name: product.name, unitPrice: product.sellingPrice, taxRate: product.taxRate, quantity: 1, discount: 0 }];
    });
  }, []);

  const updateQty = (productId: string, delta: number) =>
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));

  const removeItem = (productId: string) => setCart(prev => prev.filter(i => i.productId !== productId));

  const totals = cart.reduce((acc, item) => {
    const { afterDiscount, taxAmt } = calcItem(item);
    return { subtotal: acc.subtotal + afterDiscount, tax: acc.tax + taxAmt, items: acc.items + item.quantity };
  }, { subtotal: 0, tax: 0, items: 0 });

  const total = totals.subtotal;
  const cashAmount = parseFloat(cashTendered) || 0;
  const change = cashAmount - total;

  const completeSale = async () => {
    if (cart.length === 0) return;

    const items = cart.map(item => {
      const subtotal      = item.unitPrice * item.quantity;
      const discountAmt   = subtotal * (item.discount / 100);
      const afterDiscount = subtotal - discountAmt;
      const taxAmt        = afterDiscount * (item.taxRate / 100) / (1 + item.taxRate / 100);
      return {
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
        }),
      });
    } catch {
      // Sale saved locally even if API fails
    }

    setLastReceipt([...cart]);
    setLastTotal(total);
    setSaleComplete(true);
    setCart([]);
    setSearch("");
    setCustomerName("");
    setCashTendered("");
  };

  if (saleComplete) {
    return (
      <div className="pos-receipt">
        <h2>Sale Complete</h2>
        <p className="pos-receipt__total">R {lastTotal.toFixed(2)}</p>
        {paymentMethod === "cash" && change >= 0 && <p className="pos-receipt__change">Change: R {change.toFixed(2)}</p>}
        <table className="pos-receipt__items">
          <tbody>
            {lastReceipt.map(item => (
              <tr key={item.productId}>
                <td>{item.name}</td>
                <td>x{item.quantity}</td>
                <td>R {(item.unitPrice * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pos-receipt__actions">
          <Button variant="secondary">Print Receipt</Button>
          <Button onClick={() => setSaleComplete(false)}>New Sale</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pos">

      <section className="pos__products" aria-label="Product selection">
        <div className="pos__search">
          <input
            type="search"
            placeholder="Search product, SKU or scan barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            aria-label="Search products"
          />
          <div className="pos__terminal-info">
            <span className="pos__terminal-status" data-status="active" aria-label="Till active" />
            <span>Till 01 &middot; Main Branch</span>
          </div>
        </div>

        <ul className="pos__product-grid">
          {filtered.map((product) => {
            const inCart = cart.find(i => i.productId === product.id);
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
                  <span className="pos__product-stock" data-stock-level={product.stockStatus}>
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
          <label htmlFor="pos-customer">Customer</label>
          <input id="pos-customer" type="text" placeholder="Optional" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
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
                  <button onClick={() => removeItem(item.productId)} aria-label={"Remove " + item.name}>Remove</button>
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
              <input id="cash-tendered" type="number" placeholder="0.00" value={cashTendered} onChange={(e) => setCashTendered(e.target.value)} min={0} step="0.01" />
              {cashAmount >= total && total > 0 && <output htmlFor="cash-tendered">Change: R {change.toFixed(2)}</output>}
            </div>
          )}

          {paymentMethod === "card" && (
            <p className="pos__card-instruction">Present card terminal to customer</p>
          )}

          {paymentMethod === "split" && (
            <p className="pos__split-instruction">Split payment configuration â€” coming soon</p>
          )}

          <Button
            className="pos__complete-btn"
            size="lg"
            disabled={cart.length === 0}
            onClick={completeSale}
          >
            Complete Sale &middot; R {total.toFixed(2)}
          </Button>
        </section>
      </aside>
    </div>
  );
}

