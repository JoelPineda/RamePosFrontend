import type { SaleHistoryDetail } from "../types/api";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function receiptPaymentMethodLabel(method: number) {
  return {
    1: "Efectivo",
    2: "Tarjeta",
    3: "Credito",
    4: "Transferencia"
  }[method] ?? `${method}`;
}

export function buildReceiptHtml(sel: SaleHistoryDetail, companyName: string): string {
  const fmt = new Intl.NumberFormat("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtMoney = (value: number) => `RD$ ${fmt.format(value)}`;
  const date = new Date(sel.createdAt);
  const dateStr = date.toLocaleDateString("es-DO", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = date.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const divider = `<div class="div">--------------------------------</div>`;
  const dividerBold = `<div class="div bold">================================</div>`;

  const totalPaid = sel.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const change = totalPaid - sel.grandTotal;

  const linesHtml = sel.lines.map((line) => `
    <div class="item">
      <div class="item-name">${escapeHtml(line.productName)}</div>
      <div class="item-row">
        <span>${line.quantity} x ${fmtMoney(line.unitPrice)}</span>
        <span>${fmtMoney(line.lineTotal)}</span>
      </div>
      ${line.discount > 0 ? `<div class="item-row disc"><span>Descuento</span><span>- ${fmtMoney(line.discount)}</span></div>` : ""}
    </div>`).join("");

  const paymentsHtml = sel.payments.map((payment) => `
    <div class="total-row">
      <span>${receiptPaymentMethodLabel(payment.method)}</span>
      <span>${fmtMoney(payment.amount)}</span>
    </div>`).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${escapeHtml(sel.saleNumber)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      background: #fff;
      color: #000;
      width: 80mm;
      padding: 6mm 4mm 10mm;
    }
    .center { text-align: center; }
    .right  { text-align: right; }
    .bold   { font-weight: bold; }
    .large  { font-size: 15px; }
    .small  { font-size: 10px; }
    .div {
      letter-spacing: 1px;
      margin: 4px 0;
      color: #444;
    }
    .header { margin-bottom: 4px; }
    .header .company { font-size: 16px; font-weight: bold; letter-spacing: 1px; }
    .header .branch  { font-size: 11px; }
    .meta-row { display: flex; justify-content: space-between; margin: 2px 0; }
    .item { margin: 3px 0; }
    .item-name { font-weight: bold; font-size: 11px; }
    .item-row  { display: flex; justify-content: space-between; font-size: 11px; }
    .item-row.disc { color: #555; font-size: 10px; }
    .total-row { display: flex; justify-content: space-between; margin: 2px 0; }
    .total-row.grand { font-size: 14px; font-weight: bold; margin-top: 4px; }
    .footer { text-align: center; margin-top: 8px; font-size: 11px; }
    @media print {
      body { width: 80mm; margin: 0; padding: 6mm 4mm 10mm; }
      @page { size: 80mm auto; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="header center">
    <div class="company">${escapeHtml(companyName)}</div>
    <div class="branch">${escapeHtml(sel.branchName ?? "")}</div>
  </div>
  ${dividerBold}
  <div class="meta-row"><span>Fecha:</span><span>${dateStr}</span></div>
  <div class="meta-row"><span>Hora:</span><span>${timeStr}</span></div>
  <div class="meta-row"><span>Factura:</span><span class="bold">${escapeHtml(sel.saleNumber)}</span></div>
  <div class="meta-row"><span>NCF:</span><span class="bold">${escapeHtml(sel.localNcf ?? "PENDIENTE")}</span></div>
  <div class="meta-row"><span>Cajero:</span><span>${escapeHtml(sel.userName ?? "-")}</span></div>
  <div class="meta-row"><span>Cliente:</span><span>${escapeHtml(sel.customerName ?? "Consumidor Final")}</span></div>
  ${sel.status === 5 ? `<div class="center bold" style="margin:4px 0;font-size:13px;">*** DEVOLUCION ***</div>` : ""}
  ${dividerBold}
  <div class="bold" style="margin-bottom:3px;">DESCRIPCION           CANT  TOTAL</div>
  ${divider}
  ${linesHtml}
  ${divider}
  <div class="total-row"><span>Subtotal:</span><span>${fmtMoney(sel.subtotal)}</span></div>
  <div class="total-row"><span>ITBIS (18%):</span><span>${fmtMoney(sel.taxTotal)}</span></div>
  ${sel.discountTotal > 0 ? `<div class="total-row"><span>Descuento:</span><span>- ${fmtMoney(sel.discountTotal)}</span></div>` : ""}
  ${divider}
  <div class="total-row grand"><span>TOTAL:</span><span>${fmtMoney(sel.grandTotal)}</span></div>
  ${dividerBold}
  <div class="bold" style="margin-bottom:3px;">FORMA DE PAGO</div>
  ${paymentsHtml}
  ${change > 0.005 ? `<div class="total-row"><span>Cambio:</span><span>${fmtMoney(change)}</span></div>` : ""}
  ${dividerBold}
  <div class="footer">
    <div>Gracias por su compra!</div>
    <div class="small" style="margin-top:4px;">Conserve su factura para cambios</div>
    <div class="small">y devoluciones.</div>
  </div>
</body>
</html>`;
}

export function printReceipt(detail: SaleHistoryDetail, companyName: string) {
  const win = window.open("", "_blank", "width=400,height=700,toolbar=no,menubar=no");
  if (!win) return;
  win.document.open();
  win.document.write(buildReceiptHtml(detail, companyName));
  win.document.close();
  win.onload = () => {
    win.focus();
    win.print();
  };
}
