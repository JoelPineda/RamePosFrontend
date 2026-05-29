import { AlertTriangle, Banknote, Boxes, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartPanel } from "../components/CartPanel";
import { KpiCard } from "../components/KpiCard";
import { ProductSearch } from "../components/ProductSearch";
import { api } from "../services/api";
import { posStore } from "../store/posStore";
import type {
  AuthSession,
  Branch,
  CheckoutReceipt,
  Company,
  CustomerSummary,
  DashboardSnapshot,
  ExecutiveDashboard,
  PosDocumentDetail,
  PosDocumentSummary,
  ProductSummary,
  ReturnReceipt,
  SaleHistoryDetail
} from "../types/api";
import { printReceipt } from "../utils/receiptPrint";

const demoUserId = "00000000-0000-0000-0000-000000000001";

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

const emptyPayments: PaymentAmounts = { cash: 0, card: 0, transfer: 0, credit: 0 };

export function DashboardPage({ session }: { session: AuthSession }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [dashboard, setDashboard] = useState<DashboardSnapshot | null>(null);
  const [executiveDashboard, setExecutiveDashboard] = useState<ExecutiveDashboard | null>(null);
  const [query, setQuery] = useState("");
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);
  const [receiptDetail, setReceiptDetail] = useState<SaleHistoryDetail | null>(null);
  const [returnReceipt, setReturnReceipt] = useState<ReturnReceipt | null>(null);
  const [suspendedSales, setSuspendedSales] = useState<PosDocumentSummary[]>([]);
  const [quotes, setQuotes] = useState<PosDocumentSummary[]>([]);
  const [activeDocument, setActiveDocument] = useState<ActiveDocument>(null);
  const [paymentAmounts, setPaymentAmounts] = useState<PaymentAmounts>(emptyPayments);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const company = companies.find((candidate) => candidate.id === session.companyId) ?? companies[0];
  const branch = branches[0];

  useEffect(() => {
    api.getCompanies()
      .then(setCompanies)
      .catch((caught: Error) => setError(caught.message));
  }, []);

  useEffect(() => {
    api.getBranches(session.tenantId)
      .then(setBranches)
      .catch((caught: Error) => setError(caught.message));
  }, [session.tenantId]);

  useEffect(() => {
    if (!branch) return;
    refreshOperationalData(branch.id);
  }, [branch, query, session.tenantId]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (event.key === "F2") {
        event.preventDefault();
        document.getElementById("pos-search-input")?.focus();
      }
      if (event.key === "F4") { event.preventDefault(); checkout(); }
      if (event.key === "F6") { event.preventDefault(); suspendSale(); }
      if (event.key === "F7") { event.preventDefault(); saveQuote(); }
      if (event.key === "F9") { event.preventDefault(); printTicket(); }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  const branchLabel = useMemo(() => {
    if (!branch || !company) return "Inicializando...";
    return `${company.tradeName ?? company.name} · ${branch.name}`;
  }, [company, branch]);

  async function refreshOperationalData(branchId: string) {
    const [productsResult, dashboardResult, suspendedResult, quotesResult, customersResult] =
      await Promise.allSettled([
        api.getProducts(session.tenantId, branchId, query),
        api.getDashboard(session.tenantId, branchId),
        api.getSuspendedSales(session.tenantId, branchId),
        api.getQuotes(session.tenantId, branchId),
        api.getPosCustomers(session.tenantId)
      ]);

    // Datos criticos: mostrar error solo si productos o dashboard fallan
    if (productsResult.status === "fulfilled") setProducts(productsResult.value);
    else setError(productsResult.reason instanceof Error ? productsResult.reason.message : "No se pudieron cargar los productos.");

    if (dashboardResult.status === "fulfilled") setDashboard(dashboardResult.value);

    // Datos opcionales: ventas suspendidas y cotizaciones (403 si sin permiso = ignorar)
    if (suspendedResult.status === "fulfilled") setSuspendedSales(suspendedResult.value);
    if (quotesResult.status === "fulfilled") setQuotes(quotesResult.value);
    if (customersResult.status === "fulfilled") setCustomers(customersResult.value);

    // Dashboard ejecutivo en segundo plano
    api.getExecutiveDashboard(session.tenantId, branchId)
      .then(setExecutiveDashboard)
      .catch(() => undefined);
  }

  function addProduct(product: ProductSummary) {
    const current = posStore.getSnapshot().find((line) => line.id === product.id);
    if ((current?.quantity ?? 0) + 1 > product.quantityOnHand) {
      setError(`Stock insuficiente para "${product.name}".`);
      return;
    }
    setReceipt(null);
    setReceiptDetail(null);
    setReturnReceipt(null);
    setError(null);
    posStore.add(product);
  }

  function cartPayload() {
    return posStore.getSnapshot().map((line) => ({
      productId: line.id,
      quantity: line.quantity,
      discount: line.discount
    }));
  }

  function cartTotal() {
    return posStore.getSnapshot().reduce((sum, line) => {
      const net = line.price * line.quantity - line.discount;
      return sum + net + net * line.taxRate;
    }, 0);
  }

  function paymentsPayload(total: number) {
    const payments = [
      { method: 1, amount: paymentAmounts.cash,     reference: "Efectivo"      },
      { method: 2, amount: paymentAmounts.card,      reference: "Tarjeta"       },
      { method: 4, amount: paymentAmounts.transfer,  reference: "Transferencia" },
      { method: 3, amount: paymentAmounts.credit,    reference: "Credito"       }
    ].filter((payment) => payment.amount > 0);

    if (payments.reduce((sum, payment) => sum + payment.amount, 0) < total) {
      throw new Error("El pago no cubre el total de la venta.");
    }

    return payments;
  }

  function buildDocumentPayload() {
    if (!branch) throw new Error("No hay sucursal activa.");
    return {
      tenantId:  session.tenantId,
      companyId: session.companyId,
      branchId:  branch.id,
      userId:    session.userId || demoUserId,
      customerId: selectedCustomerId || null,
      lines:  cartPayload(),
      notes:  activeDocument ? `Reabierto desde ${activeDocument.number}` : null
    };
  }

  async function checkout() {
    if (!branch || posStore.getSnapshot().length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const total = cartTotal();
      const nextReceipt = await api.checkout({
        ...buildDocumentPayload(),
        payments: paymentsPayload(total)
      });
      const nextReceiptDetail = await api.getSaleHistoryDetail(nextReceipt.saleId);

      if (activeDocument) {
        if (activeDocument.type === "suspended") {
          await api.voidSuspendedSale(activeDocument.id);
        } else {
          await api.voidQuote(activeDocument.id);
        }
      }

      setReceipt(nextReceipt);
      setReceiptDetail(nextReceiptDetail);
      setReturnReceipt(null);
      setActiveDocument(null);
      setSelectedCustomerId("");
      setPaymentAmounts(emptyPayments);
      posStore.clear();
      await refreshOperationalData(branch.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo procesar la venta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function suspendSale() {
    if (!branch || posStore.getSnapshot().length === 0) return;
    setIsSubmitting(true);
    try {
      await api.saveSuspendedSale(buildDocumentPayload());
      posStore.clear();
      setActiveDocument(null);
      setSelectedCustomerId("");
      setPaymentAmounts(emptyPayments);
      await refreshOperationalData(branch.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo suspender la venta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function saveQuote() {
    if (!branch || posStore.getSnapshot().length === 0) return;
    setIsSubmitting(true);
    try {
      await api.saveQuote(buildDocumentPayload());
      posStore.clear();
      setActiveDocument(null);
      setPaymentAmounts(emptyPayments);
      await refreshOperationalData(branch.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar la cotizacion.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function loadDocument(id: string, type: "suspended" | "quote") {
    try {
      const document = type === "suspended" ? await api.getSuspendedSale(id) : await api.getQuote(id);
      loadDocumentLines(document);
      setActiveDocument({ id: document.id, type, number: document.number });
      setSelectedCustomerId(document.customerId ?? "");
      setReceipt(null);
      setReceiptDetail(null);
      setReturnReceipt(null);
      setPaymentAmounts(emptyPayments);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo reabrir el documento.");
    }
  }

  function loadDocumentLines(document: PosDocumentDetail) {
    posStore.load(document.lines.map((line) => {
      const product = products.find((candidate) => candidate.id === line.productId);
      return {
        id:             line.productId,
        name:           line.productName,
        barcode:        product?.barcode,
        price:          line.unitPrice,
        taxRate:        line.taxRate,
        quantityOnHand: product?.quantityOnHand ?? line.quantity,
        minimumStock:   product?.minimumStock ?? 0,
        quantity:       line.quantity,
        discount:       line.discount
      };
    }));
  }

  async function voidDocument(id: string, type: "suspended" | "quote") {
    if (!branch) return;
    try {
      if (type === "suspended") {
        await api.voidSuspendedSale(id);
      } else {
        await api.voidQuote(id);
      }
      if (activeDocument?.id === id) {
        setActiveDocument(null);
        posStore.clear();
      }
      await refreshOperationalData(branch.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo anular el documento.");
    }
  }

  async function registerReturn() {
    if (!branch || posStore.getSnapshot().length === 0) return;
    setIsSubmitting(true);
    try {
      const nextReturn = await api.registerReturn({
        tenantId:       session.tenantId,
        companyId:      session.companyId,
        branchId:       branch.id,
        userId:         session.userId || demoUserId,
        originalSaleId: null,
        lines:          posStore.getSnapshot().map((line) => ({ productId: line.id, quantity: line.quantity })),
        reference:      activeDocument?.number ?? null,
        notes:          "Devolucion desde POS"
      });
      setReturnReceipt(nextReturn);
      setReceipt(null);
      setReceiptDetail(null);
      posStore.clear();
      setPaymentAmounts(emptyPayments);
      await refreshOperationalData(branch.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo registrar la devolucion.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updatePayment(key: keyof PaymentAmounts, value: number) {
    setPaymentAmounts((current) => ({ ...current, [key]: Math.max(0, value) }));
  }

  function setExactCash(amount: number) {
    setPaymentAmounts({ cash: Number(amount.toFixed(2)), card: 0, transfer: 0, credit: 0 });
  }

  function printTicket() {
    if (receiptDetail && company) {
      printReceipt(receiptDetail, company.tradeName ?? company.name);
      return;
    }

    window.print();
  }

  return (
    <div className="dashboard-page">

      {/* Encabezado */}
      <header className="topbar">
        <div>
          <span>{branchLabel}</span>
          <h1>Operacion diaria</h1>
        </div>
        <div className="operator-pill">{session.userName}</div>
      </header>

      {/* Alertas */}
      {error && <div className="error-banner" role="alert">{error}</div>}
      {returnReceipt && (
        <div className="success-banner" role="status">
          Devolucion registrada: {returnReceipt.saleNumber} &mdash; RD$ {Math.abs(returnReceipt.grandTotal).toLocaleString("es-DO")}
        </div>
      )}

      {/* KPIs del dia */}
      <section className="kpi-grid">
        <KpiCard
          label="Ventas hoy"
          value={`RD$ ${(dashboard?.todaySales ?? 0).toLocaleString("es-DO")}`}
          tone="green"
          icon={Banknote}
        />
        <KpiCard
          label="Transacciones"
          value={`${dashboard?.todayTransactions ?? 0}`}
          tone="blue"
          icon={ReceiptText}
        />
        <KpiCard
          label="Unidades en stock"
          value={`${dashboard?.stockUnits ?? 0}`}
          tone="amber"
          icon={Boxes}
        />
        <KpiCard
          label="Productos bajo minimo"
          value={`${dashboard?.lowStockProducts ?? 0}`}
          tone="red"
          icon={AlertTriangle}
        />
      </section>

      {/* Atajos de teclado */}
      <section className="shortcut-strip" aria-label="Atajos de teclado disponibles">
        <span><kbd>F2</kbd> Buscar producto</span>
        <span><kbd>Enter</kbd> Escanear codigo</span>
        <span><kbd>F4</kbd> Cobrar</span>
        <span><kbd>F6</kbd> Suspender</span>
        <span><kbd>F7</kbd> Cotizar</span>
        <span><kbd>F9</kbd> Imprimir ticket</span>
      </section>

      {/* Resumen ejecutivo del dia */}
      <section className="report-grid">
        <ReportTile
          label="Ticket promedio"
          value={`RD$ ${(executiveDashboard?.sales.averageTicket ?? 0).toLocaleString("es-DO")}`}
          detail={`${executiveDashboard?.sales.transactionCount ?? 0} ventas hoy`}
        />
        <ReportTile
          label="Producto lider"
          value={executiveDashboard?.products.items[0]?.productName ?? "Sin ventas"}
          detail={`RD$ ${(executiveDashboard?.products.items[0]?.revenue ?? 0).toLocaleString("es-DO")}`}
        />
        <ReportTile
          label="Margen bruto"
          value={`RD$ ${(executiveDashboard?.margins.grossProfit ?? 0).toLocaleString("es-DO")}`}
          detail={`${((executiveDashboard?.margins.grossMargin ?? 0) * 100).toFixed(1)}% de margen`}
        />
        <ReportTile
          label="Valor inventario"
          value={`RD$ ${(executiveDashboard?.inventory.estimatedCostValue ?? 0).toLocaleString("es-DO")}`}
          detail={`${executiveDashboard?.inventory.lowStockProducts ?? 0} bajo minimo`}
        />
        <ReportTile
          label="Caja neta"
          value={`RD$ ${(executiveDashboard?.cash.net ?? 0).toLocaleString("es-DO")}`}
          detail={`Gastos: RD$ ${(executiveDashboard?.cash.expenses ?? 0).toLocaleString("es-DO")}`}
        />
        <ReportTile
          label="Cliente principal"
          value={executiveDashboard?.customers.customers[0]?.customerName ?? "Cliente contado"}
          detail={`RD$ ${(executiveDashboard?.customers.customers[0]?.totalSales ?? 0).toLocaleString("es-DO")}`}
        />
      </section>

      {/* Workspace POS */}
      <section className="workspace-grid">
        <ProductSearch
          products={products}
          query={query}
          onQueryChange={setQuery}
          onAdd={addProduct}
        />
        <CartPanel
          paymentAmounts={paymentAmounts}
          onPaymentChange={updatePayment}
          onExactCash={setExactCash}
          onCheckout={checkout}
          onSuspend={suspendSale}
          onQuote={saveQuote}
          onReturn={registerReturn}
          onPrint={printTicket}
          onLoadDocument={loadDocument}
          onVoidDocument={voidDocument}
          receipt={receipt}
          receiptDetail={receiptDetail}
          companyName={company?.tradeName ?? company?.name ?? session.companyName}
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onCustomerChange={setSelectedCustomerId}
          suspendedSales={suspendedSales}
          quotes={quotes}
          activeDocument={activeDocument}
          isSubmitting={isSubmitting}
        />
      </section>

    </div>
  );
}

function ReportTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="report-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
