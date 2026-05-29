import {
  CreditCard,
  FileText,
  Minus,
  Pause,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  Trash2
} from "lucide-react";
import { useSyncExternalStore } from "react";
import { ReceiptTicketPreview } from "./ReceiptTicketPreview";
import { posStore } from "../store/posStore";
import type { CheckoutReceipt, CustomerSummary, PosDocumentSummary, SaleHistoryDetail } from "../types/api";

type PaymentAmounts = {
  cash: number;
  card: number;
  transfer: number;
  credit: number;
};

type ActiveDocument = {
  id: string;
  type: "suspended" | "quote";
  number: string;
} | null;

type CartPanelProps = {
  paymentAmounts: PaymentAmounts;
  onPaymentChange: (key: keyof PaymentAmounts, value: number) => void;
  onExactCash: (amount: number) => void;
  onCheckout: () => void;
  onSuspend: () => void;
  onQuote: () => void;
  onReturn: () => void;
  onPrint: () => void;
  onLoadDocument: (id: string, type: "suspended" | "quote") => void;
  onVoidDocument: (id: string, type: "suspended" | "quote") => void;
  receipt: CheckoutReceipt | null;
  receiptDetail: SaleHistoryDetail | null;
  companyName: string;
  customers: CustomerSummary[];
  selectedCustomerId: string;
  onCustomerChange: (customerId: string) => void;
  suspendedSales: PosDocumentSummary[];
  quotes: PosDocumentSummary[];
  activeDocument: ActiveDocument;
  isSubmitting: boolean;
};

export function CartPanel({
  paymentAmounts,
  onPaymentChange,
  onExactCash,
  onCheckout,
  onSuspend,
  onQuote,
  onReturn,
  onPrint,
  onLoadDocument,
  onVoidDocument,
  receipt,
  receiptDetail,
  companyName,
  customers,
  selectedCustomerId,
  onCustomerChange,
  suspendedSales,
  quotes,
  activeDocument,
  isSubmitting
}: CartPanelProps) {
  const cart = useSyncExternalStore(posStore.subscribe, posStore.getSnapshot);
  const subtotal = cart.reduce((total, line) => total + line.price * line.quantity - line.discount, 0);
  const tax = cart.reduce((total, line) => total + (line.price * line.quantity - line.discount) * line.taxRate, 0);
  const grandTotal = subtotal + tax;
  const paid = paymentAmounts.cash + paymentAmounts.card + paymentAmounts.transfer + paymentAmounts.credit;
  const pending = Math.max(0, grandTotal - paid);
  const change = Math.max(0, paid - grandTotal);
  const canSubmit = cart.length > 0 && paid >= grandTotal && !isSubmitting;

  return (
    <section className="panel cart-panel">

      {/* Header */}
      <div className="panel-title">
        <div>
          <span>{activeDocument ? `Documento reabierto: ${activeDocument.number}` : "Nueva venta"}</span>
          <strong>Caja POS</strong>
        </div>
        <Receipt size={20} style={{ color: "var(--text-muted)" }} />
      </div>

      <div className="pos-customer-panel">
        <label>
          <span>Cliente</span>
          <select value={selectedCustomerId} onChange={(event) => onCustomerChange(event.target.value)}>
            <option value="">Cliente contado</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}{customer.type === 2 ? " - credito" : ""}
              </option>
            ))}
          </select>
        </label>
        <small>{selectedCustomerId ? "La factura quedara asociada al cliente seleccionado." : "Venta rapida como consumidor final."}</small>
      </div>

      {/* Lineas del carrito */}
      <div className="cart-lines">
        {cart.length === 0 && (
          <p className="empty-state">
            Agrega productos para comenzar la venta.<br />
            <small>Busca por nombre o escanea un codigo de barras.</small>
          </p>
        )}
        {cart.map((line) => (
          <article className="cart-line" key={line.id}>
            <div>
              <strong>{line.name}</strong>
              <span>
                RD$ {line.price.toLocaleString("es-DO")} &nbsp;&middot;&nbsp;
                ITBIS {(line.taxRate * 100).toFixed(0)}%
              </span>
              <label className="discount-field">
                <span>Descuento RD$</span>
                <input
                  type="number"
                  min="0"
                  value={line.discount}
                  onChange={(event) => posStore.updateDiscount(line.id, Number(event.target.value))}
                />
              </label>
            </div>
            <div className="quantity-control">
              <button title="Reducir cantidad" onClick={() => posStore.updateQuantity(line.id, line.quantity - 1)}>
                <Minus size={14} />
              </button>
              <span>{line.quantity}</span>
              <button title="Aumentar cantidad" onClick={() => posStore.updateQuantity(line.id, line.quantity + 1)}>
                <Plus size={14} />
              </button>
              <button className="qty-delete" title="Eliminar producto" onClick={() => posStore.remove(line.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Totales */}
      <div className="totals">
        <span>Subtotal <strong>RD$ {subtotal.toLocaleString("es-DO")}</strong></span>
        <span>ITBIS (18%) <strong>RD$ {tax.toLocaleString("es-DO")}</strong></span>
        <span className="grand-total">Total a pagar <strong>RD$ {grandTotal.toLocaleString("es-DO")}</strong></span>
      </div>

      {/* Panel de pagos */}
      <div className="payment-panel">
        <div className="payment-header">
          <strong>Metodo de pago</strong>
          <button
            type="button"
            onClick={() => onExactCash(grandTotal)}
            disabled={cart.length === 0}
            title="Llenar efectivo con el total exacto"
          >
            Monto exacto
          </button>
        </div>

        <div className="payment-grid">
          <PaymentField
            label="Efectivo"
            value={paymentAmounts.cash}
            onChange={(value) => onPaymentChange("cash", value)}
          />
          <PaymentField
            label="Tarjeta"
            value={paymentAmounts.card}
            onChange={(value) => onPaymentChange("card", value)}
          />
          <PaymentField
            label="Transf."
            value={paymentAmounts.transfer}
            onChange={(value) => onPaymentChange("transfer", value)}
          />
          <PaymentField
            label="Credito"
            value={paymentAmounts.credit}
            onChange={(value) => onPaymentChange("credit", value)}
          />
        </div>

        <div className="payment-balance">
          <span className={pending > 0 ? "balance-pending" : ""}>
            Pendiente: RD$ {pending.toLocaleString("es-DO")}
          </span>
          <span className={change > 0 ? "balance-change" : ""}>
            Cambio: RD$ {change.toLocaleString("es-DO")}
          </span>
        </div>
      </div>

      {/* Boton principal */}
      <button className="checkout-button" disabled={!canSubmit} onClick={onCheckout}>
        <CreditCard size={20} />
        <span>{isSubmitting ? "Procesando venta..." : "Registrar venta"}</span>
      </button>

      {/* Acciones POS */}
      <div className="pos-actions">
        <button
          type="button"
          onClick={onSuspend}
          disabled={cart.length === 0 || isSubmitting}
          title="Suspender venta para continuar luego (F6)"
        >
          <Pause size={16} />
          <span>Suspender</span>
        </button>
        <button
          type="button"
          onClick={onQuote}
          disabled={cart.length === 0 || isSubmitting}
          title="Guardar como cotizacion (F7)"
        >
          <FileText size={16} />
          <span>Cotizar</span>
        </button>
        <button
          type="button"
          onClick={onReturn}
          disabled={cart.length === 0 || isSubmitting}
          title="Registrar devolucion de los productos del carrito"
        >
          <RotateCcw size={16} />
          <span>Devolucion</span>
        </button>
        <button
          type="button"
          onClick={onPrint}
          disabled={!receipt}
          title="Imprimir ultimo ticket (F9)"
        >
          <Printer size={16} />
          <span>Ticket</span>
        </button>
      </div>

      {/* Resultado de venta */}
      {receipt && (
        <div className={receiptDetail ? "receipt-result receipt-ticket-result" : "receipt-result"} id="ticket-print-area">
          {receiptDetail ? (
            <ReceiptTicketPreview detail={receiptDetail} companyName={companyName} />
          ) : (
            <>
              <strong>Venta registrada: {receipt.saleNumber}</strong>
              <span>Factura: {receipt.invoiceNumber}</span>
              <span>Comprobante: {receipt.documentType === 2 ? "B01 Credito fiscal" : "B02 Consumidor final"}</span>
              {receipt.localNcf && <span>NCF: {receipt.localNcf}</span>}
              <span>Total: RD$ {receipt.grandTotal.toLocaleString("es-DO")}</span>
              <span>
                Pagado: RD$ {receipt.amountPaid.toLocaleString("es-DO")}
                &nbsp;&middot;&nbsp;
                Cambio: RD$ {receipt.changeDue.toLocaleString("es-DO")}
              </span>
              <span>Estado fiscal: {receipt.fiscalStatus}</span>
            </>
          )}
        </div>
      )}

      {/* Documentos suspendidos y cotizaciones */}
      <DocumentList
        title="Ventas suspendidas"
        type="suspended"
        documents={suspendedSales}
        onLoad={onLoadDocument}
        onVoid={onVoidDocument}
      />
      <DocumentList
        title="Cotizaciones"
        type="quote"
        documents={quotes}
        onLoad={onLoadDocument}
        onVoid={onVoidDocument}
      />
    </section>
  );
}

function PaymentField({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="payment-field">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        value={value || ""}
        placeholder="0.00"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function DocumentList({
  title,
  type,
  documents,
  onLoad,
  onVoid
}: {
  title: string;
  type: "suspended" | "quote";
  documents: PosDocumentSummary[];
  onLoad: (id: string, type: "suspended" | "quote") => void;
  onVoid: (id: string, type: "suspended" | "quote") => void;
}) {
  if (documents.length === 0) return null;

  return (
    <div className="document-list">
      <strong>{title}</strong>
      {documents.map((document) => (
        <div className="document-row" key={document.id}>
          <button type="button" onClick={() => onLoad(document.id, type)}>
            <span>{document.number}</span>
            <small>{document.lineCount} productos &middot; RD$ {document.grandTotal.toLocaleString("es-DO")}</small>
          </button>
          <button type="button" title="Anular documento" onClick={() => onVoid(document.id, type)}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
