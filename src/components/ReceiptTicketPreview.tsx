import type { SaleHistoryDetail } from "../types/api";
import { receiptPaymentMethodLabel } from "../utils/receiptPrint";

const money = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" });

export function ReceiptTicketPreview({
  detail,
  companyName
}: {
  detail: SaleHistoryDetail;
  companyName: string;
}) {
  const change = detail.payments.reduce((sum, payment) => sum + payment.amount, 0) - detail.grandTotal;

  return (
    <div style={{
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 12,
      background: "#fff",
      width: 280,
      padding: "12px 14px 20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      lineHeight: 1.5
    }}>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{ fontWeight: "bold", fontSize: 16, letterSpacing: 1 }}>{companyName}</div>
        <div style={{ fontSize: 11 }}>{detail.branchName ?? ""}</div>
      </div>
      <div style={{ textAlign: "center", borderTop: "2px dashed #000", borderBottom: "2px dashed #000", padding: "4px 0", marginBottom: 6 }}>
        <div style={{ fontWeight: "bold", fontSize: 14 }}>{detail.saleNumber}</div>
        {detail.status === 5 && <div style={{ fontWeight: "bold", fontSize: 12 }}>*** DEVOLUCION ***</div>}
      </div>

      <ReceiptRow label="Fecha" value={new Date(detail.createdAt).toLocaleDateString("es-DO")} />
      <ReceiptRow label="Hora" value={new Date(detail.createdAt).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })} />
      <ReceiptRow label="NCF" value={detail.localNcf ?? "PENDIENTE"} />
      <ReceiptRow label="Cajero" value={detail.userName ?? "-"} />
      <ReceiptRow label="Cliente" value={detail.customerName ?? "Consumidor Final"} />

      <Divider />

      {detail.lines.map((line, index) => (
        <div key={`${line.productId}-${index}`} style={{ marginBottom: 4 }}>
          <div style={{ fontWeight: "bold", fontSize: 11 }}>{line.productName}</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
            <span>{line.quantity} x {money.format(line.unitPrice)}</span>
            <span>{money.format(line.lineTotal)}</span>
          </div>
          {line.discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#666" }}>
              <span>Descuento</span><span>- {money.format(line.discount)}</span>
            </div>
          )}
        </div>
      ))}

      <Divider />

      <ReceiptRow label="Subtotal" value={money.format(detail.subtotal)} />
      <ReceiptRow label="ITBIS (18%)" value={money.format(detail.taxTotal)} />
      {detail.discountTotal > 0 && <ReceiptRow label="Descuento" value={`- ${money.format(detail.discountTotal)}`} />}
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 14, borderTop: "1px dashed #000", marginTop: 4, paddingTop: 4 }}>
        <span>TOTAL</span><span>{money.format(detail.grandTotal)}</span>
      </div>

      <Divider />

      <div style={{ fontWeight: "bold", fontSize: 11, marginBottom: 3 }}>FORMA DE PAGO</div>
      {detail.payments.map((payment, index) => (
        <ReceiptRow key={`${payment.method}-${index}`} label={receiptPaymentMethodLabel(payment.method)} value={money.format(payment.amount)} />
      ))}
      {change > 0.005 && <ReceiptRow label="Cambio" value={money.format(change)} />}

      <div style={{ textAlign: "center", marginTop: 12, fontSize: 11 }}>
        <div>Gracias por su compra!</div>
        <div style={{ fontSize: 10, marginTop: 3 }}>Conserve su factura para cambios y devoluciones.</div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
      <span>{label}:</span><span>{value}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />;
}
