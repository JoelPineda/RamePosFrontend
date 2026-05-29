import {
  Bell,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CheckCheck,
  Contact,
  Download,
  FileSearch,
  Loader2,
  MailCheck,
  PackageSearch,
  Plus,
  RefreshCw,
  ShoppingBag,
  Upload,
  UserRoundCog,
  Users
} from "lucide-react";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import type { AppView } from "../components/AppShell";
import { Pagination } from "../components/Pagination";
import { ReceiptTicketPreview } from "../components/ReceiptTicketPreview";
import { api } from "../services/api";
import { printReceipt as printReceiptDocument } from "../utils/receiptPrint";
import type {
  AccountSummary,
  AppNotification,
  AdminRole,
  AdminUser,
  AgingReport,
  AuditLogSummary,
  AuthSession,
  BankAccountSummary,
  BankTransactionSummary,
  Branch,
  BulkImportResult,
  CashSession,
  CashSummary,
  CategorySummary,
  Company,
  CreditNote,
  CrmActivitySummary,
  CrmLeadSummary,
  CrmOpportunitySummary,
  CustomerStatement,
  CustomerSummary,
  EmployeeSummary,
  EmailStatus,
  ExpenseCategorySummary,
  ExpenseReport,
  ExpenseSummary,
  ExecutiveDashboard,
  FiscalPendingDocument,
  GeneralLedger,
  InventoryMovementSummary,
  InventoryStockItem,
  InvoiceDetail,
  InvoiceSummary,
  JournalEntryDetail,
  JournalEntrySummary,
  KardexEntry,
  PayrollPeriodDetail,
  PayrollPeriodSummary,
  PayableSummary,
  PermissionSummary,
  PredictiveAnalytics,
  ProductSummary,
  PurchaseDetail,
  PurchaseOrderDocument,
  PurchaseReport,
  PurchaseReturnDetail,
  PurchaseReturnSummary,
  PurchaseSummary,
  ReceivableSummary,
  SaleHistoryDetail,
  SaleHistorySummary,
  SalesReport,
  SupplierStatement,
  SupplierSummary,
  TrialBalanceLine,
  TrialBalanceSummary
} from "../types/api";

type AdminConsolePageProps = {
  session: AuthSession;
  activeView: AppView;
};

type AdminData = {
  branches: Branch[];
  customers: CustomerSummary[];
  receivables: ReceivableSummary[];
  customerStatement: CustomerStatement | null;
  categories: CategorySummary[];
  products: ProductSummary[];
  stock: InventoryStockItem[];
  inventoryAlerts: InventoryStockItem[];
  inventoryMovements: InventoryMovementSummary[];
  kardex: KardexEntry[];
  suppliers: SupplierSummary[];
  payables: PayableSummary[];
  supplierStatement: SupplierStatement | null;
  purchases: PurchaseSummary[];
  purchaseDetail: PurchaseDetail | null;
  purchaseReturns: PurchaseReturnSummary[];
  purchaseReturnDetail: PurchaseReturnDetail | null;
  expenseCategories: ExpenseCategorySummary[];
  expenses: ExpenseSummary[];
  accounts: AccountSummary[];
  bankAccounts: BankAccountSummary[];
  bankTransactions: BankTransactionSummary[];
  journalEntries: JournalEntrySummary[];
  journalEntryDetail: JournalEntryDetail | null;
  trialBalance: TrialBalanceSummary | null;
  generalLedger: GeneralLedger | null;
  employees: EmployeeSummary[];
  payrollPeriods: PayrollPeriodSummary[];
  payrollDetail: PayrollPeriodDetail | null;
  leads: CrmLeadSummary[];
  opportunities: CrmOpportunitySummary[];
  activities: CrmActivitySummary[];
  executiveDashboard: ExecutiveDashboard | null;
  predictiveAnalytics: PredictiveAnalytics | null;
  salesReport: SalesReport | null;
  expenseReport: ExpenseReport | null;
  purchaseReport: PurchaseReport | null;
  receivablesAging: AgingReport | null;
  payablesAging: AgingReport | null;
  saleHistory: SaleHistorySummary[];
  saleHistoryDetail: SaleHistoryDetail | null;
  creditNotes: CreditNote[];
  cashSessions: CashSession[];
  currentCash: CashSummary | null;
  invoices: InvoiceSummary[];
  invoiceDetail: InvoiceDetail | null;
  fiscalPending: FiscalPendingDocument[];
  companies: Company[];
  users: AdminUser[];
  roles: AdminRole[];
  permissions: PermissionSummary[];
  adminBranches: Branch[];
  auditLogs: AuditLogSummary[];
  emailStatus: EmailStatus | null;
};

const emptyData: AdminData = {
  branches: [],
  customers: [],
  receivables: [],
  customerStatement: null,
  categories: [],
  products: [],
  stock: [],
  inventoryAlerts: [],
  inventoryMovements: [],
  kardex: [],
  suppliers: [],
  payables: [],
  supplierStatement: null,
  purchases: [],
  purchaseDetail: null,
  purchaseReturns: [],
  purchaseReturnDetail: null,
  expenseCategories: [],
  expenses: [],
  accounts: [],
  bankAccounts: [],
  bankTransactions: [],
  journalEntries: [],
  journalEntryDetail: null,
  trialBalance: null,
  generalLedger: null,
  employees: [],
  payrollPeriods: [],
  payrollDetail: null,
  leads: [],
  opportunities: [],
  activities: [],
  executiveDashboard: null,
  predictiveAnalytics: null,
  salesReport: null,
  expenseReport: null,
  purchaseReport: null,
  receivablesAging: null,
  payablesAging: null,
  saleHistory: [],
  saleHistoryDetail: null,
  creditNotes: [],
  cashSessions: [],
  currentCash: null,
  invoices: [],
  invoiceDetail: null,
  fiscalPending: [],
  companies: [],
  users: [],
  roles: [],
  permissions: [],
  adminBranches: [],
  auditLogs: [],
  emailStatus: null
};

function moduleGroup(view: AppView): string {
  const dash = view.indexOf("-");
  return dash === -1 ? view : view.slice(0, dash);
}

const viewMeta: Record<AppView, { title: string; eyebrow: string; permission?: string; icon: typeof Users }> = {
  operations:             { title: "Operacion diaria",      eyebrow: "POS y dashboard", permission: "operations.pos", icon: BriefcaseBusiness },
  "operations-history":   { title: "Historial de facturas", eyebrow: "Operacion", permission: "operations.history", icon: BriefcaseBusiness },
  "operations-cash":      { title: "Caja",                  eyebrow: "Operacion", permission: "operations.cash", icon: Calculator },
  "operations-fiscal":    { title: "Fiscal",                eyebrow: "Operacion", permission: "operations.fiscal", icon: BriefcaseBusiness },
  "customers-new":      { title: "Nuevo cliente",        eyebrow: "Clientes",     permission: "customers.create",      icon: Users         },
  "customers-accounts": { title: "Cuentas por cobrar",   eyebrow: "Clientes",     permission: "customers.receivables", icon: Users         },
  "inventory-categories":{ title: "Categorias",          eyebrow: "Inventario",   permission: "inventory.categories", icon: PackageSearch },
  "inventory-products": { title: "Productos",            eyebrow: "Inventario",   permission: "inventory.products",   icon: PackageSearch },
  "inventory-stock":    { title: "Stock y alertas",      eyebrow: "Inventario",   permission: "inventory.stock",      icon: PackageSearch },
  "purchases-suppliers":{ title: "Suplidores",           eyebrow: "Compras",      permission: "purchases.suppliers", icon: ShoppingBag   },
  "purchases-orders":   { title: "Ordenes de compra",    eyebrow: "Compras",      permission: "purchases.orders",    icon: ShoppingBag   },
  "purchases-returns":  { title: "Devoluciones",         eyebrow: "Compras",      permission: "purchases.returns",   icon: ShoppingBag   },
  "purchases-expenses": { title: "Gastos",               eyebrow: "Compras",      permission: "purchases.expenses",  icon: ShoppingBag   },
  "finance-accounts":   { title: "Plan de cuentas",      eyebrow: "Finanzas",     permission: "finance.accounts",    icon: Calculator    },
  "finance-journal":    { title: "Asientos contables",   eyebrow: "Finanzas",     permission: "finance.journal",     icon: Calculator    },
  "finance-banking":    { title: "Bancos",               eyebrow: "Finanzas",     permission: "finance.banking",     icon: Calculator    },
  "hr-employees":       { title: "Empleados",            eyebrow: "RRHH",         permission: "hr.employees",        icon: UserRoundCog  },
  "hr-payroll":         { title: "Nomina",               eyebrow: "RRHH",         permission: "hr.payroll",          icon: UserRoundCog  },
  "crm-leads":          { title: "Leads",                eyebrow: "CRM",          permission: "crm.leads",           icon: Contact       },
  "crm-pipeline":       { title: "Pipeline CRM",         eyebrow: "CRM",          permission: "crm.pipeline",        icon: Contact       },
  "security-companies": { title: "Companias",            eyebrow: "Seguridad",    permission: "platform.companies",  icon: Building2     },
  "security-subscriptions": { title: "Licencias SaaS",   eyebrow: "Plataforma",   permission: "platform.subscriptions", icon: Building2  },
  "security-branches":  { title: "Sucursales",           eyebrow: "Seguridad",    permission: "security.branches",   icon: Building2     },
  "security-users":     { title: "Usuarios",             eyebrow: "Seguridad",    permission: "security.users",      icon: Users         },
  "security-roles":     { title: "Roles y permisos",     eyebrow: "Seguridad",    permission: "security.roles",      icon: UserRoundCog  },
  "security-settings":  { title: "Configuracion general", eyebrow: "Seguridad",    permission: "security.settings",   icon: Building2     },
  "security-email":     { title: "Correo SMTP",          eyebrow: "Seguridad",    permission: "security.email",      icon: MailCheck     },
  "security-audit":     { title: "Auditoria",             eyebrow: "Seguridad",    permission: "security.audit",      icon: FileSearch    },
  reports:              { title: "Reportes",             eyebrow: "Vista ejecutiva ERP", permission: "reports.view", icon: BriefcaseBusiness }
};

const money = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" });

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

type ScreenAccessOption = {
  code: string;
  label: string;
  grants: string[];
};

type ScreenAccessGroup = {
  label: string;
  options: ScreenAccessOption[];
};

const screenAccessGroups: ScreenAccessGroup[] = [
  {
    label: "Operacion",
    options: [
      { code: "operations.pos", label: "Punto de venta", grants: ["dashboard.view", "pos.sell"] },
      { code: "operations.history", label: "Historial de facturas", grants: ["pos.sell"] },
      { code: "operations.cash", label: "Caja", grants: ["cash.manage"] },
      { code: "operations.fiscal", label: "Fiscal", grants: ["reports.view"] }
    ]
  },
  {
    label: "Clientes",
    options: [
      { code: "customers.create", label: "Nuevo cliente", grants: ["customers.manage"] },
      { code: "customers.receivables", label: "Cuentas por cobrar", grants: ["customers.manage"] }
    ]
  },
  {
    label: "Inventario",
    options: [
      { code: "inventory.categories", label: "Categorias", grants: ["products.manage"] },
      { code: "inventory.products", label: "Productos", grants: ["products.manage"] },
      { code: "inventory.stock", label: "Stock y alertas", grants: ["products.manage"] }
    ]
  },
  {
    label: "Compras",
    options: [
      { code: "purchases.suppliers", label: "Suplidores", grants: ["purchases.manage"] },
      { code: "purchases.orders", label: "Ordenes de compra", grants: ["purchases.manage"] },
      { code: "purchases.returns", label: "Devoluciones", grants: ["purchases.manage"] },
      { code: "purchases.expenses", label: "Gastos", grants: ["purchases.manage"] }
    ]
  },
  {
    label: "Finanzas",
    options: [
      { code: "finance.accounts", label: "Plan de cuentas", grants: ["accounting.manage"] },
      { code: "finance.journal", label: "Asientos / Balance", grants: ["accounting.manage"] },
      { code: "finance.banking", label: "Bancos", grants: ["accounting.manage"] }
    ]
  },
  {
    label: "RRHH",
    options: [
      { code: "hr.employees", label: "Empleados", grants: ["hr.manage"] },
      { code: "hr.payroll", label: "Nomina", grants: ["hr.manage"] }
    ]
  },
  {
    label: "CRM",
    options: [
      { code: "crm.leads", label: "Leads", grants: ["crm.manage"] },
      { code: "crm.pipeline", label: "Pipeline", grants: ["crm.manage"] }
    ]
  },
  {
    label: "Seguridad",
    options: [
      { code: "security.users", label: "Usuarios", grants: ["security.manage"] },
      { code: "security.branches", label: "Sucursales", grants: ["security.manage"] },
      { code: "security.roles", label: "Roles", grants: ["security.manage"] },
      { code: "security.settings", label: "Configuracion general", grants: ["security.manage"] },
      { code: "security.email", label: "Correo SMTP", grants: ["security.manage"] },
      { code: "security.audit", label: "Auditoria", grants: ["security.manage"] },
      { code: "platform.companies", label: "Companias", grants: ["platform.manage"] },
      { code: "platform.subscriptions", label: "Licencias SaaS", grants: ["platform.manage"] }
    ]
  },
  {
    label: "Reportes",
    options: [
      { code: "reports.view", label: "Reportes", grants: ["reports.view"] }
    ]
  }
];

const screenAccessOptions = screenAccessGroups.flatMap((group) => group.options);
const screenAccessCodes = new Set(screenAccessOptions.map((option) => option.code));

const subscriptionModuleOptions = [
  { id: "operations", label: "Operacion / POS" },
  { id: "customers", label: "Clientes y CxC" },
  { id: "inventory", label: "Inventario" },
  { id: "purchases", label: "Compras y gastos" },
  { id: "finance", label: "Finanzas / contabilidad" },
  { id: "hr", label: "RRHH / nomina" },
  { id: "crm", label: "CRM" },
  { id: "reports", label: "Reportes" },
  { id: "mobile", label: "Aplicacion movil" }
];

function subscriptionStatusLabel(status?: string) {
  return {
    Trial: "Prueba",
    Active: "Activa",
    PastDue: "Pago vencido",
    Suspended: "Suspendida",
    Cancelled: "Cancelada"
  }[status ?? "Active"] ?? (status || "Activa");
}

function subscriptionBillingLabel(mode?: string) {
  return {
    Trial: "Prueba",
    Monthly: "Mensual",
    Annual: "Anual",
    Perpetual: "Licencia perpetua"
  }[mode ?? "Monthly"] ?? (mode || "Mensual");
}

function dateInputValue(value?: string) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartInputValue() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function reportDateRangeToUtc(fromDate: string, toDate: string) {
  return {
    fromUtc: fromDate ? `${fromDate}T00:00:00.000Z` : undefined,
    toUtc: toDate ? `${toDate}T23:59:59.999Z` : undefined
  };
}

function supportsBrowserNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

function getBrowserNotificationPermission(): NotificationPermission {
  return supportsBrowserNotifications() ? Notification.permission : "denied";
}

function isDesktopNotificationCandidate(notification: AppNotification) {
  return !notification.isRead && ["warning", "danger"].includes(notification.kind.toLowerCase());
}

export function AdminConsolePage({ session, activeView }: AdminConsolePageProps) {
  const [data, setData] = useState<AdminData>(emptyData);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatementLoading, setIsStatementLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [selectedExpenseCategoryId, setSelectedExpenseCategoryId] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string | null>(null);
  const [selectedJournalEntryId, setSelectedJournalEntryId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedPayrollPeriodId, setSelectedPayrollPeriodId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedSecurityCompanyId, setSelectedSecurityCompanyId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedCashBranchId, setSelectedCashBranchId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<number | "">("");
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [selectedPurchaseReturnId, setSelectedPurchaseReturnId] = useState<string | null>(null);
  const [selectedReportBranchId, setSelectedReportBranchId] = useState<string | null>(null);
  const [reportFromDate, setReportFromDate] = useState(monthStartInputValue);
  const [reportToDate, setReportToDate] = useState(todayInputValue);
  const [historySearch, setHistorySearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditSucceededFilter, setAuditSucceededFilter] = useState<"all" | "success" | "failed">("all");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<NotificationPermission>(() => getBrowserNotificationPermission());

  // ─── Estado de paginación ─────────────────────────────────────────────────
  const [productPage,   setProductPage]   = useState(1);
  const [customerPage,  setCustomerPage]  = useState(1);
  const [historyPage,   setHistoryPage]   = useState(1);
  const [auditPage,     setAuditPage]     = useState(1);
  const [productMeta,   setProductMeta]   = useState({ total: 0, totalPages: 1 });
  const [customerMeta,  setCustomerMeta]  = useState({ total: 0, totalPages: 1 });
  const [historyMeta,   setHistoryMeta]   = useState({ total: 0, totalPages: 1 });
  const [auditMeta,     setAuditMeta]     = useState({ total: 0, totalPages: 1 });

  const meta = viewMeta[activeView];
  const Icon = meta.icon;

  const canManagePlatform = session.permissions.includes("platform.manage");
  const hasAccess = !meta.permission || session.permissions.includes(meta.permission);

  useEffect(() => {
    setNotice(null);
    setError(null);
    if (hasAccess) {
      refresh();
    }
  }, [activeView, hasAccess, session.tenantId, selectedSecurityCompanyId, selectedCashBranchId, selectedBankAccountId, selectedReportBranchId, reportFromDate, reportToDate, invoiceStatusFilter, productPage, customerPage, historyPage, auditPage, auditSearch, auditSucceededFilter]);

  useEffect(() => {
    refreshNotifications(false);
    const interval = window.setInterval(() => refreshNotifications(true), 60000);
    const onFocus = () => refreshNotifications(true);
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [session.userId, session.companyId, browserNotificationPermission]);

  function desktopNotificationStorageKey() {
    return `ramepos.desktop-notifications.${session.userId}.${session.companyId}`;
  }

  function readDesktopNotificationIds() {
    try {
      return new Set(JSON.parse(localStorage.getItem(desktopNotificationStorageKey()) ?? "[]") as string[]);
    } catch {
      return new Set<string>();
    }
  }

  function writeDesktopNotificationIds(ids: Set<string>) {
    localStorage.setItem(desktopNotificationStorageKey(), JSON.stringify([...ids].slice(-100)));
  }

  function syncDesktopNotifications(items: AppNotification[], emit: boolean) {
    const candidates = items.filter(isDesktopNotificationCandidate);
    const seenIds = readDesktopNotificationIds();
    const unseen = candidates.filter((notification) => !seenIds.has(notification.id));

    if (emit && supportsBrowserNotifications() && browserNotificationPermission === "granted") {
      unseen.forEach((notification) => {
        const desktopNotification = new Notification(notification.title, {
          body: notification.message,
          tag: notification.id,
          requireInteraction: notification.kind.toLowerCase() === "danger"
        });

        desktopNotification.onclick = () => {
          window.focus();
          if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
          }
        };
      });
    }

    candidates.forEach((notification) => seenIds.add(notification.id));
    writeDesktopNotificationIds(seenIds);
  }

  async function requestBrowserNotifications() {
    if (!supportsBrowserNotifications()) {
      setNotice("Este navegador no soporta notificaciones de escritorio.");
      return;
    }

    const permission = await Notification.requestPermission();
    setBrowserNotificationPermission(permission);
    setNotice(permission === "granted"
      ? "Alertas de escritorio activadas para nuevas notificaciones criticas."
      : "El navegador no permitio activar las alertas de escritorio.");
  }

  async function refreshNotifications(emitDesktop = false) {
    try {
      const response = await api.getNotifications(20);
      setNotifications(response.items);
      setUnreadNotifications(response.unread);
      syncDesktopNotifications(response.items, emitDesktop);
    } catch {
      setNotifications([]);
      setUnreadNotifications(0);
    }
  }

  async function markNotificationRead(notification: AppNotification) {
    if (!notification.isRead) {
      await api.markNotificationRead(notification.id);
      await refreshNotifications();
    }
  }

  async function markAllNotificationsRead() {
    await api.markAllNotificationsRead();
    await refreshNotifications();
  }

  async function refresh() {
    setIsLoading(true);
    setError(null);
    try {
      const branches = data.branches.length > 0 ? data.branches : await api.getBranches(session.tenantId);
      const branchId = branches[0]?.id;
      const next: AdminData = { ...data, branches };

      const group = moduleGroup(activeView);

      if (group === "operations") {
        if (activeView === "operations-fiscal") {
          next.invoices = await api.getInvoices(session.tenantId, branchId, invoiceStatusFilter === "" ? undefined : invoiceStatusFilter);
          next.fiscalPending = await api.getFiscalPending(session.tenantId);
          const nextSelectedId = selectedInvoiceId ?? next.invoices[0]?.id ?? null;
          setSelectedInvoiceId(nextSelectedId);
          next.invoiceDetail = nextSelectedId ? await api.getInvoice(nextSelectedId) : null;
          next.creditNotes = next.invoiceDetail?.id ? await api.getCreditNotes(next.invoiceDetail.id) : [];
        } else if (activeView === "operations-cash") {
          const cashBranchId = selectedCashBranchId ?? branchId;
          if (cashBranchId) {
            setSelectedCashBranchId(cashBranchId);
            next.cashSessions = await api.getCashSessions(session.tenantId, cashBranchId);
            try {
              next.currentCash = await api.getCurrentCashSession(session.tenantId, cashBranchId, session.userId);
            } catch {
              next.currentCash = null;
            }
          }
        } else {
          const historyPaged = await api.getSaleHistory(session.tenantId, branchId, undefined, undefined, undefined, historyPage);
          next.saleHistory = historyPaged.items;
          setHistoryMeta({ total: historyPaged.total, totalPages: historyPaged.totalPages });
          const firstId = selectedSaleId ?? next.saleHistory[0]?.saleId ?? null;
          setSelectedSaleId(firstId);
          next.saleHistoryDetail = firstId ? await api.getSaleHistoryDetail(firstId) : null;
          next.creditNotes = next.saleHistoryDetail?.invoiceId ? await api.getCreditNotes(next.saleHistoryDetail.invoiceId) : [];
        }
      }

      if (group === "customers") {
        const [customersPaged, receivables, receivablesAging] = await Promise.all([
          api.getCustomers(session.tenantId, "", customerPage),
          api.getReceivables(session.tenantId),
          api.getReceivablesAging(session.tenantId)
        ]);
        next.customers = customersPaged.items;
        next.receivables = receivables;
        next.receivablesAging = receivablesAging;
        setCustomerMeta({ total: customersPaged.total, totalPages: customersPaged.totalPages });
        const nextSelectedId = selectedCustomerId ?? next.customers[0]?.id ?? null;
        setSelectedCustomerId(nextSelectedId);
        next.customerStatement = nextSelectedId ? await api.getCustomerStatement(nextSelectedId) : null;
      }

      if (group === "inventory") {
        const [categories, productsPaged, stock, inventoryAlerts] = await Promise.all([
          api.getCategories(session.tenantId),
          api.getAdminProducts(session.tenantId, "", productPage),
          api.getInventoryStock(session.tenantId, branchId),
          api.getInventoryAlerts(session.tenantId, branchId)
        ]);
        next.categories = categories;
        next.products = productsPaged.items;
        next.stock = stock;
        next.inventoryAlerts = inventoryAlerts;
        setProductMeta({ total: productsPaged.total, totalPages: productsPaged.totalPages });
        const nextSelectedId = selectedProductId ?? next.products[0]?.id ?? null;
        setSelectedProductId(nextSelectedId);
        const nextCategoryId = selectedCategoryId ?? next.categories[0]?.id ?? null;
        setSelectedCategoryId(nextCategoryId);
        [next.inventoryMovements, next.kardex] = await Promise.all([
          api.getInventoryMovements(session.tenantId, nextSelectedId ?? undefined, branchId),
          nextSelectedId ? api.getKardex(session.tenantId, nextSelectedId, branchId) : Promise.resolve([])
        ]);
      }

      if (group === "purchases") {
        [next.suppliers, next.purchases, next.payables, next.expenseCategories, next.expenses, next.products, next.purchaseReturns] = await Promise.all([
          api.getSuppliers(session.tenantId),
          api.getPurchases(session.tenantId, branchId),
          api.getPayables(session.tenantId),
          api.getExpenseCategories(session.tenantId),
          api.getExpenses(session.tenantId, branchId),
          api.getAdminProducts(session.tenantId).then(p => p.items),
          api.getPurchaseReturns(session.tenantId)
        ]);
        const nextSelectedId = selectedSupplierId ?? next.suppliers[0]?.id ?? null;
        setSelectedSupplierId(nextSelectedId);
        next.supplierStatement = nextSelectedId ? await api.getSupplierStatement(nextSelectedId) : null;
        const nextPurchaseId = selectedPurchaseId ?? next.purchases[0]?.id ?? null;
        setSelectedPurchaseId(nextPurchaseId);
        next.purchaseDetail = nextPurchaseId ? await api.getPurchase(nextPurchaseId) : null;
        const nextReturnId = selectedPurchaseReturnId ?? next.purchaseReturns[0]?.id ?? null;
        setSelectedPurchaseReturnId(nextReturnId);
        next.purchaseReturnDetail = nextReturnId ? await api.getPurchaseReturn(nextReturnId) : null;
        const nextExpenseCategoryId = selectedExpenseCategoryId ?? next.expenseCategories[0]?.id ?? null;
        setSelectedExpenseCategoryId(nextExpenseCategoryId);
        const nextExpenseId = selectedExpenseId ?? next.expenses[0]?.id ?? null;
        setSelectedExpenseId(nextExpenseId);
      }

      if (group === "finance") {
        [next.accounts, next.journalEntries, next.trialBalance, next.bankAccounts] = await Promise.all([
          api.getAccounts(session.tenantId),
          api.getJournalEntries(session.tenantId),
          api.getTrialBalance(session.tenantId),
          api.getBankAccounts(session.tenantId)
        ]);
        const nextBankAccountId = selectedBankAccountId ?? next.bankAccounts[0]?.id ?? null;
        setSelectedBankAccountId(nextBankAccountId);
        next.bankTransactions = await api.getBankTransactions(session.tenantId, nextBankAccountId ?? undefined);
        const nextSelectedId = selectedAccountId ?? next.accounts[0]?.id ?? null;
        setSelectedAccountId(nextSelectedId);
        next.generalLedger = nextSelectedId ? await api.getGeneralLedger(nextSelectedId) : null;
        const nextJournalEntryId = selectedJournalEntryId ?? next.journalEntries[0]?.id ?? null;
        setSelectedJournalEntryId(nextJournalEntryId);
        next.journalEntryDetail = nextJournalEntryId ? await api.getJournalEntry(nextJournalEntryId) : null;
      }

      if (group === "hr") {
        [next.employees, next.payrollPeriods] = await Promise.all([
          api.getEmployees(session.tenantId),
          api.getPayrollPeriods(session.tenantId)
        ]);
        const nextEmployeeId = selectedEmployeeId ?? next.employees[0]?.id ?? null;
        setSelectedEmployeeId(nextEmployeeId);
        const nextSelectedId = selectedPayrollPeriodId ?? next.payrollPeriods[0]?.id ?? null;
        setSelectedPayrollPeriodId(nextSelectedId);
        next.payrollDetail = nextSelectedId ? await api.getPayrollPeriod(nextSelectedId) : null;
      }

      if (group === "crm") {
        [next.leads, next.opportunities, next.activities] = await Promise.all([
          api.getCrmLeads(session.tenantId),
          api.getCrmOpportunities(session.tenantId),
          api.getCrmActivities(session.tenantId)
        ]);
        const nextSelectedId = selectedLeadId ?? next.leads.find((lead) => lead.status !== 4)?.id ?? next.leads[0]?.id ?? null;
        setSelectedLeadId(nextSelectedId);
        const nextOpportunityId = selectedOpportunityId ?? next.opportunities[0]?.id ?? null;
        setSelectedOpportunityId(nextOpportunityId);
        const nextActivityId = selectedActivityId ?? next.activities.find((activity) => activity.status === 1)?.id ?? next.activities[0]?.id ?? null;
        setSelectedActivityId(nextActivityId);
      }

      if (group === "security") {
        let securityTenantId = session.tenantId;
        let securityCompanyId = session.companyId;

        if (canManagePlatform) {
          next.companies = await api.getAdminCompanies();
          const targetCompany =
            next.companies.find((company) => company.id === selectedSecurityCompanyId) ??
            next.companies.find((company) => company.id === session.companyId) ??
            next.companies[0] ??
            null;

          if (targetCompany) {
            securityTenantId = targetCompany.tenantId;
            securityCompanyId = targetCompany.id;
            setSelectedSecurityCompanyId(targetCompany.id);
          }
        } else {
          next.companies = await api.getCompanies();
        }

        [next.users, next.roles, next.permissions, next.adminBranches] = await Promise.all([
          api.getAdminUsers(securityTenantId, securityCompanyId),
          api.getAdminRoles(securityTenantId, securityCompanyId),
          api.getPermissions(),
          api.getAdminBranches(securityTenantId, securityCompanyId)
        ]);
        if (activeView === "security-audit") {
          const auditPaged = await api.getAuditLogs(
            securityTenantId,
            securityCompanyId,
            auditSearch,
            auditSucceededFilter === "all" ? undefined : auditSucceededFilter === "success",
            auditPage
          );
          next.auditLogs = auditPaged.items;
          setAuditMeta({ total: auditPaged.total, totalPages: auditPaged.totalPages });
        }
        if (activeView === "security-email") {
          next.emailStatus = await api.getEmailStatus();
        }
        const nextSelectedUserId = selectedUserId ?? next.users[0]?.id ?? null;
        setSelectedUserId(nextSelectedUserId);
        const nextSelectedRoleId = selectedRoleId ?? next.roles[0]?.id ?? null;
        setSelectedRoleId(nextSelectedRoleId);
        const nextSelectedBranchId = selectedBranchId ?? next.adminBranches[0]?.id ?? null;
        setSelectedBranchId(nextSelectedBranchId);
      }

      if (group === "reports") {
        const reportBranchId = selectedReportBranchId;
        const { fromUtc, toUtc } = reportDateRangeToUtc(reportFromDate, reportToDate);
        const [
          executiveDashboard,
          predictiveAnalytics,
          salesReport,
          expenseReport,
          purchaseReport,
          receivablesAging,
          payablesAging,
          reportProductsPage,
          reportSuppliers
        ] = await Promise.all([
          api.getExecutiveDashboard(session.tenantId, reportBranchId ?? undefined, fromUtc, toUtc),
          api.getPredictiveAnalytics(session.tenantId, reportBranchId ?? undefined, 30),
          api.getSalesReport(session.tenantId, reportBranchId ?? undefined, fromUtc, toUtc),
          api.getExpenseReport(session.tenantId, reportBranchId ?? undefined, fromUtc, toUtc),
          api.getPurchaseReport(session.tenantId, reportBranchId ?? undefined, fromUtc, toUtc),
          api.getReceivablesAging(session.tenantId),
          api.getPayablesAging(session.tenantId),
          api.getAdminProducts(session.tenantId, "", 1, 200),
          api.getSuppliers(session.tenantId)
        ]);
        next.executiveDashboard = executiveDashboard;
        next.predictiveAnalytics = predictiveAnalytics;
        next.salesReport = salesReport;
        next.expenseReport = expenseReport;
        next.purchaseReport = purchaseReport;
        next.receivablesAging = receivablesAging;
        next.payablesAging = payablesAging;
        next.products = reportProductsPage.items;
        next.suppliers = reportSuppliers;
      }

      setData(next);
      await refreshNotifications();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cargar el modulo.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreated(label: string, action: () => Promise<unknown>) {
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(`${label} creado correctamente.`);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar.");
    }
  }

  async function handleSaved(label: string, action: () => Promise<unknown>) {
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(`${label} guardado correctamente.`);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar.");
    }
  }

  async function handleBulkImport(label: string, action: () => Promise<BulkImportResult>) {
    setError(null);
    setNotice(null);
    try {
      const result = await action();
      const detail = `${result.created} creados, ${result.updated} actualizados${result.failed ? `, ${result.failed} con error` : ""}.`;
      const firstError = result.errors[0] ? ` Fila ${result.errors[0].rowNumber}: ${result.errors[0].message}` : "";
      setNotice(`${label}: ${detail}${firstError}`);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo importar el archivo.");
    }
  }

  async function selectCustomer(customerId: string) {
    setSelectedCustomerId(customerId);
    setIsStatementLoading(true);
    setError(null);
    try {
      const statement = await api.getCustomerStatement(customerId);
      setData((current) => ({ ...current, customerStatement: statement }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cargar el estado de cuenta.");
    } finally {
      setIsStatementLoading(false);
    }
  }

  async function recordCustomerPayment(amount: number, method: number, reference: string, notes: string) {
    if (!selectedCustomerId) return;
    await handleCreated("Abono", async () => {
      const statement = await api.recordCustomerPayment(selectedCustomerId, {
        tenantId: session.tenantId,
        companyId: session.companyId,
        customerId: selectedCustomerId,
        amount,
        method,
        reference,
        notes
      });
      setData((current) => ({ ...current, customerStatement: statement }));
    });
  }

  async function selectProduct(productId: string) {
    setSelectedProductId(productId);
    setError(null);
    try {
      const branchId = data.branches[0]?.id;
      const [movements, kardex] = await Promise.all([
        api.getInventoryMovements(session.tenantId, productId, branchId),
        api.getKardex(session.tenantId, productId, branchId)
      ]);
      setData((current) => ({ ...current, inventoryMovements: movements, kardex }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cargar el kardex.");
    }
  }

  function selectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId);
  }

  async function registerInventoryMovement(kind: "entry" | "exit" | "adjustment" | "transfer", payload: {
    productId: string;
    branchId: string;
    toBranchId?: string;
    quantity: number;
    unitCost: number;
    reference: string;
    notes: string;
  }) {
    await handleCreated("Movimiento", async () => {
      const common = {
        tenantId: session.tenantId,
        companyId: session.companyId,
        branchId: payload.branchId,
        productId: payload.productId,
        reference: payload.reference,
        notes: payload.notes
      };

      if (kind === "entry") {
        await api.registerInventoryEntry({
          ...common,
          quantity: payload.quantity,
          unitCost: payload.unitCost
        });
      } else if (kind === "exit") {
        await api.registerInventoryExit({
          ...common,
          quantity: payload.quantity,
          unitCost: payload.unitCost
        });
      } else if (kind === "adjustment") {
        await api.registerInventoryAdjustment({
          ...common,
          quantityDelta: payload.quantity,
          unitCost: payload.unitCost
        });
      } else if (payload.toBranchId) {
        await api.registerInventoryTransfer({
          tenantId: session.tenantId,
          companyId: session.companyId,
          fromBranchId: payload.branchId,
          toBranchId: payload.toBranchId,
          productId: payload.productId,
          quantity: payload.quantity,
          unitCost: payload.unitCost,
          reference: payload.reference,
          notes: payload.notes
        });
      }

      setSelectedProductId(payload.productId);
    });
  }

  async function selectSupplier(supplierId: string) {
    setSelectedSupplierId(supplierId);
    setError(null);
    try {
      const statement = await api.getSupplierStatement(supplierId);
      setData((current) => ({ ...current, supplierStatement: statement }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cargar el estado del suplidor.");
    }
  }

  async function recordSupplierPayment(amount: number, method: number, reference: string, notes: string) {
    if (!selectedSupplierId) return;
    await handleCreated("Pago a suplidor", async () => {
      const statement = await api.recordSupplierPayment(selectedSupplierId, {
        tenantId: session.tenantId,
        companyId: session.companyId,
        supplierId: selectedSupplierId,
        amount,
        method,
        reference,
        notes
      });
      setData((current) => ({ ...current, supplierStatement: statement }));
    });
  }

  async function selectPurchase(purchaseId: string) {
    setSelectedPurchaseId(purchaseId);
    setError(null);
    try {
      const detail = await api.getPurchase(purchaseId);
      setData((current) => ({ ...current, purchaseDetail: detail }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cargar la orden de compra.");
    }
  }

  async function printPurchaseOrder(purchaseId: string) {
    setError(null);
    try {
      const document = await api.getPurchaseOrderDocument(purchaseId);
      printPurchaseOrderDocument(document, session.companyName);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo imprimir la orden de compra.");
    }
  }

  async function issuePurchase(purchaseId: string) {
    await handleCreated("Orden emitida", () => api.issuePurchase(purchaseId, {
      userId: session.userId,
      expectedAt: null,
      supplierReference: null,
      notes: "Emitida desde frontend"
    }));
  }

  async function receivePurchase(purchaseId: string) {
    await handleCreated("Compra recibida", () => api.receivePurchase(purchaseId));
  }

  async function cancelPurchase(purchaseId: string) {
    await handleSaved("Orden cancelada", () => api.cancelPurchase(purchaseId));
  }

  async function selectPurchaseReturn(returnId: string) {
    setSelectedPurchaseReturnId(returnId);
    setError(null);
    try {
      const detail = await api.getPurchaseReturn(returnId);
      setData((current) => ({ ...current, purchaseReturnDetail: detail }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cargar la devolucion.");
    }
  }

  async function confirmPurchaseReturn(returnId: string) {
    await handleCreated("Devolucion confirmada", async () => {
      await api.confirmPurchaseReturn(returnId);
      setSelectedPurchaseReturnId(returnId);
    });
  }

  async function cancelPurchaseReturn(returnId: string) {
    await handleCreated("Devolucion cancelada", async () => {
      await api.cancelPurchaseReturn(returnId);
      setSelectedPurchaseReturnId(returnId);
    });
  }

  async function approveExpense(expenseId: string) {
    await handleCreated("Gasto aprobado", () => api.approveExpense(expenseId));
  }

  async function payExpense(expenseId: string) {
    await handleCreated("Gasto pagado", () => api.payExpense(expenseId, {
      method: 4,
      cashRegisterSessionId: null,
      reference: "Frontend",
      notes: "Pago registrado desde consola web"
    }));
  }

  async function cancelExpense(expenseId: string) {
    await handleSaved("Gasto cancelado", () => api.cancelExpense(expenseId));
  }

  async function selectExpense(expenseId: string) {
    setSelectedExpenseId(expenseId);
    setError(null);
    try {
      const expense = await api.getExpense(expenseId);
      setData((current) => ({
        ...current,
        expenses: current.expenses.map((item) => item.id === expense.id ? expense : item)
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cargar el gasto.");
    }
  }

  async function selectAccount(accountId: string) {
    setSelectedAccountId(accountId);
    setError(null);
    try {
      const ledger = await api.getGeneralLedger(accountId);
      setData((current) => ({ ...current, generalLedger: ledger }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cargar el mayor de la cuenta.");
    }
  }

  async function selectJournalEntry(entryId: string) {
    setSelectedJournalEntryId(entryId);
    setError(null);
    try {
      const detail = await api.getJournalEntry(entryId);
      setData((current) => ({ ...current, journalEntryDetail: detail }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cargar el asiento contable.");
    }
  }

  async function postJournalEntry(entryId: string) {
    await handleCreated("Asiento posteado", () => api.postJournalEntry(entryId));
  }

  async function voidJournalEntry(entryId: string) {
    await handleCreated("Asiento anulado", () => api.voidJournalEntry(entryId));
  }

  async function selectPayrollPeriod(periodId: string) {
    setSelectedPayrollPeriodId(periodId);
    setError(null);
    try {
      const detail = await api.getPayrollPeriod(periodId);
      setData((current) => ({ ...current, payrollDetail: detail }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cargar la nomina.");
    }
  }

  async function terminateEmployee(employeeId: string) {
    await handleCreated("Empleado terminado", () => api.terminateEmployee(employeeId));
  }

  async function cancelPayroll(periodId: string) {
    await handleSaved("Periodo de nomina", () => api.cancelPayrollPeriod(periodId));
  }

  async function calculatePayroll(periodId: string) {
    await handleCreated("Nomina calculada", () => api.calculatePayrollPeriod(periodId, { adjustments: [] }));
  }

  async function postPayroll(periodId: string) {
    await handleCreated("Nomina posteada", () => api.postPayrollPeriod(periodId));
  }

  async function payPayroll(periodId: string) {
    await handleCreated("Nomina pagada", () => api.payPayrollPeriod(periodId));
  }

  async function advanceLead(leadId: string) {
    const lead = data.leads.find((item) => item.id === leadId);
    if (!lead || lead.status >= 4) return;
    await handleCreated("Lead actualizado", () => api.updateCrmLead(leadId, {
      tenantId: session.tenantId,
      companyId: session.companyId,
      assignedUserId: lead.assignedUserId ?? null,
      companyName: lead.companyName ?? null,
      contactName: lead.contactName,
      phone: lead.phone ?? null,
      email: lead.email ?? null,
      source: lead.source ?? "Frontend",
      status: lead.status + 1,
      estimatedValue: lead.estimatedValue,
      notes: lead.notes ?? null,
      nextFollowUpAt: lead.nextFollowUpAt ?? null
    }));
    setSelectedLeadId(leadId);
  }

  async function convertLead(leadId: string, payload: unknown) {
    await handleCreated("Lead convertido", () => api.convertCrmLead(leadId, payload));
    setSelectedLeadId(leadId);
  }

  async function selectSale(saleId: string) {
    setSelectedSaleId(saleId);
    setError(null);
    try {
      const detail = await api.getSaleHistoryDetail(saleId);
      const creditNotes = detail.invoiceId ? await api.getCreditNotes(detail.invoiceId) : [];
      setData((current) => ({ ...current, saleHistoryDetail: detail, creditNotes }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cargar la venta.");
    }
  }

  async function registerSaleReturn(originalSaleId: string, lines: { productId: string; quantity: number }[]) {
    const selectedDetail = data.saleHistoryDetail;
    if (!selectedDetail || lines.length === 0) return;

    await handleCreated("Devolucion", async () => {
      await api.registerReturn({
        tenantId: session.tenantId,
        companyId: session.companyId,
        branchId: selectedDetail.branchId,
        userId: session.userId,
        originalSaleId,
        lines,
        reference: selectedDetail.saleNumber,
        notes: "Devolucion desde historial de facturas"
      });
      setSelectedSaleId(originalSaleId);
    });
  }

  async function selectInvoice(invoiceId: string) {
    setSelectedInvoiceId(invoiceId);
    setError(null);
    try {
      const detail = await api.getInvoice(invoiceId);
      const creditNotes = await api.getCreditNotes(invoiceId);
      setData((current) => ({ ...current, invoiceDetail: detail, creditNotes }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cargar la factura fiscal.");
    }
  }

  async function submitFiscalInvoice(invoiceId: string) {
    await handleSaved("Factura fiscal", () => api.submitFiscalInvoice(invoiceId));
  }

  async function markInvoiceLocalOnly(invoiceId: string) {
    await handleSaved("Factura local", () => api.markInvoiceLocalOnly(invoiceId));
  }

  async function completeActivity(activityId: string) {
    await handleCreated("Actividad completada", () => api.completeCrmActivity(activityId));
  }

  async function cancelActivity(activityId: string) {
    await handleSaved("Actividad", () => api.cancelCrmActivity(activityId));
  }

  async function exportReport(report: string) {
    setError(null);
    setNotice(null);
    try {
      const branchId = selectedReportBranchId ?? undefined;
      const { fromUtc, toUtc } = reportDateRangeToUtc(reportFromDate, reportToDate);
      const content = await api.exportReportCsv(report, session.tenantId, branchId, fromUtc, toUtc);
      const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${report}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setNotice(`Reporte ${report} exportado.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo exportar el reporte.");
    }
  }

  const summaryCards = useMemo(() => getSummaryCards(activeView, data), [activeView, data]);

  // Derived selections used by sub-view renders
  const selCustomer  = selectedCustomerId ? data.customers.find(c => c.id === selectedCustomerId) ?? null : null;
  const selProduct   = selectedProductId ? data.products.find(p  => p.id === selectedProductId) ?? null : null;
  const selSupplier  = selectedSupplierId ? data.suppliers.find(s => s.id === selectedSupplierId) ?? null : null;
  const selAccount   = selectedAccountId ? data.accounts.find(a  => a.id === selectedAccountId) ?? null : null;
  const selBankAccount = selectedBankAccountId ? data.bankAccounts.find(account => account.id === selectedBankAccountId) ?? null : null;
  const selEmployee  = selectedEmployeeId ? data.employees.find(employee => employee.id === selectedEmployeeId) ?? null : null;
  const selPeriod    = selectedPayrollPeriodId ? data.payrollPeriods.find(p => p.id === selectedPayrollPeriodId) ?? null : null;
  const selLead      = selectedLeadId ? data.leads.find(l => l.id === selectedLeadId) ?? null : null;
  const selOpportunity = selectedOpportunityId ? data.opportunities.find(opportunity => opportunity.id === selectedOpportunityId) ?? null : null;
  const selActivity = selectedActivityId ? data.activities.find(activity => activity.id === selectedActivityId) ?? null : null;
  const selUser      = selectedUserId ? data.users.find(user => user.id === selectedUserId) ?? null : null;
  const selRole      = selectedRoleId ? data.roles.find(role => role.id === selectedRoleId) ?? null : null;
  const selAdminBranch = selectedBranchId ? data.adminBranches.find(branch => branch.id === selectedBranchId) ?? null : null;
  const selExpense = selectedExpenseId ? data.expenses.find(expense => expense.id === selectedExpenseId) ?? null : null;
  const selCompanyForEdit = activeView === "security-companies" && selectedSecurityCompanyId
    ? data.companies.find((company) => company.id === selectedSecurityCompanyId) ?? null
    : null;
  const selectedSecurityCompany =
    data.companies.find((company) => company.id === selectedSecurityCompanyId) ??
    data.companies.find((company) => company.id === session.companyId) ??
    data.companies[0] ??
    {
      id: session.companyId,
      tenantId: session.tenantId,
      name: session.companyName,
      isActive: true
    };

  const statement    = data.customerStatement;
  const supStatement = data.supplierStatement;
  const supPayables  = data.payables.filter(p => p.supplierId === selSupplier?.id);
  const selStock     = data.stock.filter(item => item.productId === selProduct?.id);
  const selExpenseCategory = selectedExpenseCategoryId
    ? data.expenseCategories.find((category) => category.id === selectedExpenseCategoryId) ?? null
    : null;

  if (!hasAccess) {
    return (
      <AdminPageFrame
        meta={meta}
        isLoading={false}
        onRefresh={refresh}
        notifications={notifications}
        unreadNotifications={unreadNotifications}
        showNotifications={showNotifications}
        browserNotificationPermission={browserNotificationPermission}
        onToggleNotifications={() => setShowNotifications((current) => !current)}
        onEnableBrowserNotifications={requestBrowserNotifications}
        onMarkNotificationRead={markNotificationRead}
        onMarkAllNotificationsRead={markAllNotificationsRead}
      >
        <div className="empty-state admin-empty">Tu rol no tiene permiso para este modulo.</div>
      </AdminPageFrame>
    );
  }

  async function createCreditNote(payload: { modificationCode: number; reason: string; amount?: number | null }) {
    const selectedDetail = data.saleHistoryDetail;
    if (!selectedDetail?.invoiceId) return;

    await handleCreated("Nota de credito", async () => {
      await api.createCreditNote(selectedDetail.invoiceId!, {
        tenantId: session.tenantId,
        companyId: session.companyId,
        invoiceId: selectedDetail.invoiceId,
        userId: session.userId,
        modificationCode: payload.modificationCode,
        reason: payload.reason,
        amount: payload.amount ?? null
      });
      const creditNotes = await api.getCreditNotes(selectedDetail.invoiceId!);
      setData((current) => ({ ...current, creditNotes }));
    });
  }

  return (
    <AdminPageFrame
      meta={meta}
      isLoading={isLoading}
      onRefresh={refresh}
      notifications={notifications}
      unreadNotifications={unreadNotifications}
      showNotifications={showNotifications}
      browserNotificationPermission={browserNotificationPermission}
      onToggleNotifications={() => setShowNotifications((current) => !current)}
      onEnableBrowserNotifications={requestBrowserNotifications}
      onMarkNotificationRead={markNotificationRead}
      onMarkAllNotificationsRead={markAllNotificationsRead}
    >
      {error && <div className="error-banner">{error}</div>}
      {notice && <div className="success-banner">{notice}</div>}

      <section className="admin-summary-grid">
        {summaryCards.map((card) => (
          <article className="admin-stat" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      {/* ── Historial de facturas ─────────────────────────────────── */}
      {activeView === "operations-history" && (
        <SaleHistoryView
          history={data.saleHistory}
          detail={data.saleHistoryDetail}
          creditNotes={data.creditNotes}
          selectedSaleId={selectedSaleId}
          search={historySearch}
          companyName={session.companyName}
          page={historyPage}
          totalPages={historyMeta.totalPages}
          total={historyMeta.total}
          onPageChange={setHistoryPage}
          onSearchChange={setHistorySearch}
          onSelect={selectSale}
          onReturn={registerSaleReturn}
          onCreateCreditNote={createCreditNote}
          onSearchSubmit={async (q) => {
            setIsLoading(true);
            setError(null);
            try {
              const branchId = data.branches[0]?.id;
              const paged = await api.getSaleHistory(session.tenantId, branchId, q);
              setData((current) => ({ ...current, saleHistory: paged.items }));
              setHistoryMeta({ total: paged.total, totalPages: paged.totalPages });
              if (paged.items[0]) {
                setSelectedSaleId(paged.items[0].saleId);
                const detail = await api.getSaleHistoryDetail(paged.items[0].saleId);
                const creditNotes = detail.invoiceId ? await api.getCreditNotes(detail.invoiceId) : [];
                setData((current) => ({ ...current, saleHistoryDetail: detail, creditNotes }));
              } else {
                setSelectedSaleId(null);
                setData((current) => ({ ...current, saleHistoryDetail: null, creditNotes: [] }));
              }
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Error al buscar.");
            } finally {
              setIsLoading(false);
            }
          }}
        />
      )}

      {activeView === "operations-cash" && (
        <CashWorkspace
          session={session}
          branches={data.branches}
          selectedBranchId={selectedCashBranchId}
          current={data.currentCash}
          sessions={data.cashSessions}
          onSelectBranch={setSelectedCashBranchId}
          onCreate={(action) => handleCreated("Caja", action)}
          onUpdate={(action) => handleSaved("Caja", action)}
        />
      )}

      {activeView === "operations-fiscal" && (
        <FiscalWorkspace
          invoices={data.invoices}
          detail={data.invoiceDetail}
          pending={data.fiscalPending}
          creditNotes={data.creditNotes}
          selectedInvoiceId={selectedInvoiceId}
          statusFilter={invoiceStatusFilter}
          onStatusFilterChange={setInvoiceStatusFilter}
          onSelectInvoice={selectInvoice}
          onSubmitInvoice={submitFiscalInvoice}
          onMarkLocalOnly={markInvoiceLocalOnly}
        />
      )}

      {/* ── Clientes ──────────────────────────────────────────────── */}
      {activeView === "customers-new" && (
        <section className="customer-workspace">
          <div className="customer-left">
            <CustomerQuickForm
              session={session}
              customer={selCustomer}
              onCreate={(action) => handleCreated("Cliente", action)}
              onDelete={(customer) => handleSaved("Cliente", () => api.deleteCustomer(customer.id))}
              onUpdate={(customer, payload) => handleSaved("Cliente", () => api.updateCustomer(customer.id, payload))}
            />
            <BulkImportPanel
              title="Carga masiva de clientes"
              description="Importa clientes desde Excel. Si el email o RNC/Cedula ya existe, se actualiza."
              templateFileName="plantilla-clientes-rame-pos.xlsx"
              onDownloadTemplate={() => api.downloadCustomerImportTemplate()}
              onImport={(file) => api.importCustomers(file)}
              onRefresh={async () => { setCustomerPage(1); await refresh(); }}
            />
            <section className="panel admin-panel">
              <div className="panel-title">
                <strong>Clientes</strong>
                <button type="button" onClick={() => { setSelectedCustomerId(null); setData((current) => ({ ...current, customerStatement: null })); }}>Nuevo</button>
              </div>
              <div className="customer-list">
                {data.customers.length === 0
                  ? <p className="empty-state">Sin clientes registrados.</p>
                  : data.customers.map((customer) => (
                    <button
                      className={customer.id === selCustomer?.id ? "customer-row customer-row-active" : "customer-row"}
                      key={customer.id} type="button"
                      onClick={() => selectCustomer(customer.id)}
                    >
                      <span>
                        <strong>{customer.name}</strong>
                        <small>{customer.phone || customer.email || "Sin contacto"}</small>
                      </span>
                      <span>
                        <strong>{money.format(customer.creditBalance ?? 0)}</strong>
                        <small>{customer.type === 2 ? "Credito" : "Contado"}</small>
                      </span>
                    </button>
                  ))}
              </div>
              <Pagination
                page={customerPage}
                totalPages={customerMeta.totalPages}
                total={customerMeta.total}
                pageSize={50}
                onPageChange={(p) => { setCustomerPage(p); }}
              />
            </section>
          </div>
          <div className="customer-right">
            <section className="panel admin-panel">
              <div className="panel-title">
                <strong>{selCustomer?.name ?? "Selecciona un cliente"}</strong>
                <span>{isStatementLoading ? "Cargando..." : "Estado de cuenta"}</span>
              </div>
              <div className="statement-kpis">
                <article><span>Limite</span><strong>{money.format(statement?.creditLimit ?? selCustomer?.creditLimit ?? 0)}</strong></article>
                <article><span>Balance</span><strong>{money.format(statement?.creditBalance ?? selCustomer?.creditBalance ?? 0)}</strong></article>
                <article><span>Disponible</span><strong>{money.format(statement?.availableCredit ?? selCustomer?.availableCredit ?? 0)}</strong></article>
              </div>
            </section>
            <AdminTwoColumn>
              <DataTable
                title="Documentos por cobrar"
                columns={["Documento", "Vence", "Estado", "Balance"]}
                rows={(statement?.receivables ?? data.receivables.filter(r => r.customerId === selCustomer?.id)).map(r => [
                  r.documentNumber,
                  new Date(r.dueAt).toLocaleDateString("es-DO"),
                  r.isOverdue ? "Vencido" : statusLabel("receivable", r.status),
                  money.format(r.balance)
                ])}
              />
              <CustomerPaymentForm
                disabled={!selCustomer || (statement?.creditBalance ?? selCustomer?.creditBalance ?? 0) <= 0}
                maxAmount={statement?.creditBalance ?? selCustomer?.creditBalance ?? 0}
                onPayment={recordCustomerPayment}
              />
            </AdminTwoColumn>
          </div>
        </section>
      )}

      {activeView === "customers-accounts" && (
        <AdminTwoColumn>
          <DataTable
            title="Cuentas por cobrar"
            columns={["Cliente", "Documento", "Vence", "Balance"]}
            rows={data.receivables.map(r => [
              r.customerName || "-",
              r.documentNumber,
              new Date(r.dueAt).toLocaleDateString("es-DO"),
              money.format(r.balance)
            ])}
          />
          <DataTable
            title="Antiguedad CxC"
            columns={["Entidad", "Documento", "Vence", "Monto"]}
            rows={(data.receivablesAging?.items ?? []).map(b => [
              b.entityName,
              b.documentNumber,
              new Date(b.dueAt).toLocaleDateString("es-DO"),
              money.format(b.amount)
            ])}
          />
        </AdminTwoColumn>
      )}

      {/* ── Inventario ───────────────────────────────────────────── */}
      {activeView === "inventory-categories" && (
        <section className="inventory-workspace">
          <div className="inventory-left">
            <CategoryQuickForm
              session={session}
              category={data.categories.find((category) => category.id === selectedCategoryId) ?? null}
              onCreate={(action) => handleCreated("Categoria", action)}
              onDelete={(category) => handleSaved("Categoria", () => api.deleteCategory(category.id))}
              onUpdate={(category, payload) => handleSaved("Categoria", () => api.updateCategory(category.id, payload))}
            />
            <CategoryList
              categories={data.categories}
              selectedCategoryId={selectedCategoryId}
              onCreateNew={() => setSelectedCategoryId(null)}
              onSelect={selectCategory}
            />
          </div>
          <div className="inventory-right">
            <DataTable
              title="Productos en categoria"
              columns={["Producto", "Precio", "Stock"]}
              rows={data.products
                .filter((product) => !selectedCategoryId || product.categoryId === selectedCategoryId)
                .map(p => [
                  p.name,
                  money.format(p.price),
                  `${productQuantity(p)}`
                ])}
            />
          </div>
        </section>
      )}

      {activeView === "inventory-products" && (
        <section className="inventory-workspace">
          <div className="inventory-left">
            <ProductQuickForm
              session={session}
              product={selProduct}
              categories={data.categories}
              branches={data.branches}
              onCreate={(action) => handleCreated("Producto", action)}
              onDelete={(product) => handleSaved("Producto", () => api.deleteProduct(product.id))}
              onUpdate={(action) => handleCreated("Producto actualizado", action)}
            />
            <BulkImportPanel
              title="Carga masiva de productos"
              description="Importa productos desde Excel. Crea categorias faltantes y actualiza por codigo de barras o nombre/categoria."
              templateFileName="plantilla-productos-rame-pos.xlsx"
              onDownloadTemplate={() => api.downloadProductImportTemplate()}
              onImport={(file) => api.importProducts(file)}
              onRefresh={async () => { setProductPage(1); await refresh(); }}
            />
          </div>
          <div className="inventory-right">
            <section className="panel admin-panel">
              <div className="panel-title">
                <strong>{selProduct?.name ?? "Producto"}</strong>
                <span>{selProduct?.barcode ?? "Inventario"}</span>
              </div>
              <div className="statement-kpis">
                <article><span>Precio</span><strong>{money.format(selProduct?.price ?? 0)}</strong></article>
                <article><span>Costo</span><strong>{money.format(selProduct?.cost ?? 0)}</strong></article>
                <article><span>Existencia</span><strong>{productQuantity(selProduct ?? undefined)}</strong></article>
              </div>
            </section>
            <section className="panel admin-panel">
              <div className="panel-title">
                <strong>Catalogo</strong>
                <button type="button" onClick={() => setSelectedProductId(null)}>Nuevo</button>
              </div>
              <div className="product-admin-list">
                {data.products.length === 0
                  ? <p className="empty-state">Sin productos registrados.</p>
                  : data.products.map((p) => (
                    <button
                      className={p.id === selProduct?.id ? "product-admin-row product-admin-row-active" : "product-admin-row"}
                      key={p.id} type="button"
                      onClick={() => selectProduct(p.id)}
                    >
                      <span>
                        <strong>{p.name}</strong>
                        <small>{p.categoryName || "Sin categoria"}</small>
                      </span>
                      <span>
                        <strong>{money.format(p.price)}</strong>
                        <small>{productQuantity(p)} unidades</small>
                      </span>
                    </button>
                  ))}
              </div>
              <Pagination
                page={productPage}
                totalPages={productMeta.totalPages}
                total={productMeta.total}
                pageSize={50}
                onPageChange={(p) => { setProductPage(p); }}
              />
            </section>
          </div>
        </section>
      )}

      {activeView === "inventory-stock" && (
        <section className="inventory-workspace">
          <div className="inventory-left">
            <InventoryMovementForm
              branches={data.branches}
              products={data.products}
              selectedProductId={selProduct?.id}
              onMovement={registerInventoryMovement}
            />
          </div>
          <div className="inventory-right">
            <AdminTwoColumn>
              <DataTable
                title="Stock por sucursal"
                columns={["Sucursal", "Disponible", "Minimo", "Estado"]}
                rows={selStock.map(s => [
                  s.branchName, `${s.availableQuantity ?? s.quantityOnHand}`, `${s.minimumStock}`,
                  s.isLowStock ? "Bajo minimo" : "OK"
                ])}
              />
              <DataTable
                title="Alertas de stock"
                columns={["Producto", "Sucursal", "Disponible", "Minimo"]}
                rows={data.inventoryAlerts.map(s => [
                  s.productName, s.branchName, `${s.availableQuantity ?? s.quantityOnHand}`, `${s.minimumStock}`
                ])}
              />
            </AdminTwoColumn>
            <DataTable
              title="Movimientos recientes"
              columns={["Fecha", "Tipo", "Producto", "Cantidad"]}
              rows={data.inventoryMovements.map(m => [
                new Date(m.createdAt).toLocaleDateString("es-DO"),
                inventoryMovementLabel(m.type),
                m.productName || "-",
                `${m.quantity}`
              ])}
            />
          </div>
        </section>
      )}

      {/* ── Compras ──────────────────────────────────────────────── */}
      {activeView === "purchases-suppliers" && (
        <section className="purchases-workspace">
          <div className="purchases-left">
            <SupplierQuickForm
              session={session}
              supplier={selSupplier}
              onCreate={(action) => handleCreated("Suplidor", action)}
              onDelete={(supplier) => handleSaved("Suplidor", () => api.deleteSupplier(supplier.id))}
              onUpdate={(supplier, payload) => handleSaved("Suplidor", () => api.updateSupplier(supplier.id, payload))}
            />
            <section className="panel admin-panel">
              <div className="panel-title">
                <strong>Suplidores</strong>
                <button type="button" onClick={() => { setSelectedSupplierId(null); setData((current) => ({ ...current, supplierStatement: null })); }}>Nuevo</button>
              </div>
              <div className="supplier-list">
                {data.suppliers.length === 0
                  ? <p className="empty-state">Sin suplidores registrados.</p>
                  : data.suppliers.map((s) => (
                    <button
                      className={s.id === selSupplier?.id ? "supplier-row supplier-row-active" : "supplier-row"}
                      key={s.id} type="button"
                      onClick={() => selectSupplier(s.id)}
                    >
                      <span>
                        <strong>{s.name}</strong>
                        <small>{s.contactName || s.phone || "Sin contacto"}</small>
                      </span>
                      <span>
                        <strong>{money.format(s.balance ?? 0)}</strong>
                        <small>{s.paymentTermsDays}d plazo</small>
                      </span>
                    </button>
                  ))}
              </div>
            </section>
          </div>
          <div className="purchases-right">
            <section className="panel admin-panel">
              <div className="panel-title">
                <strong>{selSupplier?.name ?? "Selecciona un suplidor"}</strong>
                <span>CxP</span>
              </div>
              <div className="statement-kpis">
                <article><span>Limite</span><strong>{money.format(supStatement?.creditLimit ?? selSupplier?.creditLimit ?? 0)}</strong></article>
                <article><span>Balance</span><strong>{money.format(supStatement?.balance ?? selSupplier?.balance ?? 0)}</strong></article>
                <article><span>Disponible</span><strong>{money.format(supStatement?.availableCredit ?? 0)}</strong></article>
              </div>
            </section>
            <AdminTwoColumn>
              <DataTable
                title="Cuentas por pagar"
                columns={["Documento", "Vence", "Estado", "Balance"]}
                rows={supPayables.map(p => [
                  p.documentNumber,
                  new Date(p.dueAt).toLocaleDateString("es-DO"),
                  p.isOverdue ? "Vencido" : statusLabel("payable", p.status),
                  money.format(p.balance)
                ])}
              />
              <SupplierPaymentForm
                disabled={!selSupplier || (supStatement?.balance ?? selSupplier?.balance ?? 0) <= 0}
                maxAmount={supStatement?.balance ?? selSupplier?.balance ?? 0}
                onPayment={recordSupplierPayment}
              />
            </AdminTwoColumn>
          </div>
        </section>
      )}

      {activeView === "purchases-orders" && (
        <section className="purchases-workspace">
          <div className="purchases-left">
            <PurchaseQuickForm
              session={session}
              purchaseDetail={data.purchaseDetail}
              branches={data.branches}
              suppliers={data.suppliers}
              products={data.products}
              selectedSupplierId={selSupplier?.id}
              onCreate={(action) => handleCreated("Compra", action)}
              onUpdate={(purchase, payload) => handleSaved("Compra", () => api.updatePurchase(purchase.id, payload))}
            />
          </div>
          <div className="purchases-right">
            <PurchaseActionTable
              purchases={data.purchases}
              selectedPurchaseId={selectedPurchaseId}
              onCancel={cancelPurchase}
              onCreateNew={() => { setSelectedPurchaseId(null); setData((current) => ({ ...current, purchaseDetail: null })); }}
              onIssue={issuePurchase}
              onPrint={printPurchaseOrder}
              onReceive={receivePurchase}
              onSelect={selectPurchase}
            />
            <PurchaseDetailPanel detail={data.purchaseDetail} onPrint={printPurchaseOrder} />
          </div>
        </section>
      )}

      {activeView === "purchases-returns" && (
        <section className="purchases-workspace">
          <div className="purchases-left">
            <PurchaseReturnQuickForm
              session={session}
              purchases={data.purchases}
              returnDetail={data.purchaseReturnDetail}
              onCreate={(action) => handleCreated("Devolucion", action)}
              onUpdate={(purchaseReturn, payload) => handleSaved("Devolucion", () => api.updatePurchaseReturn(purchaseReturn.id, payload))}
            />
          </div>
          <div className="purchases-right">
            <PurchaseReturnWorkspace
              detail={data.purchaseReturnDetail}
              purchaseReturns={data.purchaseReturns}
              selectedReturnId={selectedPurchaseReturnId}
              onCancel={cancelPurchaseReturn}
              onConfirm={confirmPurchaseReturn}
              onCreateNew={() => { setSelectedPurchaseReturnId(null); setData((current) => ({ ...current, purchaseReturnDetail: null })); }}
              onSelect={selectPurchaseReturn}
            />
          </div>
        </section>
      )}

      {activeView === "purchases-expenses" && (
        <section className="purchases-workspace">
          <div className="purchases-left">
            <div className="stacked-forms">
              <ExpenseCategoryQuickForm
                session={session}
                category={selExpenseCategory}
                onCreate={(action) => handleCreated("Categoria de gasto", action)}
                onDelete={(category) => handleSaved("Categoria de gasto", () => api.deleteExpenseCategory(category.id))}
                onUpdate={(category, payload) => handleSaved("Categoria de gasto", () => api.updateExpenseCategory(category.id, payload))}
              />
              <ExpenseQuickForm
                session={session}
                expense={selExpense}
                branches={data.branches}
                categories={data.expenseCategories}
                onCancel={(expense) => handleSaved("Gasto", () => api.cancelExpense(expense.id))}
                onCreate={(action) => handleCreated("Gasto", action)}
                onUpdate={(expense, payload) => handleSaved("Gasto", () => api.updateExpense(expense.id, payload))}
              />
            </div>
          </div>
          <div className="purchases-right">
            <AdminTwoColumn>
              <ExpenseCategoryList
                categories={data.expenseCategories}
                selectedCategoryId={selectedExpenseCategoryId}
                onCreateNew={() => setSelectedExpenseCategoryId(null)}
                onSelect={setSelectedExpenseCategoryId}
              />
              <ExpenseActionTable
                expenses={data.expenses}
                selectedExpenseId={selectedExpenseId}
                onApprove={approveExpense}
                onCancel={cancelExpense}
                onCreateNew={() => setSelectedExpenseId(null)}
                onPay={payExpense}
                onSelect={selectExpense}
              />
            </AdminTwoColumn>
            <ExpenseDetailPanel expense={selExpense} />
          </div>
        </section>
      )}

      {/* ── Finanzas ──────────────────────────────────────────────── */}
      {activeView === "finance-accounts" && (
        <section className="finance-workspace">
          <div className="finance-left">
            <AccountQuickForm
              session={session}
              account={selAccount}
              accounts={data.accounts}
              onCreate={(action) => handleCreated("Cuenta", action)}
              onDelete={(account) => handleSaved("Cuenta", () => api.deleteAccount(account.id))}
              onUpdate={(account, payload) => handleSaved("Cuenta", () => api.updateAccount(account.id, payload))}
            />
          </div>
          <div className="finance-right">
            <section className="panel admin-panel">
              <div className="panel-title">
                <strong>Plan de cuentas</strong>
                <button type="button" onClick={() => { setSelectedAccountId(null); setData((current) => ({ ...current, generalLedger: null })); }}>Nueva</button>
              </div>
              <div className="account-list">
                {data.accounts.length === 0
                  ? <p className="empty-state">Sin cuentas registradas.</p>
                  : data.accounts.map((a) => (
                    <button
                      className={a.id === selAccount?.id ? "account-row account-row-active" : "account-row"}
                      key={a.id} type="button"
                      onClick={() => selectAccount(a.id)}
                    >
                      <span>
                        <strong>{a.code} - {a.name}</strong>
                        <small>{accountTypeLabel(a.type)}</small>
                      </span>
                      <span>
                        <strong>{a.isActive ? "Activa" : "Inactiva"}</strong>
                        <small>{a.isCashAccount ? "Caja/Banco" : "General"}</small>
                      </span>
                    </button>
                  ))}
              </div>
            </section>
          </div>
        </section>
      )}

      {activeView === "finance-journal" && (
        <section className="finance-workspace">
          <div className="finance-left">
            <JournalQuickForm
              session={session}
              accounts={data.accounts}
              detail={data.journalEntryDetail}
              onCreate={(action) => handleCreated("Asiento", action)}
              onUpdate={(entry, payload) => handleSaved("Asiento", () => api.updateJournalEntry(entry.id, payload))}
            />
          </div>
          <div className="finance-right">
            <section className="panel admin-panel">
              <div className="panel-title"><strong>Balance de comprobacion</strong></div>
              <div className="statement-kpis">
                <article><span>Debito</span><strong>{money.format(data.trialBalance?.totalDebit ?? 0)}</strong></article>
                <article><span>Credito</span><strong>{money.format(data.trialBalance?.totalCredit ?? 0)}</strong></article>
                <article><span>Diferencia</span><strong>{money.format(data.trialBalance?.difference ?? 0)}</strong></article>
              </div>
            </section>
            <JournalActionTable
              entries={data.journalEntries}
              selectedEntryId={selectedJournalEntryId}
              onCreateNew={() => { setSelectedJournalEntryId(null); setData((current) => ({ ...current, journalEntryDetail: null })); }}
              onPost={postJournalEntry}
              onSelect={selectJournalEntry}
              onVoid={voidJournalEntry}
            />
            <AdminTwoColumn>
              <TrialBalanceAccountTable
                lines={data.trialBalance?.lines ?? []}
                selectedAccountId={selectedAccountId}
                onSelect={selectAccount}
              />
              <DataTable
                title={data.generalLedger ? `Mayor ${data.generalLedger.accountCode}` : "Mayor general"}
                columns={["Fecha", "Asiento", "Debito", "Balance"]}
                rows={(data.generalLedger?.lines ?? []).map(l => [
                  new Date(l.entryDate).toLocaleDateString("es-DO"),
                  l.number, money.format(l.debit - l.credit), money.format(l.runningBalance)
                ])}
              />
            </AdminTwoColumn>
          </div>
        </section>
      )}

      {/* ── RRHH ─────────────────────────────────────────────────── */}
      {activeView === "finance-banking" && (
        <section className="finance-workspace">
          <div className="finance-left">
            <BankAccountForm
              session={session}
              account={selBankAccount}
              accounts={data.accounts}
              onCreate={(action) => handleCreated("Cuenta bancaria", action)}
              onUpdate={(account, payload) => handleSaved("Cuenta bancaria", () => api.updateBankAccount(account.id, payload))}
            />
            <BankTransactionForm
              session={session}
              bankAccount={selBankAccount}
              onCreate={(action) => handleCreated("Movimiento bancario", action)}
            />
          </div>
          <div className="finance-right">
            <BankAccountList
              accounts={data.bankAccounts}
              selectedAccountId={selectedBankAccountId}
              onCreateNew={() => setSelectedBankAccountId(null)}
              onSelect={setSelectedBankAccountId}
            />
            <BankTransactionTable
              transactions={data.bankTransactions}
              journalEntries={data.journalEntries}
              onIgnore={(transaction) => handleSaved("Movimiento bancario", () => api.reconcileBankTransaction(transaction.id, {
                tenantId: transaction.tenantId,
                companyId: transaction.companyId,
                matchedJournalEntryId: null,
                notes: "Ignorado desde conciliacion bancaria"
              }))}
              onReconcile={(transaction, journalEntryId) => handleSaved("Movimiento bancario", () => api.reconcileBankTransaction(transaction.id, {
                tenantId: transaction.tenantId,
                companyId: transaction.companyId,
                matchedJournalEntryId: journalEntryId,
                notes: "Conciliado desde integracion bancaria"
              }))}
            />
          </div>
        </section>
      )}

      {activeView === "hr-employees" && (
        <section className="hr-workspace">
          <div className="hr-left">
            <EmployeeQuickForm
              session={session}
              employee={selEmployee}
              branches={data.branches}
              onCreate={(action) => handleCreated("Empleado", action)}
              onDelete={(employee) => handleSaved("Empleado", () => api.terminateEmployee(employee.id))}
              onUpdate={(employee, payload) => handleSaved("Empleado", () => api.updateEmployee(employee.id, payload))}
            />
          </div>
          <div className="hr-right">
            <EmployeeActionList
              employees={data.employees}
              selectedEmployeeId={selectedEmployeeId}
              onCreateNew={() => setSelectedEmployeeId(null)}
              onSelect={setSelectedEmployeeId}
              onTerminate={terminateEmployee}
            />
            <DataTable
              title="Resumen por area"
              columns={["Area", "Activos", "Suspendidos", "Nomina"]}
              rows={employeeDepartmentRows(data.employees)}
            />
          </div>
        </section>
      )}

      {activeView === "hr-payroll" && (
        <section className="hr-workspace">
          <div className="hr-left">
            <PayrollPeriodQuickForm
              session={session}
              period={selPeriod}
              onCancel={(period) => handleSaved("Periodo de nomina", () => api.cancelPayrollPeriod(period.id))}
              onCreate={(action) => handleCreated("Periodo de nomina", action)}
              onUpdate={(period, payload) => handleSaved("Periodo de nomina", () => api.updatePayrollPeriod(period.id, payload))}
            />
          </div>
          <div className="hr-right">
            <section className="panel admin-panel">
              <div className="panel-title">
                <strong>{selPeriod?.name ?? "Nomina"}</strong>
                <span>{selPeriod ? statusLabel("payroll", selPeriod.status) : "RRHH"}</span>
              </div>
              <div className="statement-kpis">
                <article><span>Bruto</span><strong>{money.format(data.payrollDetail?.period.grossPay ?? selPeriod?.grossPay ?? 0)}</strong></article>
                <article><span>Deducciones</span><strong>{money.format(data.payrollDetail?.period.totalDeductions ?? selPeriod?.totalDeductions ?? 0)}</strong></article>
                <article><span>Neto</span><strong>{money.format(data.payrollDetail?.period.netPay ?? selPeriod?.netPay ?? 0)}</strong></article>
              </div>
            </section>
            <PayrollPeriodList
              periods={data.payrollPeriods}
              selectedPayrollPeriodId={selPeriod?.id}
              onCreateNew={() => setSelectedPayrollPeriodId(null)}
              onSelect={selectPayrollPeriod}
              onCancel={cancelPayroll}
              onCalculate={calculatePayroll}
              onPost={postPayroll}
              onPay={payPayroll}
            />
            <DataTable
              title="Lineas de nomina"
              columns={["Empleado", "Dias", "Bruto", "Deducciones", "Neto"]}
              rows={(data.payrollDetail?.lines ?? []).map(l => [
                `${l.employeeCode} - ${l.employeeName}`,
                `${l.daysWorked}`,
                money.format(l.regularPay + l.overtimePay + l.bonus),
                money.format(l.deductions),
                money.format(l.netPay)
              ])}
            />
          </div>
        </section>
      )}

      {/* ── CRM ──────────────────────────────────────────────────── */}
      {activeView === "crm-leads" && (
        <section className="crm-workspace">
          <div className="crm-left">
            <CrmLeadQuickForm
              session={session}
              lead={selLead}
              onCreate={(action) => handleCreated("Lead", action)}
              onUpdate={(lead, payload) => handleSaved("Lead", () => api.updateCrmLead(lead.id, payload))}
            />
          </div>
          <div className="crm-right">
            <section className="panel admin-panel">
              <div className="panel-title"><strong>Pipeline CRM</strong></div>
              <div className="statement-kpis">
                <article><span>Leads</span><strong>{data.leads.length}</strong></article>
                <article><span>Pipeline</span><strong>{money.format(data.opportunities.reduce((s, o) => s + o.estimatedValue, 0))}</strong></article>
                <article><span>Pendientes</span><strong>{data.activities.filter(a => a.status === 1).length}</strong></article>
              </div>
            </section>
            <CrmLeadList
              leads={data.leads}
              selectedLeadId={selLead?.id}
              onCreateNew={() => setSelectedLeadId(null)}
              onSelectLead={setSelectedLeadId}
              onAdvanceLead={advanceLead}
              onConvertLead={convertLead}
            />
          </div>
        </section>
      )}

      {activeView === "crm-pipeline" && (
        <section className="crm-workspace">
          <div className="crm-left">
            <div className="stacked-forms">
              <CrmOpportunityQuickForm
                session={session}
                opportunity={selOpportunity}
                leads={data.leads}
                selectedLeadId={selLead?.id}
                onCreate={(action) => handleCreated("Oportunidad", action)}
                onUpdate={(opportunity, payload) => handleSaved("Oportunidad", () => api.updateCrmOpportunity(opportunity.id, payload))}
              />
              <CrmActivityQuickForm
                session={session}
                activity={selActivity}
                leads={data.leads}
                opportunities={data.opportunities}
                selectedLeadId={selLead?.id}
                onCancel={(activity) => handleSaved("Actividad", () => api.cancelCrmActivity(activity.id))}
                onCreate={(action) => handleCreated("Actividad", action)}
                onUpdate={(activity, payload) => handleSaved("Actividad", () => api.updateCrmActivity(activity.id, payload))}
              />
            </div>
          </div>
          <div className="crm-right">
            <AdminTwoColumn>
              <CrmOpportunityList
                opportunities={data.opportunities}
                selectedOpportunityId={selOpportunity?.id}
                onCreateNew={() => setSelectedOpportunityId(null)}
                onSelectOpportunity={setSelectedOpportunityId}
              />
              <DataTable
                title="Forecast por etapa"
                columns={["Etapa", "Cantidad", "Valor"]}
                rows={opportunityStageRows(data.opportunities)}
              />
            </AdminTwoColumn>
            <CrmActivityList
              activities={data.activities}
              selectedActivityId={selActivity?.id}
              onCancelActivity={cancelActivity}
              onCompleteActivity={completeActivity}
              onCreateNew={() => setSelectedActivityId(null)}
              onSelectActivity={setSelectedActivityId}
            />
          </div>
        </section>
      )}

      {activeView === "security-companies" && (
        <AdminTwoColumn>
          <CompanyQuickForm
            company={selCompanyForEdit}
            onCreate={(action) => handleCreated("Compania", action)}
            onDelete={(company) => handleSaved("Compania", () => api.deleteCompany(company.id))}
            onUpdate={(company, payload) => handleSaved("Compania", () => api.updateCompany(company.id, payload))}
          />
          <CompanyList
            companies={data.companies}
            selectedCompanyId={selCompanyForEdit?.id}
            onCreateNew={() => setSelectedSecurityCompanyId(null)}
            onSelectCompany={setSelectedSecurityCompanyId}
          />
        </AdminTwoColumn>
      )}

      {activeView === "security-subscriptions" && (
        <AdminTwoColumn>
          <div className="stacked-forms">
            <CompanyScopeSelector
              companies={data.companies}
              selectedCompany={selectedSecurityCompany}
              onSelectCompany={setSelectedSecurityCompanyId}
              disabled={!canManagePlatform}
            />
            <SubscriptionQuickForm
              company={selectedSecurityCompany}
              onUpdate={(company, payload) => handleSaved("Licencia", () => api.updateCompanySubscription(company.id, payload))}
            />
          </div>
          <section className="panel admin-panel">
            <div className="panel-title">
              <strong>Resumen de licencia</strong>
              <span>{selectedSecurityCompany.tradeName || selectedSecurityCompany.name}</span>
            </div>
            <div className="statement-kpis">
              <article><span>Estado</span><strong>{subscriptionStatusLabel(selectedSecurityCompany.subscriptionStatus)}</strong></article>
              <article><span>Modalidad</span><strong>{subscriptionBillingLabel(selectedSecurityCompany.subscriptionBillingMode)}</strong></article>
              <article><span>Vence</span><strong>{selectedSecurityCompany.subscriptionExpiresAt ? new Date(selectedSecurityCompany.subscriptionExpiresAt).toLocaleDateString("es-DO") : "Sin vencimiento"}</strong></article>
            </div>
            <DataTable
              title="Modulos contratados"
              columns={["Modulo", "Estado"]}
              rows={subscriptionModuleOptions.map((module) => [
                module.label,
                (selectedSecurityCompany.enabledModules ?? []).includes(module.id) ? "Activo" : "No contratado"
              ])}
            />
          </section>
        </AdminTwoColumn>
      )}

      {activeView === "security-branches" && (
        <BranchSecurityWorkspace
          branches={data.adminBranches}
          companies={data.companies}
          selectedCompany={selectedSecurityCompany}
          canSelectCompany={canManagePlatform}
          selectedBranch={selAdminBranch}
          onCreateNew={() => setSelectedBranchId(null)}
          onSelectBranch={setSelectedBranchId}
          onSelectCompany={(companyId) => {
            setSelectedBranchId(null);
            setSelectedSecurityCompanyId(companyId);
          }}
          onCreate={(action) => handleCreated("Sucursal", action)}
          onUpdate={(action) => handleSaved("Sucursal", action)}
        />
      )}

      {activeView === "security-users" && (
        <UserSecurityWorkspace
          session={session}
          users={data.users}
          roles={data.roles}
          permissions={data.permissions}
          companies={data.companies}
          selectedCompany={selectedSecurityCompany}
          canSelectCompany={canManagePlatform}
          selectedUser={selUser}
          onCreateNew={() => setSelectedUserId(null)}
          onSelectUser={setSelectedUserId}
          onSelectCompany={(companyId) => {
            setSelectedUserId(null);
            setSelectedSecurityCompanyId(companyId);
          }}
          onCreate={(action) => handleCreated("Usuario", action)}
          onUpdate={(action) => handleSaved("Usuario", action)}
        />
      )}

      {activeView === "security-roles" && (
        <AdminTwoColumn>
          <div className="stacked-forms">
            {data.companies.length > 0 && (
              <CompanyScopeSelector
                companies={data.companies}
                selectedCompany={selectedSecurityCompany}
                onSelectCompany={setSelectedSecurityCompanyId}
                disabled={!canManagePlatform}
              />
            )}
            <RoleQuickForm
              session={session}
              targetCompany={selectedSecurityCompany}
              role={selRole}
              permissions={data.permissions}
              onCreate={(action) => handleCreated("Rol", action)}
              onDelete={(role) => handleSaved("Rol", () => api.deleteRole(role.id))}
              onUpdate={(role, payload) => handleSaved("Rol", () => api.updateRole(role.id, payload))}
            />
          </div>
          <RoleList
            roles={data.roles}
            selectedRoleId={selRole?.id}
            onCreateNew={() => setSelectedRoleId(null)}
            onSelectRole={setSelectedRoleId}
          />
        </AdminTwoColumn>
      )}

      {activeView === "security-settings" && (
        <AdminTwoColumn>
          <CompanyQuickForm
            company={selectedSecurityCompany}
            settingsOnly
            onCreate={(action) => handleCreated("Configuracion", action)}
            onUpdate={(company, payload) => handleSaved("Configuracion", () => api.updateCompanySettings(company.id, payload))}
          />
          <section className="panel admin-panel">
            <div className="panel-title">
              <strong>Resumen fiscal</strong>
              <span>{selectedSecurityCompany.tradeName || selectedSecurityCompany.name}</span>
            </div>
            <div className="statement-kpis">
              <article><span>RNC</span><strong>{selectedSecurityCompany.taxId || "N/D"}</strong></article>
              <article><span>ITBIS</span><strong>{Math.round((selectedSecurityCompany.defaultTaxRate ?? 0.18) * 100)}%</strong></article>
              <article><span>Ticket</span><strong>{selectedSecurityCompany.receiptPaperWidthMm ?? 80}mm</strong></article>
            </div>
            <DataTable
              title="Secuencias NCF"
              columns={["Tipo", "Prefijo", "Siguiente"]}
              rows={[
                ["Consumidor final", selectedSecurityCompany.consumerFinalNcfPrefix ?? "B02", `${selectedSecurityCompany.nextConsumerFinalNcf ?? 1}`],
                ["Credito fiscal", selectedSecurityCompany.taxCreditNcfPrefix ?? "B01", `${selectedSecurityCompany.nextTaxCreditNcf ?? 1}`]
              ]}
            />
          </section>
        </AdminTwoColumn>
      )}

      {activeView === "security-email" && (
        <EmailStatusWorkspace
          status={data.emailStatus}
          defaultEmail=""
          onSendTest={(to) => api.sendTestEmail(to)}
          onRefresh={refresh}
        />
      )}

      {activeView === "security-audit" && (
        <section className="stacked-forms">
          <section className="panel admin-panel">
            <div className="panel-title">
              <strong>Filtros de auditoria</strong>
              <span>{selectedSecurityCompany.tradeName || selectedSecurityCompany.name}</span>
            </div>
            <div className="form-grid">
              {data.companies.length > 0 && (
                <label>
                  Empresa
                  <select
                    value={selectedSecurityCompany.id}
                    onChange={(event) => {
                      setAuditPage(1);
                      setSelectedSecurityCompanyId(event.target.value);
                    }}
                    disabled={!canManagePlatform}
                  >
                    {data.companies.map((company) => (
                      <option key={company.id} value={company.id}>{company.tradeName || company.name}</option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                Buscar
                <input
                  value={auditSearch}
                  onChange={(event) => {
                    setAuditPage(1);
                    setAuditSearch(event.target.value);
                  }}
                  placeholder="Email, ruta, accion o IP"
                />
              </label>
              <label>
                Resultado
                <select
                  value={auditSucceededFilter}
                  onChange={(event) => {
                    setAuditPage(1);
                    setAuditSucceededFilter(event.target.value as "all" | "success" | "failed");
                  }}
                >
                  <option value="all">Todos</option>
                  <option value="success">Exitosos</option>
                  <option value="failed">Fallidos</option>
                </select>
              </label>
            </div>
          </section>
          <DataTable
            title="Eventos recientes"
            columns={["Fecha", "Usuario", "Metodo", "Ruta", "Estado", "IP"]}
            rows={data.auditLogs.map((log) => [
              new Date(log.createdAt).toLocaleString("es-DO"),
              log.email || "N/D",
              log.method,
              log.path,
              `${log.statusCode} ${log.succeeded ? "OK" : "Error"}`,
              log.ipAddress || "N/D"
            ])}
          />
          <Pagination
            page={auditPage}
            totalPages={auditMeta.totalPages}
            total={auditMeta.total}
            pageSize={50}
            onPageChange={setAuditPage}
          />
        </section>
      )}

      {activeView === "reports" && (
        <ReportsWorkspace
          data={data}
          branches={data.branches}
          selectedBranchId={selectedReportBranchId ?? ""}
          fromDate={reportFromDate}
          toDate={reportToDate}
          onBranchChange={setSelectedReportBranchId}
          onDateRangeChange={(from, to) => {
            setReportFromDate(from);
            setReportToDate(to);
          }}
          onExport={exportReport}
          session={session}
          onCreateSuggestedPurchase={(action) => handleCreated("Orden de compra sugerida", action)}
        />
      )}
    </AdminPageFrame>
  );
}

function AdminPageFrame({
  meta,
  isLoading,
  onRefresh,
  notifications,
  unreadNotifications,
  showNotifications,
  browserNotificationPermission,
  onToggleNotifications,
  onEnableBrowserNotifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  children
}: {
  meta: { title: string; eyebrow: string; icon: typeof Users };
  isLoading: boolean;
  onRefresh: () => void;
  notifications: AppNotification[];
  unreadNotifications: number;
  showNotifications: boolean;
  browserNotificationPermission: NotificationPermission;
  onToggleNotifications: () => void;
  onEnableBrowserNotifications: () => Promise<void>;
  onMarkNotificationRead: (notification: AppNotification) => Promise<void>;
  onMarkAllNotificationsRead: () => Promise<void>;
  children: ReactNode;
}) {
  const Icon = meta.icon;
  return (
    <div className="admin-page">
      <header className="topbar">
        <div>
          <span>{meta.eyebrow}</span>
          <h1>{meta.title}</h1>
        </div>
        <div className="topbar-actions">
          <div className="notification-center">
            <button className="icon-button notification-button" onClick={onToggleNotifications} title="Notificaciones" aria-label="Notificaciones">
              <Bell size={18} />
              {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}
            </button>
            {showNotifications && (
              <div className="notification-popover">
                <div className="notification-popover-header">
                  <strong>Notificaciones</strong>
                  <button type="button" onClick={onMarkAllNotificationsRead} disabled={unreadNotifications === 0}>
                    <CheckCheck size={14} />
                    Marcar leidas
                  </button>
                </div>
                {supportsBrowserNotifications() && browserNotificationPermission !== "granted" && (
                  <button type="button" className="notification-enable" onClick={onEnableBrowserNotifications}>
                    <Bell size={14} />
                    Activar alertas de escritorio
                  </button>
                )}
                {notifications.length === 0 ? (
                  <p className="empty-state">Sin notificaciones.</p>
                ) : (
                  <div className="notification-list">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        className={notification.isRead ? `notification-item notification-${notification.kind}` : `notification-item notification-${notification.kind} notification-unread`}
                        onClick={() => onMarkNotificationRead(notification)}
                      >
                        <strong>{notification.title}</strong>
                        <span>{notification.message}</span>
                        <small>{new Date(notification.createdAt).toLocaleString("es-DO")}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="icon-button" onClick={onRefresh} title="Refrescar">
            {isLoading ? <Loader2 size={18} className="spin" /> : <RefreshCw size={18} />}
            <span>Refrescar</span>
          </button>
        </div>
      </header>
      <div className="admin-heading">
        <Icon size={20} />
        <span>Panel operativo conectado al API de RAME POS</span>
      </div>
      {children}
    </div>
  );
}

function AdminTwoColumn({ children }: { children: ReactNode }) {
  return <section className="admin-grid">{children}</section>;
}

function DataTable({ title, columns, rows }: { title: string; columns: string[]; rows: Array<Array<string | number>> }) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>{title}</strong>
        <span>{rows.length} registros</span>
      </div>
      {rows.length === 0 ? (
        <p className="empty-state">Sin registros para mostrar.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((column) => <th key={column}>{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${title}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => <td key={`${title}-${rowIndex}-${cellIndex}`}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function CashWorkspace({
  session,
  branches,
  selectedBranchId,
  current,
  sessions,
  onSelectBranch,
  onCreate,
  onUpdate
}: {
  session: AuthSession;
  branches: Branch[];
  selectedBranchId: string | null;
  current: CashSummary | null;
  sessions: CashSession[];
  onSelectBranch: (branchId: string) => void;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate: (action: () => Promise<unknown>) => void;
}) {
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) ?? branches[0] ?? null;

  if (!selectedBranch) {
    return (
      <section className="panel admin-panel">
        <div className="panel-title"><strong>Caja</strong><span>Sin sucursales</span></div>
        <p className="empty-state">Primero registra una sucursal para poder abrir caja.</p>
      </section>
    );
  }

  return (
    <section className="customer-workspace">
      <div className="customer-left">
        <section className="panel admin-panel quick-form">
          <div className="panel-title">
            <strong>Sucursal de caja</strong>
            <span>{selectedBranch.name}</span>
          </div>
          <FG label="Sucursal">
            <select value={selectedBranch.id} onChange={(event) => onSelectBranch(event.target.value)}>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </FG>
        </section>

        {current ? (
          <CashMovementForm current={current} onCreate={onCreate} />
        ) : (
          <OpenCashForm session={session} branch={selectedBranch} onCreate={onCreate} />
        )}

        {current && <CloseCashForm current={current} onUpdate={onUpdate} />}
      </div>

      <div className="customer-right">
        {current ? (
          <>
            <section className="admin-stats-grid">
              <article className="admin-stat"><span>Inicial</span><strong>{money.format(current.session.openingAmount)}</strong></article>
              <article className="admin-stat"><span>Ventas efectivo</span><strong>{money.format(current.cashSales)}</strong></article>
              <article className="admin-stat"><span>Entradas manuales</span><strong>{money.format(current.manualIncome)}</strong></article>
              <article className="admin-stat"><span>Salidas</span><strong>{money.format(current.expenses)}</strong></article>
              <article className="admin-stat"><span>Efectivo esperado</span><strong>{money.format(current.expectedCash)}</strong></article>
              <article className="admin-stat"><span>Diferencia</span><strong>{money.format(current.session.difference)}</strong></article>
            </section>

            <DataTable
              title="Movimientos de la caja abierta"
              columns={["Tipo", "Monto", "Descripcion", "Fecha"]}
              rows={current.movements.map((movement) => [
                cashMovementTypeLabel(movement.type),
                money.format(movement.amount),
                movement.description,
                new Date(movement.createdAt).toLocaleString("es-DO")
              ])}
            />
          </>
        ) : (
          <section className="panel admin-panel">
            <div className="panel-title"><strong>Estado de caja</strong><span>Cerrada</span></div>
            <p className="empty-state">No hay una caja abierta para tu usuario en esta sucursal.</p>
          </section>
        )}

        <DataTable
          title="Ultimas sesiones"
          columns={["Apertura", "Cierre", "Inicial", "Cierre contado", "Diferencia", "Estado"]}
          rows={sessions.map((cashSession) => [
            new Date(cashSession.openedAt).toLocaleString("es-DO"),
            cashSession.closedAt ? new Date(cashSession.closedAt).toLocaleString("es-DO") : "-",
            money.format(cashSession.openingAmount),
            cashSession.closingAmount == null ? "-" : money.format(cashSession.closingAmount),
            money.format(cashSession.difference),
            cashSession.isOpen ? "Abierta" : "Cerrada"
          ])}
        />
      </div>
    </section>
  );
}

function OpenCashForm({
  session,
  branch,
  onCreate
}: {
  session: AuthSession;
  branch: Branch;
  onCreate: (action: () => Promise<unknown>) => void;
}) {
  const [openingAmount, setOpeningAmount] = useState(0);

  function submit(event: FormEvent) {
    event.preventDefault();
    onCreate(() => api.openCashSession({
      tenantId: session.tenantId,
      companyId: session.companyId,
      branchId: branch.id,
      userId: session.userId,
      openingAmount
    }));
  }

  return (
    <form className="panel admin-panel quick-form" onSubmit={submit}>
      <div className="panel-title"><strong>Abrir caja</strong><span>{branch.name}</span></div>
      <FG label="Monto inicial">
        <input type="number" min="0" step="0.01" value={openingAmount} onChange={(event) => setOpeningAmount(Number(event.target.value))} />
      </FG>
      <button className="primary-button" type="submit">Abrir caja</button>
    </form>
  );
}

function CashMovementForm({
  current,
  onCreate
}: {
  current: CashSummary;
  onCreate: (action: () => Promise<unknown>) => void;
}) {
  const [type, setType] = useState("Income");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    onCreate(() => api.addCashMovement({
      cashRegisterSessionId: current.session.id,
      type,
      amount,
      description
    }));
    setAmount(0);
    setDescription("");
  }

  return (
    <form className="panel admin-panel quick-form" onSubmit={submit}>
      <div className="panel-title"><strong>Movimiento de caja</strong><span>Entrada / salida</span></div>
      <FG label="Tipo">
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="Income">Ingreso</option>
          <option value="Expense">Gasto</option>
          <option value="PettyCash">Caja chica</option>
          <option value="Withdrawal">Retiro</option>
        </select>
      </FG>
      <FG label="Monto">
        <input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(Number(event.target.value))} required />
      </FG>
      <FG label="Descripcion">
        <input value={description} onChange={(event) => setDescription(event.target.value)} required />
      </FG>
      <button className="primary-button" type="submit">Registrar movimiento</button>
    </form>
  );
}

function CloseCashForm({
  current,
  onUpdate
}: {
  current: CashSummary;
  onUpdate: (action: () => Promise<unknown>) => void;
}) {
  const [closingAmount, setClosingAmount] = useState(current.expectedCash);

  useEffect(() => {
    setClosingAmount(current.expectedCash);
  }, [current.session.id, current.expectedCash]);

  function submit(event: FormEvent) {
    event.preventDefault();
    onUpdate(() => api.closeCashSession(current.session.id, { closingAmount }));
  }

  return (
    <form className="panel admin-panel quick-form" onSubmit={submit}>
      <div className="panel-title"><strong>Cerrar caja</strong><span>Conteo final</span></div>
      <FG label="Efectivo contado" hint={`Esperado: ${money.format(current.expectedCash)}`}>
        <input type="number" min="0" step="0.01" value={closingAmount} onChange={(event) => setClosingAmount(Number(event.target.value))} />
      </FG>
      <button className="primary-button" type="submit">Cerrar caja</button>
    </form>
  );
}

function cashMovementTypeLabel(type: string) {
  return {
    Income: "Ingreso",
    Expense: "Gasto",
    PettyCash: "Caja chica",
    Withdrawal: "Retiro"
  }[type] ?? type;
}

function FiscalWorkspace({
  invoices,
  detail,
  pending,
  creditNotes,
  selectedInvoiceId,
  statusFilter,
  onStatusFilterChange,
  onSelectInvoice,
  onSubmitInvoice,
  onMarkLocalOnly
}: {
  invoices: InvoiceSummary[];
  detail: InvoiceDetail | null;
  pending: FiscalPendingDocument[];
  creditNotes: CreditNote[];
  selectedInvoiceId: string | null;
  statusFilter: number | "";
  onStatusFilterChange: (status: number | "") => void;
  onSelectInvoice: (invoiceId: string) => void;
  onSubmitInvoice: (invoiceId: string) => void;
  onMarkLocalOnly: (invoiceId: string) => void;
}) {
  const ticketDetail = detail ? invoiceToSaleHistoryDetail(detail) : null;
  const companyName = detail?.company.tradeName || detail?.company.name || "RAME POS";
  const fiscalTotals = useMemo(() => ({
    local: invoices.filter((invoice) => invoice.fiscalStatus === 1).length,
    pending: invoices.filter((invoice) => invoice.fiscalStatus === 2).length,
    accepted: invoices.filter((invoice) => invoice.fiscalStatus === 3).length,
    rejected: invoices.filter((invoice) => invoice.fiscalStatus === 4).length,
    amount: invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0)
  }), [invoices]);

  function printInvoice() {
    if (!ticketDetail) return;
    printReceiptDocument(ticketDetail, companyName);
  }

  function printCreditNoteFromFiscal(note: CreditNote) {
    if (!ticketDetail) return;
    const win = window.open("", "_blank", "width=420,height=640");
    if (!win) return;
    win.document.write(buildCreditNoteHtml(note, ticketDetail, companyName));
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <section className="customer-workspace">
      <div className="customer-left">
        <section className="fiscal-status-grid">
          <article><span>Pendientes</span><strong>{fiscalTotals.pending}</strong></article>
          <article><span>Aceptadas</span><strong>{fiscalTotals.accepted}</strong></article>
          <article><span>Rechazadas</span><strong>{fiscalTotals.rejected}</strong></article>
          <article><span>Monto</span><strong>{money.format(fiscalTotals.amount)}</strong></article>
        </section>

        <section className="panel admin-panel quick-form">
          <div className="panel-title">
            <strong>Facturas fiscales</strong>
            <span>{invoices.length} registros</span>
          </div>
          <FG label="Estado">
            <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value ? Number(event.target.value) : "")}>
              <option value="">Todos</option>
              <option value={1}>Solo local</option>
              <option value={2}>Pendiente API fiscal</option>
              <option value={3}>Aceptada</option>
              <option value={4}>Rechazada</option>
            </select>
          </FG>
        </section>

        <section className="panel admin-panel">
          <div className="panel-title">
            <strong>Listado fiscal</strong>
            <span>{invoices.length} facturas</span>
          </div>
          <div className="customer-list">
            {invoices.length === 0 ? (
              <p className="empty-state">Sin facturas fiscales para mostrar.</p>
            ) : invoices.map((invoice) => (
              <button
                key={invoice.id}
                className={invoice.id === selectedInvoiceId ? "customer-row customer-row-active" : "customer-row"}
                type="button"
                onClick={() => onSelectInvoice(invoice.id)}
              >
                <span>
                  <strong>{invoice.internalNumber}</strong>
                  <small>{invoice.saleNumber} · {fiscalDocumentTypeLabel(invoice.documentType)}</small>
                </span>
                <span>
                  <strong>{money.format(invoice.grandTotal)}</strong>
                  <small><FiscalStatusBadge status={invoice.fiscalStatus} /></small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <FiscalPendingTable pending={pending} onSubmit={onSubmitInvoice} />
      </div>

      <div className="customer-right">
        {detail && ticketDetail ? (
          <>
            <section className="admin-stats-grid">
              <article className="admin-stat"><span>Estado</span><strong>{fiscalStatusLabel(detail.fiscalStatus)}</strong></article>
              <article className="admin-stat"><span>Tipo</span><strong>{fiscalDocumentTypeLabel(detail.documentType)}</strong></article>
              <article className="admin-stat"><span>NCF</span><strong>{detail.localNcf || "-"}</strong></article>
              <article className="admin-stat"><span>Track ID</span><strong>{detail.fiscalTrackId || "-"}</strong></article>
            </section>

            <section className="panel admin-panel fiscal-detail-panel">
              <div className="panel-title">
                <strong>Control fiscal</strong>
                <FiscalStatusBadge status={detail.fiscalStatus} />
              </div>
              <div className="fiscal-detail-list">
                <span>NCF: <strong>{detail.localNcf || "-"}</strong></span>
                <span>Track ID: <strong>{detail.fiscalTrackId || "Sin envio externo"}</strong></span>
                <span>Emitida: <strong>{new Date(detail.issuedAt).toLocaleString("es-DO")}</strong></span>
                <span>Cliente: <strong>{detail.sale.customerName || "Consumidor Final"}</strong></span>
              </div>
            </section>

            <section className="panel admin-panel" style={{ display: "flex", justifyContent: "center", background: "#f5f5f5" }}>
              <ReceiptTicketPreview detail={ticketDetail} companyName={companyName} />
            </section>

            <CreditNoteTable notes={creditNotes} onPrint={printCreditNoteFromFiscal} />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              {detail.fiscalStatus === 2 && (
                <button className="btn-primary" onClick={() => onSubmitInvoice(detail.id)}>Enviar a fiscal</button>
              )}
              {detail.fiscalStatus !== 1 && (
                <button className="btn-secondary" onClick={() => onMarkLocalOnly(detail.id)}>Marcar local</button>
              )}
              <button className="btn-primary" onClick={printInvoice}>Imprimir factura</button>
            </div>
          </>
        ) : (
          <div className="empty-state admin-empty">Selecciona una factura fiscal para ver el detalle.</div>
        )}
      </div>
    </section>
  );
}

const FISCAL_PENDING_PAGE_SIZE = 5;

function FiscalPendingTable({ pending, onSubmit }: { pending: FiscalPendingDocument[]; onSubmit: (invoiceId: string) => void }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(pending.length / FISCAL_PENDING_PAGE_SIZE);
  const paginated = pending.slice((page - 1) * FISCAL_PENDING_PAGE_SIZE, page * FISCAL_PENDING_PAGE_SIZE);

  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Pendientes de API fiscal</strong>
        <span>{pending.length} registros</span>
      </div>
      {pending.length === 0 ? (
        <p className="empty-state">No hay comprobantes pendientes de envio fiscal.</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table action-table">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>NCF</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.internalNumber}</td>
                    <td>{invoice.localNcf || "-"}</td>
                    <td>{fiscalDocumentTypeLabel(invoice.documentType)}</td>
                    <td><span className="badge badge-amber">{invoice.status}</span></td>
                    <td>
                      <button type="button" onClick={() => onSubmit(invoice.id)}>Enviar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={pending.length}
            pageSize={FISCAL_PENDING_PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}

function FiscalStatusBadge({ status }: { status: number }) {
  const className = {
    1: "badge badge-muted",
    2: "badge badge-amber",
    3: "badge badge-green",
    4: "badge badge-red"
  }[status] ?? "badge badge-muted";

  return <span className={className}>{fiscalStatusLabel(status)}</span>;
}

function invoiceToSaleHistoryDetail(invoice: InvoiceDetail): SaleHistoryDetail {
  return {
    saleId: invoice.saleId,
    saleNumber: invoice.sale.number,
    invoiceId: invoice.id,
    localNcf: invoice.localNcf,
    customerId: invoice.sale.customerId,
    customerName: invoice.sale.customerName,
    userId: "",
    userName: "-",
    branchId: invoice.sale.branchId,
    branchName: "",
    status: 3,
    subtotal: invoice.sale.subtotal,
    taxTotal: invoice.sale.taxTotal,
    discountTotal: invoice.sale.discountTotal,
    grandTotal: invoice.sale.grandTotal,
    lines: invoice.lines,
    payments: invoice.payments,
    createdAt: invoice.issuedAt
  };
}

function fiscalStatusLabel(status: number) {
  return {
    1: "Solo local",
    2: "Pendiente API fiscal",
    3: "Aceptada",
    4: "Rechazada"
  }[status] ?? `${status}`;
}

function buildCreditNoteHtml(note: CreditNote, sale: SaleHistoryDetail, companyName: string): string {
  const fmt = new Intl.NumberFormat("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtMoney = (value: number) => `RD$ ${fmt.format(value)}`;
  const issued = new Date(note.issuedAt);
  const dateStr = issued.toLocaleDateString("es-DO", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = issued.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const escape = escapePrintHtml;
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escape(note.number)}</title>
  <style>
    @page { size: 80mm auto; margin: 4mm; }
    body { margin: 0; font-family: "Courier New", monospace; color: #111; }
    .ticket { width: 72mm; margin: 0 auto; font-size: 12px; line-height: 1.35; }
    .center { text-align: center; }
    .brand { font-size: 16px; font-weight: 700; text-transform: uppercase; }
    .title { margin: 8px 0 4px; padding: 5px 0; border-top: 1px dashed #111; border-bottom: 1px dashed #111; font-weight: 700; }
    .row { display: flex; justify-content: space-between; gap: 8px; }
    .row span:last-child { text-align: right; }
    .divider { border-top: 1px dashed #111; margin: 7px 0; }
    .reason { margin-top: 6px; white-space: pre-wrap; }
    .total { font-size: 14px; font-weight: 700; }
    .footer { margin-top: 10px; text-align: center; font-size: 11px; }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="center">
      <div class="brand">${escape(companyName)}</div>
      <div>${escape(sale.branchName ?? "")}</div>
      <div class="title">NOTA DE CREDITO</div>
    </div>
    <div class="row"><span>No. interno</span><span>${escape(note.number)}</span></div>
    <div class="row"><span>NCF nota</span><span>${escape(note.localNcf ?? "PENDIENTE")}</span></div>
    <div class="row"><span>NCF modificado</span><span>${escape(note.originalNcf ?? sale.localNcf ?? "N/D")}</span></div>
    <div class="row"><span>Factura</span><span>${escape(sale.saleNumber)}</span></div>
    <div class="row"><span>Fecha</span><span>${dateStr}</span></div>
    <div class="row"><span>Hora</span><span>${timeStr}</span></div>
    <div class="row"><span>Cliente</span><span>${escape(sale.customerName ?? "Consumidor Final")}</span></div>
    <div class="divider"></div>
    <div class="row"><span>Codigo DGII</span><span>${escape(creditNoteModificationLabel(note.modificationCode))}</span></div>
    <div class="reason"><strong>Razon:</strong><br />${escape(note.reason)}</div>
    <div class="divider"></div>
    <div class="row"><span>Subtotal</span><span>${fmtMoney(note.subtotal)}</span></div>
    <div class="row"><span>ITBIS</span><span>${fmtMoney(note.taxTotal)}</span></div>
    <div class="row total"><span>Total acreditado</span><span>${fmtMoney(note.grandTotal)}</span></div>
    <div class="divider"></div>
    <div class="row"><span>Estado fiscal</span><span>${escape(fiscalStatusLabel(note.fiscalStatus))}</span></div>
    <div class="footer">Documento generado por RAME POS</div>
  </div>
</body>
</html>`;
}

function fiscalDocumentTypeLabel(type: number) {
  return {
    1: "B02 Consumidor final",
    2: "B01 Credito fiscal"
  }[type] ?? `${type}`;
}

function SubscriptionQuickForm({
  company,
  onUpdate
}: {
  company: Company;
  onUpdate: (company: Company, payload: unknown) => void;
}) {
  const [planName, setPlanName] = useState(company.subscriptionPlanName ?? "Completo");
  const [status, setStatus] = useState(company.subscriptionStatus ?? "Active");
  const [billingMode, setBillingMode] = useState(company.subscriptionBillingMode ?? "Monthly");
  const [expiresAt, setExpiresAt] = useState(dateInputValue(company.subscriptionExpiresAt));
  const [lastPaymentAt, setLastPaymentAt] = useState(dateInputValue(company.lastPaymentAt));
  const [monthlyAmount, setMonthlyAmount] = useState(company.monthlySubscriptionAmount ?? 0);
  const [perpetualAmount, setPerpetualAmount] = useState(company.perpetualLicenseAmount ?? 0);
  const [notes, setNotes] = useState(company.subscriptionNotes ?? "");
  const [isActive, setIsActive] = useState(company.isActive !== false);
  const [modules, setModules] = useState<string[]>(company.enabledModules ?? subscriptionModuleOptions.map((module) => module.id));

  useEffect(() => {
    setPlanName(company.subscriptionPlanName ?? "Completo");
    setStatus(company.subscriptionStatus ?? "Active");
    setBillingMode(company.subscriptionBillingMode ?? "Monthly");
    setExpiresAt(dateInputValue(company.subscriptionExpiresAt));
    setLastPaymentAt(dateInputValue(company.lastPaymentAt));
    setMonthlyAmount(company.monthlySubscriptionAmount ?? 0);
    setPerpetualAmount(company.perpetualLicenseAmount ?? 0);
    setNotes(company.subscriptionNotes ?? "");
    setIsActive(company.isActive !== false);
    setModules(company.enabledModules ?? subscriptionModuleOptions.map((module) => module.id));
  }, [company.id]);

  function toggleModule(moduleId: string) {
    setModules((current) => current.includes(moduleId)
      ? current.filter((item) => item !== moduleId)
      : [...current, moduleId]);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    onUpdate(company, {
      subscriptionPlanName: planName || "Completo",
      subscriptionStatus: status,
      subscriptionBillingMode: billingMode,
      subscriptionExpiresAt: expiresAt ? `${expiresAt}T23:59:59.999Z` : null,
      enabledModules: modules,
      monthlySubscriptionAmount: monthlyAmount,
      perpetualLicenseAmount: perpetualAmount,
      lastPaymentAt: lastPaymentAt ? `${lastPaymentAt}T12:00:00.000Z` : null,
      subscriptionNotes: notes || null,
      isActive
    });
  }

  return (
    <form className="panel admin-panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>Contrato SaaS</strong>
        <span>{company.tradeName || company.name}</span>
      </div>
      <div className="form-grid two">
        <FG label="Plan"><input value={planName} onChange={(event) => setPlanName(event.target.value)} required /></FG>
        <FG label="Estado">
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="Trial">Prueba</option>
            <option value="Active">Activa</option>
            <option value="PastDue">Pago vencido</option>
            <option value="Suspended">Suspendida</option>
            <option value="Cancelled">Cancelada</option>
          </select>
        </FG>
      </div>
      <div className="form-grid two">
        <FG label="Modalidad">
          <select value={billingMode} onChange={(event) => setBillingMode(event.target.value)}>
            <option value="Trial">Prueba</option>
            <option value="Monthly">Mensual</option>
            <option value="Annual">Anual</option>
            <option value="Perpetual">Licencia perpetua</option>
          </select>
        </FG>
        <FG label="Vencimiento"><input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></FG>
      </div>
      <div className="form-grid two">
        <FG label="Mensualidad"><input min={0} step="0.01" type="number" value={monthlyAmount} onChange={(event) => setMonthlyAmount(Number(event.target.value))} /></FG>
        <FG label="Precio licencia perpetua"><input min={0} step="0.01" type="number" value={perpetualAmount} onChange={(event) => setPerpetualAmount(Number(event.target.value))} /></FG>
      </div>
      <FG label="Ultimo pago"><input type="date" value={lastPaymentAt} onChange={(event) => setLastPaymentAt(event.target.value)} /></FG>
      <div className="form-group">
        <label className="form-label">Modulos contratados</label>
        <div className="access-grid">
          {subscriptionModuleOptions.map((module) => (
            <label className="check-row" key={module.id}>
              <input type="checkbox" checked={modules.includes(module.id)} onChange={() => toggleModule(module.id)} />
              <span>
                <strong>{module.label}</strong>
                <small>{module.id}</small>
              </span>
            </label>
          ))}
        </div>
      </div>
      <FG label="Notas comerciales"><textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} /></FG>
      <label className="check-row">
        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
        <span>Empresa activa en el sistema</span>
      </label>
      <div className="action-row">
        <button className="primary-button" type="submit">Guardar licencia</button>
      </div>
    </form>
  );
}

function EmailStatusWorkspace({
  status,
  defaultEmail,
  onSendTest,
  onRefresh
}: {
  status: EmailStatus | null;
  defaultEmail: string;
  onSendTest: (to?: string) => Promise<{ message: string }>;
  onRefresh: () => Promise<void>;
}) {
  const [to, setTo] = useState(defaultEmail);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setMessage(null);
    setError(null);
    try {
      const response = await onSendTest(to.trim() || undefined);
      setMessage(response.message);
      await onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo enviar el correo de prueba.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AdminTwoColumn>
      <form className="panel admin-panel quick-form" onSubmit={submit}>
        <div className="panel-title">
          <strong>Diagnostico SMTP</strong>
          <span>{status?.isConfigured ? "Configurado" : "Pendiente de configurar"}</span>
        </div>
        <div className="form-grid">
          <FG label="Correo destino">
            <input type="email" value={to} onChange={(event) => setTo(event.target.value)} placeholder="usuario@empresa.com" />
          </FG>
        </div>
        {message && <div className="success-banner">{message}</div>}
        {error && <div className="error-banner">{error}</div>}
        <div className="action-row">
          <button className="primary-button" type="submit" disabled={isSending || !status?.isConfigured}>
            {isSending ? "Enviando..." : "Enviar prueba"}
          </button>
          <button type="button" onClick={onRefresh}>Refrescar</button>
        </div>
      </form>

      <section className="panel admin-panel">
        <div className="panel-title">
          <strong>Configuracion actual</strong>
          <span>Variables de entorno del backend</span>
        </div>
        <div className="statement-kpis">
          <article><span>Estado</span><strong>{status?.isConfigured ? "Listo" : "No configurado"}</strong></article>
          <article><span>Puerto</span><strong>{status?.smtpPort ?? "N/D"}</strong></article>
          <article><span>SSL</span><strong>{status?.useSsl ? "Activo" : "Inactivo"}</strong></article>
        </div>
        <DataTable
          title="Parametros"
          columns={["Campo", "Valor"]}
          rows={[
            ["Servidor SMTP", status?.smtpHost || "No configurado"],
            ["Remitente", status ? `${status.fromName} <${status.fromAddress}>` : "N/D"],
            ["URL frontend", status?.frontendBaseUrl || "No configurado"]
          ]}
        />
      </section>
    </AdminTwoColumn>
  );
}

function CompanyQuickForm({
  company,
  settingsOnly = false,
  onCreate,
  onUpdate,
  onDelete
}: {
  company?: Company | null;
  settingsOnly?: boolean;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (company: Company, payload: unknown) => void;
  onDelete?: (company: Company) => void;
}) {
  const isEditing = Boolean(company);
  const [name, setName] = useState(company?.name ?? "");
  const [tradeName, setTradeName] = useState(company?.tradeName ?? "");
  const [taxId, setTaxId] = useState(company?.taxId ?? "");
  const [fiscalAddress, setFiscalAddress] = useState(company?.fiscalAddress ?? "");
  const [phone, setPhone] = useState(company?.phone ?? "");
  const [email, setEmail] = useState(company?.email ?? "");
  const [logoUrl, setLogoUrl] = useState(company?.logoUrl ?? "");
  const [currencyCode, setCurrencyCode] = useState(company?.currencyCode ?? "DOP");
  const [defaultTaxRate, setDefaultTaxRate] = useState(Math.round((company?.defaultTaxRate ?? 0.18) * 100));
  const [receiptHeader, setReceiptHeader] = useState(company?.receiptHeader ?? "");
  const [receiptFooter, setReceiptFooter] = useState(company?.receiptFooter ?? "");
  const [receiptPaperWidthMm, setReceiptPaperWidthMm] = useState(company?.receiptPaperWidthMm ?? 80);
  const [enableFiscalReceipts, setEnableFiscalReceipts] = useState(company?.enableFiscalReceipts !== false);
  const [consumerFinalNcfPrefix, setConsumerFinalNcfPrefix] = useState(company?.consumerFinalNcfPrefix ?? "B02");
  const [taxCreditNcfPrefix, setTaxCreditNcfPrefix] = useState(company?.taxCreditNcfPrefix ?? "B01");
  const [nextConsumerFinalNcf, setNextConsumerFinalNcf] = useState(company?.nextConsumerFinalNcf ?? 1);
  const [nextTaxCreditNcf, setNextTaxCreditNcf] = useState(company?.nextTaxCreditNcf ?? 1);
  const [invoiceLegalText, setInvoiceLegalText] = useState(company?.invoiceLegalText ?? "");
  const [isActive, setIsActive] = useState(company?.isActive !== false);

  useEffect(() => {
    setName(company?.name ?? "");
    setTradeName(company?.tradeName ?? "");
    setTaxId(company?.taxId ?? "");
    setFiscalAddress(company?.fiscalAddress ?? "");
    setPhone(company?.phone ?? "");
    setEmail(company?.email ?? "");
    setLogoUrl(company?.logoUrl ?? "");
    setCurrencyCode(company?.currencyCode ?? "DOP");
    setDefaultTaxRate(Math.round((company?.defaultTaxRate ?? 0.18) * 100));
    setReceiptHeader(company?.receiptHeader ?? "");
    setReceiptFooter(company?.receiptFooter ?? "");
    setReceiptPaperWidthMm(company?.receiptPaperWidthMm ?? 80);
    setEnableFiscalReceipts(company?.enableFiscalReceipts !== false);
    setConsumerFinalNcfPrefix(company?.consumerFinalNcfPrefix ?? "B02");
    setTaxCreditNcfPrefix(company?.taxCreditNcfPrefix ?? "B01");
    setNextConsumerFinalNcf(company?.nextConsumerFinalNcf ?? 1);
    setNextTaxCreditNcf(company?.nextTaxCreditNcf ?? 1);
    setInvoiceLegalText(company?.invoiceLegalText ?? "");
    setIsActive(company?.isActive !== false);
  }, [company?.id]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      name,
      tradeName: tradeName || null,
      taxId: taxId || null,
      fiscalAddress: fiscalAddress || null,
      phone: phone || null,
      email: email || null,
      logoUrl: logoUrl || null,
      currencyCode: currencyCode || "DOP",
      defaultTaxRate: Number(defaultTaxRate || 0) / 100,
      receiptHeader: receiptHeader || null,
      receiptFooter: receiptFooter || null,
      receiptPaperWidthMm,
      enableFiscalReceipts,
      consumerFinalNcfPrefix: consumerFinalNcfPrefix || "B02",
      taxCreditNcfPrefix: taxCreditNcfPrefix || "B01",
      nextConsumerFinalNcf,
      nextTaxCreditNcf,
      invoiceLegalText: invoiceLegalText || null,
      isActive
    };

    if (company && onUpdate) {
      onUpdate(company, payload);
      return;
    }

    onCreate(() => api.createCompany({ ...payload, isActive: true }));
    setName("");
    setTradeName("");
    setTaxId("");
    setFiscalAddress("");
    setPhone("");
    setEmail("");
    setLogoUrl("");
    setCurrencyCode("DOP");
    setDefaultTaxRate(18);
    setReceiptHeader("");
    setReceiptFooter("");
    setReceiptPaperWidthMm(80);
    setEnableFiscalReceipts(true);
    setConsumerFinalNcfPrefix("B02");
    setTaxCreditNcfPrefix("B01");
    setNextConsumerFinalNcf(1);
    setNextTaxCreditNcf(1);
    setInvoiceLegalText("");
    setIsActive(true);
  }

  return (
    <form className="panel admin-panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{settingsOnly ? "Configuracion general" : isEditing ? "Editar compania" : "Nueva compania"}</strong>
        <span>{company?.tradeName || company?.name || "Plataforma"}</span>
      </div>
      <FG label="Nombre legal"><input value={name} onChange={(event) => setName(event.target.value)} required /></FG>
      <FG label="Nombre comercial"><input value={tradeName} onChange={(event) => setTradeName(event.target.value)} /></FG>
      <FG label="RNC / identificacion"><input value={taxId} onChange={(event) => setTaxId(event.target.value)} /></FG>
      <FG label="Direccion fiscal"><input value={fiscalAddress} onChange={(event) => setFiscalAddress(event.target.value)} /></FG>
      <div className="form-grid two">
        <FG label="Telefono"><input value={phone} onChange={(event) => setPhone(event.target.value)} /></FG>
        <FG label="Email"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></FG>
      </div>
      <FG label="Logo URL"><input value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} /></FG>
      <div className="form-grid two">
        <FG label="Moneda"><input value={currencyCode} onChange={(event) => setCurrencyCode(event.target.value.toUpperCase())} maxLength={3} /></FG>
        <FG label="ITBIS por defecto (%)"><input type="number" min={0} max={100} step="0.01" value={defaultTaxRate} onChange={(event) => setDefaultTaxRate(Number(event.target.value))} /></FG>
      </div>
      <div className="form-grid two">
        <FG label="Ancho ticket (mm)"><input type="number" min={58} max={120} value={receiptPaperWidthMm} onChange={(event) => setReceiptPaperWidthMm(Number(event.target.value))} /></FG>
        <label className="check-row">
          <input type="checkbox" checked={enableFiscalReceipts} onChange={(event) => setEnableFiscalReceipts(event.target.checked)} />
          <span>Enviar facturas a API fiscal</span>
        </label>
      </div>
      <FG label="Encabezado de ticket"><input value={receiptHeader} onChange={(event) => setReceiptHeader(event.target.value)} placeholder="Ej: AUTORIZADO POR DGII" /></FG>
      <FG label="Pie de ticket"><input value={receiptFooter} onChange={(event) => setReceiptFooter(event.target.value)} placeholder="Mensaje para el cliente" /></FG>
      <div className="form-grid two">
        <FG label="Prefijo consumidor final"><input value={consumerFinalNcfPrefix} onChange={(event) => setConsumerFinalNcfPrefix(event.target.value.toUpperCase())} /></FG>
        <FG label="Siguiente consumidor final"><input type="number" min={1} value={nextConsumerFinalNcf} onChange={(event) => setNextConsumerFinalNcf(Number(event.target.value))} /></FG>
      </div>
      <div className="form-grid two">
        <FG label="Prefijo credito fiscal"><input value={taxCreditNcfPrefix} onChange={(event) => setTaxCreditNcfPrefix(event.target.value.toUpperCase())} /></FG>
        <FG label="Siguiente credito fiscal"><input type="number" min={1} value={nextTaxCreditNcf} onChange={(event) => setNextTaxCreditNcf(Number(event.target.value))} /></FG>
      </div>
      <FG label="Texto legal factura"><textarea rows={3} value={invoiceLegalText} onChange={(event) => setInvoiceLegalText(event.target.value)} /></FG>
      {isEditing && !settingsOnly && (
        <label className="check-row">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          <span>Compania activa</span>
        </label>
      )}
      <div className="action-row">
        <button className="primary-button" type="submit">{isEditing ? "Guardar cambios" : "Crear compania"}</button>
        {company && onDelete && !settingsOnly && <button type="button" onClick={() => onDelete(company)}>Desactivar</button>}
      </div>
    </form>
  );
}

function CompanyList({
  companies,
  selectedCompanyId,
  onCreateNew,
  onSelectCompany
}: {
  companies: Company[];
  selectedCompanyId?: string;
  onCreateNew: () => void;
  onSelectCompany: (companyId: string) => void;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Companias registradas</strong>
        <button type="button" onClick={onCreateNew}>Nueva</button>
      </div>
      <div className="customer-list">
        {companies.length === 0 ? (
          <p className="empty-state">Sin companias registradas.</p>
        ) : companies.map((company) => (
          <button
            className={company.id === selectedCompanyId ? "customer-row customer-row-active" : "customer-row"}
            key={company.id}
            type="button"
            onClick={() => onSelectCompany(company.id)}
          >
            <span>
              <strong>{company.tradeName || company.name}</strong>
              <small>{company.taxId || "Sin RNC"}</small>
            </span>
            <span>
              <strong>{company.isActive === false ? "Inactiva" : "Activa"}</strong>
              <small>{company.tenantId}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function UserSecurityWorkspace({
  session,
  users,
  roles,
  permissions,
  companies,
  selectedCompany,
  canSelectCompany,
  selectedUser,
  onCreateNew,
  onSelectUser,
  onSelectCompany,
  onCreate,
  onUpdate
}: {
  session: AuthSession;
  users: AdminUser[];
  roles: AdminRole[];
  permissions: PermissionSummary[];
  companies: Company[];
  selectedCompany: Company;
  canSelectCompany: boolean;
  selectedUser: AdminUser | null;
  onCreateNew: () => void;
  onSelectUser: (userId: string) => void;
  onSelectCompany: (companyId: string) => void;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate: (action: () => Promise<unknown>) => void;
}) {
  return (
    <AdminTwoColumn>
      <div className="stacked-forms">
        {companies.length > 0 && (
          <CompanyScopeSelector
            companies={companies}
            selectedCompany={selectedCompany}
            onSelectCompany={onSelectCompany}
            disabled={!canSelectCompany}
          />
        )}
        <UserQuickForm
          session={session}
          targetCompany={selectedCompany}
          user={selectedUser}
          roles={roles}
          permissions={permissions}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      </div>

      <section className="panel admin-panel">
        <div className="panel-title">
          <strong>Usuarios de la compania</strong>
          <button type="button" onClick={onCreateNew}>Nuevo</button>
        </div>
        <div className="customer-list">
          {users.length === 0 ? (
            <p className="empty-state">Sin usuarios registrados.</p>
          ) : users.map((user) => (
            <button
              key={user.id}
              className={user.id === selectedUser?.id ? "customer-row customer-row-active" : "customer-row"}
              type="button"
              onClick={() => onSelectUser(user.id)}
            >
              <span>
                <strong>{user.fullName}</strong>
                <small>{user.email}</small>
              </span>
              <span>
                <strong>{user.lockoutEndAt && new Date(user.lockoutEndAt) > new Date() ? "Bloqueado" : user.isActive ? "Activo" : "Inactivo"}</strong>
                <small>{user.lockoutEndAt && new Date(user.lockoutEndAt) > new Date()
                  ? `Hasta ${new Date(user.lockoutEndAt).toLocaleTimeString("es-DO")}`
                  : user.roles.join(", ") || "Sin roles"}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    </AdminTwoColumn>
  );
}

function CompanyScopeSelector({
  companies,
  selectedCompany,
  onSelectCompany,
  disabled = false
}: {
  companies: Company[];
  selectedCompany: Company;
  onSelectCompany: (companyId: string) => void;
  disabled?: boolean;
}) {
  return (
    <section className="panel admin-panel quick-form">
      <div className="panel-title">
        <strong>Empresa del usuario</strong>
        <span>{disabled ? "Asignada a tu cuenta" : "Selecciona el alcance"}</span>
      </div>
      <FG label="Empresa">
        <select
          value={selectedCompany.id}
          onChange={(event) => onSelectCompany(event.target.value)}
          disabled={disabled}
        >
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.tradeName || company.name}
            </option>
          ))}
        </select>
      </FG>
    </section>
  );
}

function BranchSecurityWorkspace({
  branches,
  companies,
  selectedCompany,
  canSelectCompany,
  selectedBranch,
  onCreateNew,
  onSelectBranch,
  onSelectCompany,
  onCreate,
  onUpdate
}: {
  branches: Branch[];
  companies: Company[];
  selectedCompany: Company;
  canSelectCompany: boolean;
  selectedBranch: Branch | null;
  onCreateNew: () => void;
  onSelectBranch: (branchId: string) => void;
  onSelectCompany: (companyId: string) => void;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate: (action: () => Promise<unknown>) => void;
}) {
  return (
    <AdminTwoColumn>
      <div className="stacked-forms">
        {companies.length > 0 && (
          <CompanyScopeSelector
            companies={companies}
            selectedCompany={selectedCompany}
            onSelectCompany={onSelectCompany}
            disabled={!canSelectCompany}
          />
        )}
        <BranchQuickForm
          targetCompany={selectedCompany}
          branch={selectedBranch}
          onCreate={onCreate}
          onUpdate={onUpdate}
        />
      </div>

      <section className="panel admin-panel">
        <div className="panel-title">
          <strong>Sucursales de la compania</strong>
          <button type="button" onClick={onCreateNew}>Nueva</button>
        </div>
        <div className="customer-list">
          {branches.length === 0 ? (
            <p className="empty-state">Sin sucursales registradas.</p>
          ) : branches.map((branch) => (
            <button
              key={branch.id}
              className={branch.id === selectedBranch?.id ? "customer-row customer-row-active" : "customer-row"}
              type="button"
              onClick={() => onSelectBranch(branch.id)}
            >
              <span>
                <strong>{branch.name}</strong>
                <small>{branch.code || "Sin codigo"}</small>
              </span>
              <span>
                <strong>{branch.isActive === false ? "Inactiva" : "Activa"}</strong>
                <small>{branch.isMain ? "Principal" : branch.address || "Sucursal"}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    </AdminTwoColumn>
  );
}

function BranchQuickForm({
  targetCompany,
  branch,
  onCreate,
  onUpdate
}: {
  targetCompany: Company;
  branch?: Branch | null;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (action: () => Promise<unknown>) => void;
}) {
  const isEditing = Boolean(branch);
  const [name, setName] = useState(branch?.name ?? "");
  const [code, setCode] = useState(branch?.code ?? "");
  const [address, setAddress] = useState(branch?.address ?? "");
  const [isMain, setIsMain] = useState(branch?.isMain ?? false);
  const [isActive, setIsActive] = useState(branch?.isActive !== false);

  useEffect(() => {
    setName(branch?.name ?? "");
    setCode(branch?.code ?? "");
    setAddress(branch?.address ?? "");
    setIsMain(branch?.isMain ?? false);
    setIsActive(branch?.isActive !== false);
  }, [branch?.id]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      tenantId: branch?.tenantId ?? targetCompany.tenantId,
      companyId: branch?.companyId ?? targetCompany.id,
      name,
      code: code || null,
      address: address || null,
      isMain,
      isActive
    };

    if (branch && onUpdate) {
      onUpdate(() => api.updateBranch(branch.id, payload));
      return;
    }

    onCreate(() => api.createBranch({
      ...payload,
      isActive: true
    }));
    setName("");
    setCode("");
    setAddress("");
    setIsMain(false);
    setIsActive(true);
  }

  return (
    <form className="panel admin-panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar sucursal" : "Nueva sucursal"}</strong>
        <span>{branch?.code || branch?.name || targetCompany.tradeName || targetCompany.name}</span>
      </div>
      <FG label="Nombre"><input value={name} onChange={(event) => setName(event.target.value)} required /></FG>
      <FG label="Codigo"><input value={code} onChange={(event) => setCode(event.target.value)} /></FG>
      <FG label="Direccion"><input value={address} onChange={(event) => setAddress(event.target.value)} /></FG>
      <label className="check-row">
        <input type="checkbox" checked={isMain} onChange={(event) => setIsMain(event.target.checked)} />
        <span>
          <strong>Sucursal principal</strong>
          <small>{isEditing ? "Marca esta sucursal como referencia principal." : "Se usara como referencia operativa de la compania."}</small>
        </span>
      </label>
      {isEditing && (
        <label className="check-row">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          <span>
            <strong>Sucursal activa</strong>
            <small>Si se desactiva, no deberia usarse en operaciones nuevas.</small>
          </span>
        </label>
      )}
      <button className="primary-button" type="submit">
        {isEditing ? "Guardar cambios" : "Crear sucursal"}
      </button>
    </form>
  );
}
function customAccessRoleName(email: string) {
  return `Acceso - ${email.trim().toLowerCase()}`;
}

function uniqueAccessRoleName(email: string) {
  return `${customAccessRoleName(email)} - ${Date.now().toString(36)}`;
}

function resolveAccessPermissionIds(accessCodes: string[], permissions: PermissionSummary[]) {
  const selected = new Set(accessCodes);
  for (const option of screenAccessOptions) {
    if (selected.has(option.code)) {
      option.grants.forEach((grant) => selected.add(grant));
    }
  }

  return permissions
    .filter((permission) => selected.has(permission.code))
    .map((permission) => permission.id);
}

function resolveUserAccessCodes(user: AdminUser, roles: AdminRole[]) {
  const permissions = new Set<string>();
  for (const role of roles) {
    if (user.roles.includes(role.name)) {
      role.permissions.forEach((permission) => permissions.add(permission));
    }
  }

  return Array.from(permissions).filter((permission) => screenAccessCodes.has(permission));
}

function ScreenAccessChecklist({
  selected,
  onChange
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const selectedSet = new Set(selected);

  function toggle(code: string) {
    const next = new Set(selectedSet);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    onChange(Array.from(next));
  }

  function toggleGroup(group: ScreenAccessGroup) {
    const next = new Set(selectedSet);
    const allSelected = group.options.every((option) => next.has(option.code));
    for (const option of group.options) {
      if (allSelected) {
        next.delete(option.code);
      } else {
        next.add(option.code);
      }
    }
    onChange(Array.from(next));
  }

  return (
    <div className="form-group">
      <label className="form-label">Acceso a pantallas</label>
      <div className="access-grid">
        {screenAccessGroups.map((group) => {
          const allSelected = group.options.every((option) => selectedSet.has(option.code));
          const someSelected = group.options.some((option) => selectedSet.has(option.code));
          return (
            <section className="access-group" key={group.label}>
              <label className="check-row access-group-title">
                <input type="checkbox" checked={allSelected} ref={(input) => { if (input) input.indeterminate = !allSelected && someSelected; }} onChange={() => toggleGroup(group)} />
                <span>
                  <strong>{group.label} completo</strong>
                  <small>{group.options.length} opciones</small>
                </span>
              </label>
              <div className="access-options">
                {group.options.map((option) => (
                  <label className="check-row" key={option.code}>
                    <input type="checkbox" checked={selectedSet.has(option.code)} onChange={() => toggle(option.code)} />
                    <span>
                      <strong>{option.label}</strong>
                      <small>{option.code}</small>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function UserQuickForm({
  session,
  targetCompany,
  user,
  roles = [],
  permissions,
  onCreate,
  onUpdate
}: {
  session: AuthSession;
  targetCompany: Company;
  user?: AdminUser | null;
  roles?: AdminRole[];
  permissions: PermissionSummary[];
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (action: () => Promise<unknown>) => void;
}) {
  const isEditing = Boolean(user);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [accessCodes, setAccessCodes] = useState<string[]>([]);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setEmail(user?.email ?? "");
    setPassword("");
    setIsActive(user?.isActive ?? true);
    setAccessCodes(user ? resolveUserAccessCodes(user, roles) : []);
  }, [user?.id, roles]);

  function submit(event: FormEvent) {
    event.preventDefault();

    if (user && onUpdate) {
      onUpdate(async () => {
        const permissionIds = resolveAccessPermissionIds(accessCodes, permissions);
        const existingAccessRole = roles.find((role) => user.roles.includes(role.name) && role.name.startsWith("Acceso - "));
        const role = existingAccessRole
          ? await api.updateRole(existingAccessRole.id, {
              name: existingAccessRole.name,
              description: `Accesos por pantalla para ${fullName}`,
              permissionIds
            })
          : await api.createRole({
              tenantId: user.tenantId,
              companyId: user.companyId,
              name: uniqueAccessRoleName(email),
              description: `Accesos por pantalla para ${fullName}`,
              permissionIds
            });

        await api.updateUser(user.id, {
          fullName,
          email,
          isActive,
          roleIds: [role.id],
          newPassword: password.trim() ? password : null
        });
      });
      setPassword("");
      return;
    }

    onCreate(async () => {
      const createdUser = await api.createUser({
        tenantId: targetCompany.tenantId,
        companyId: targetCompany.id,
        fullName,
        email,
        password,
        isActive: true,
        roleIds: []
      });
      const role = await api.createRole({
        tenantId: targetCompany.tenantId,
        companyId: targetCompany.id,
        name: uniqueAccessRoleName(email),
        description: `Accesos por pantalla para ${fullName}`,
        permissionIds: resolveAccessPermissionIds(accessCodes, permissions)
      });
      await api.updateUser(createdUser.id, {
        fullName,
        email,
        isActive: true,
        roleIds: [role.id],
        newPassword: null
      });
    });
    setFullName("");
    setEmail("");
    setPassword("");
    setIsActive(true);
    setAccessCodes([]);
  }

  return (
    <form className="panel admin-panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar usuario" : "Nuevo usuario"}</strong>
        <span>{user?.email || targetCompany.tradeName || targetCompany.name}</span>
      </div>
      <FG label="Nombre completo"><input value={fullName} onChange={(event) => setFullName(event.target.value)} required /></FG>
      <FG label="Correo"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></FG>
      <FG label={isEditing ? "Nueva contrasena" : "Contrasena inicial"} hint={isEditing ? "Dejalo vacio para mantener la actual. Debe incluir mayuscula, minuscula, numero y simbolo." : "Debe incluir mayuscula, minuscula, numero y simbolo."}>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required={!isEditing} minLength={password || !isEditing ? 8 : undefined} />
      </FG>
      {isEditing && (
        <div className="statement-kpis">
          <article><span>Intentos fallidos</span><strong>{user?.accessFailedCount ?? 0}</strong></article>
          <article><span>Ultimo acceso</span><strong>{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("es-DO") : "N/D"}</strong></article>
          <article><span>Bloqueo</span><strong>{user?.lockoutEndAt && new Date(user.lockoutEndAt) > new Date() ? "Activo" : "Sin bloqueo"}</strong></article>
        </div>
      )}
      {isEditing && (
        <label className="check-row">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          <span>
            <strong>Usuario activo</strong>
            <small>Si se desactiva, no podra iniciar sesion.</small>
          </span>
        </label>
      )}
      <ScreenAccessChecklist selected={accessCodes} onChange={setAccessCodes} />
      <button className="primary-button" type="submit">
        {isEditing ? "Guardar cambios" : "Crear usuario"}
      </button>
    </form>
  );
}
function RoleQuickForm({
  session,
  targetCompany,
  role,
  permissions,
  onCreate,
  onUpdate,
  onDelete
}: {
  session: AuthSession;
  targetCompany: Company;
  role?: AdminRole | null;
  permissions: PermissionSummary[];
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (role: AdminRole, payload: unknown) => void;
  onDelete?: (role: AdminRole) => void;
}) {
  const isEditing = Boolean(role);
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [permissionIds, setPermissionIds] = useState<string[]>([]);

  useEffect(() => {
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    const selectedCodes = new Set(role?.permissions ?? []);
    setPermissionIds(permissions.filter((permission) => selectedCodes.has(permission.code)).map((permission) => permission.id));
  }, [role?.id, permissions]);

  function togglePermission(permissionId: string) {
    setPermissionIds((current) => current.includes(permissionId) ? current.filter((id) => id !== permissionId) : [...current, permissionId]);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      tenantId: role?.tenantId ?? targetCompany.tenantId,
      companyId: role?.companyId ?? targetCompany.id,
      name,
      description: description || null,
      permissionIds
    };

    if (role && onUpdate) {
      onUpdate(role, payload);
      return;
    }

    onCreate(() => api.createRole(payload));
    setName("");
    setDescription("");
    setPermissionIds([]);
  }

  return (
    <form className="panel admin-panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar rol" : "Nuevo rol"}</strong>
        <span>{role?.isSystem ? "Sistema" : targetCompany.tradeName || targetCompany.name}</span>
      </div>
      <FG label="Nombre del rol"><input value={name} onChange={(event) => setName(event.target.value)} required disabled={role?.isSystem} /></FG>
      <FG label="Descripcion"><input value={description} onChange={(event) => setDescription(event.target.value)} /></FG>
      <CheckboxList
        title="Permisos"
        items={permissions.map((permission) => ({ id: permission.id, label: permission.code, detail: `${permission.module} - ${permission.description}` }))}
        selected={permissionIds}
        onToggle={togglePermission}
      />
      <div className="action-row">
        <button className="primary-button" type="submit">{isEditing ? "Guardar cambios" : "Crear rol"}</button>
        {role && !role.isSystem && onDelete && <button type="button" onClick={() => onDelete(role)}>Eliminar</button>}
      </div>
    </form>
  );
}

function RoleList({
  roles,
  selectedRoleId,
  onCreateNew,
  onSelectRole
}: {
  roles: AdminRole[];
  selectedRoleId?: string;
  onCreateNew: () => void;
  onSelectRole: (roleId: string) => void;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Roles de la compania</strong>
        <button type="button" onClick={onCreateNew}>Nuevo</button>
      </div>
      <div className="customer-list">
        {roles.length === 0 ? (
          <p className="empty-state">Sin roles registrados.</p>
        ) : roles.map((role) => (
          <button
            className={role.id === selectedRoleId ? "customer-row customer-row-active" : "customer-row"}
            key={role.id}
            type="button"
            onClick={() => onSelectRole(role.id)}
          >
            <span>
              <strong>{role.name}</strong>
              <small>{role.description || "Sin descripcion"}</small>
            </span>
            <span>
              <strong>{role.permissions.length} permisos</strong>
              <small>{role.isSystem ? "Sistema" : "Personalizado"}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CheckboxList({
  title,
  items,
  selected,
  onToggle
}: {
  title: string;
  items: Array<{ id: string; label: string; detail?: string }>;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="form-group">
      <label className="form-label">{title}</label>
      <div className="check-list">
        {items.length === 0 ? (
          <span className="empty-state">Sin opciones disponibles.</span>
        ) : items.map((item) => (
          <label className="check-row" key={item.id}>
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => onToggle(item.id)}
            />
            <span>
              <strong>{item.label}</strong>
              {item.detail && <small>{item.detail}</small>}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CustomerWorkspace({
  session,
  data,
  selectedCustomerId,
  isStatementLoading,
  onSelectCustomer,
  onCreateCustomer,
  onPayment
}: {
  session: AuthSession;
  data: AdminData;
  selectedCustomerId: string | null;
  isStatementLoading: boolean;
  onSelectCustomer: (customerId: string) => void;
  onCreateCustomer: (action: () => Promise<unknown>) => void;
  onPayment: (amount: number, method: number, reference: string, notes: string) => Promise<void>;
}) {
  const selectedCustomer = data.customers.find((customer) => customer.id === selectedCustomerId) ?? data.customers[0];
  const statement = data.customerStatement;

  return (
    <section className="customer-workspace">
      <div className="customer-left">
        <FormTabs tabs={[
          {
            label: "Nuevo cliente",
            content: <CustomerQuickForm session={session} onCreate={onCreateCustomer} />
          },
          {
            label: `Clientes (${data.customers.length})`,
            content: (
              <section className="panel admin-panel">
                <div className="panel-title">
                  <strong>Clientes</strong>
                  <span>{data.customers.length} registros</span>
                </div>
                <div className="customer-list">
                  {data.customers.length === 0 ? (
                    <p className="empty-state">Sin clientes registrados.<br /><small>Usa la pestana "Nuevo cliente" para agregar uno.</small></p>
                  ) : data.customers.map((customer) => (
                    <button
                      className={customer.id === selectedCustomer?.id ? "customer-row customer-row-active" : "customer-row"}
                      key={customer.id}
                      type="button"
                      onClick={() => onSelectCustomer(customer.id)}
                    >
                      <span>
                        <strong>{customer.name}</strong>
                        <small>{customer.phone || customer.email || "Sin contacto"}</small>
                      </span>
                      <span>
                        <strong>{money.format(customer.creditBalance ?? 0)}</strong>
                        <small>{customer.type === 2 ? "Credito" : "Contado"}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )
          }
        ]} />
      </div>

      <div className="customer-right">
        <section className="panel admin-panel">
          <div className="panel-title">
            <strong>{selectedCustomer?.name ?? "Estado de cuenta"}</strong>
            <span>{isStatementLoading ? "Cargando..." : "CxC"}</span>
          </div>
          <div className="statement-kpis">
            <article>
              <span>Limite</span>
              <strong>{money.format(statement?.creditLimit ?? selectedCustomer?.creditLimit ?? 0)}</strong>
            </article>
            <article>
              <span>Balance</span>
              <strong>{money.format(statement?.creditBalance ?? selectedCustomer?.creditBalance ?? 0)}</strong>
            </article>
            <article>
              <span>Disponible</span>
              <strong>{money.format(statement?.availableCredit ?? selectedCustomer?.availableCredit ?? 0)}</strong>
            </article>
          </div>
        </section>

        <AdminTwoColumn>
          <DataTable
            title="Documentos por cobrar"
            columns={["Documento", "Vence", "Estado", "Balance"]}
            rows={(statement?.receivables ?? data.receivables.filter((item) => item.customerId === selectedCustomer?.id)).map((item) => [
              item.documentNumber,
              new Date(item.dueAt).toLocaleDateString("es-DO"),
              item.isOverdue ? "Vencido" : statusLabel("receivable", item.status),
              money.format(item.balance)
            ])}
          />
          <CustomerPaymentForm
            disabled={!selectedCustomer || (statement?.creditBalance ?? selectedCustomer?.creditBalance ?? 0) <= 0}
            maxAmount={statement?.creditBalance ?? selectedCustomer?.creditBalance ?? 0}
            onPayment={onPayment}
          />
        </AdminTwoColumn>

        <DataTable
          title="Pagos recientes"
          columns={["Fecha", "Metodo", "Referencia", "Monto"]}
          rows={(statement?.payments ?? []).map((payment) => [
            new Date(payment.createdAt).toLocaleDateString("es-DO"),
            paymentMethodLabel(payment.method),
            payment.reference ?? "-",
            money.format(payment.amount)
          ])}
        />
      </div>
    </section>
  );
}

function BulkImportPanel({
  title,
  description,
  templateFileName,
  onDownloadTemplate,
  onImport,
  onRefresh
}: {
  title: string;
  description: string;
  templateFileName: string;
  onDownloadTemplate: () => Promise<Blob>;
  onImport: (file: File) => Promise<BulkImportResult>;
  onRefresh: () => Promise<void>;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  async function downloadTemplate() {
    setIsDownloading(true);
    try {
      const blob = await onDownloadTemplate();
      downloadBlob(blob, templateFileName);
    } finally {
      setIsDownloading(false);
    }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);
    setImportError(null);
    try {
      const result = await onImport(file);
      setImportResult(result);
      await onRefresh();
    } catch (caught) {
      setImportError(caught instanceof Error ? caught.message : "No se pudo importar el archivo.");
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  }

  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>{title}</strong>
        <span>Excel .xlsx</span>
      </div>
      <p className="form-hint">{description}</p>
      <div className="action-row">
        <button type="button" onClick={downloadTemplate} disabled={isDownloading || isImporting}>
          <Download size={16} />
          <span>{isDownloading ? "Descargando..." : "Plantilla"}</span>
        </button>
        <label className="btn-primary" style={{ cursor: isImporting ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Upload size={16} />
          <span>{isImporting ? "Importando..." : "Importar Excel"}</span>
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            style={{ display: "none" }}
            disabled={isImporting}
            onChange={importFile}
          />
        </label>
      </div>

      {importResult && (
        <div className={importResult.failed > 0 && importResult.created === 0 && importResult.updated === 0 ? "error-banner" : "success-banner"} style={{ marginTop: 10 }}>
          <strong>
            {importResult.created} creados, {importResult.updated} actualizados
            {importResult.failed > 0 ? `, ${importResult.failed} con error` : ""}
          </strong>
          {importResult.errors.length > 0 && (
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: "0.82rem" }}>
              {importResult.errors.slice(0, 5).map((err) => (
                <li key={err.rowNumber}>Fila {err.rowNumber}: {err.message}</li>
              ))}
              {importResult.errors.length > 5 && (
                <li>...y {importResult.errors.length - 5} errores mas</li>
              )}
            </ul>
          )}
        </div>
      )}

      {importError && (
        <div className="error-banner" style={{ marginTop: 10 }}>{importError}</div>
      )}
    </section>
  );
}

function CustomerQuickForm({
  session,
  customer,
  onCreate,
  onUpdate,
  onDelete
}: {
  session: AuthSession;
  customer?: CustomerSummary | null;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (customer: CustomerSummary, payload: unknown) => void;
  onDelete?: (customer: CustomerSummary) => void;
}) {
  const isEditing = Boolean(customer);
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [taxId, setTaxId] = useState(customer?.taxId ?? "");
  const [type, setType] = useState(customer?.type ?? 1);
  const [creditLimit, setCreditLimit] = useState(customer?.creditLimit ?? 0);

  useEffect(() => {
    setName(customer?.name ?? "");
    setPhone(customer?.phone ?? "");
    setEmail(customer?.email ?? "");
    setTaxId(customer?.taxId ?? "");
    setType(customer?.type ?? 1);
    setCreditLimit(customer?.creditLimit ?? 0);
  }, [customer?.id]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      tenantId: customer?.tenantId ?? session.tenantId,
      companyId: customer?.companyId ?? session.companyId,
      name,
      phone,
      email,
      taxId,
      type: isEditing ? type : creditLimit > 0 ? 2 : 1,
      creditLimit
    };

    if (customer && onUpdate) {
      onUpdate(customer, payload);
    } else {
      onCreate(() => api.createCustomer(payload));
      setName("");
      setPhone("");
      setEmail("");
      setTaxId("");
      setType(1);
      setCreditLimit(0);
    }
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar cliente" : "Alta rapida de cliente"}</strong>
        {customer && <span>{customer.name}</span>}
      </div>
      <div className="quick-form-fields">
        <FG label="Nombre completo" hint="Nombre del cliente o razon social.">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Juan Martinez o Empresa XYZ" required />
        </FG>
        <FG label="Telefono">
          <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Ej: 809-000-0000" />
        </FG>
        <FG label="Correo electronico">
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="cliente@correo.com" />
        </FG>
        <FG label="RNC o Cedula" hint="Requerido para facturacion fiscal.">
          <input value={taxId} onChange={(event) => setTaxId(event.target.value)} placeholder="Ej: 101-12345-6 o 001-1234567-8" />
        </FG>
        {isEditing && (
          <FG label="Tipo">
            <select value={type} onChange={(event) => setType(Number(event.target.value))}>
              <option value={1}>Contado</option>
              <option value={2}>Credito</option>
            </select>
          </FG>
        )}
        <FG label="Limite de credito" hint="Deja en 0 para cliente al contado.">
          <input type="number" value={creditLimit} onChange={(event) => setCreditLimit(Number(event.target.value))} placeholder="0.00" />
        </FG>
      </div>
      <div className="action-row">
        <button className="primary-button" type="submit">{isEditing ? "Guardar cambios" : "Crear cliente"}</button>
        {customer && onDelete && <button type="button" onClick={() => onDelete(customer)}>Desactivar</button>}
      </div>
    </form>
  );
}

function CustomerPaymentForm({
  disabled,
  maxAmount,
  onPayment
}: {
  disabled: boolean;
  maxAmount: number;
  onPayment: (amount: number, method: number, reference: string, notes: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState(1);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onPayment(amount, method, reference, notes);
      setAmount(0);
      setReference("");
      setNotes("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>Registrar abono</strong>
        <span>{money.format(maxAmount)}</span>
      </div>
      <div className="quick-form-fields">
        <FG label="Monto del abono" hint={`Maximo: ${money.format(maxAmount)}`}>
          <input disabled={disabled} max={maxAmount} min={0} type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} placeholder="0.00" required />
        </FG>
        <FG label="Metodo de pago">
          <select disabled={disabled} value={method} onChange={(event) => setMethod(Number(event.target.value))}>
            <option value={1}>Efectivo</option>
            <option value={2}>Tarjeta</option>
            <option value={4}>Transferencia</option>
          </select>
        </FG>
        <FG label="Referencia" hint="Numero de cheque, transferencia, etc.">
          <input disabled={disabled} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Ej: TRF-001234" />
        </FG>
        <FG label="Notas internas">
          <input disabled={disabled} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Observaciones opcionales" />
        </FG>
      </div>
      <button className="primary-button" disabled={disabled || isSubmitting || amount <= 0} type="submit">
        <Plus size={18} />
        <span>{isSubmitting ? "Aplicando..." : "Aplicar abono"}</span>
      </button>
    </form>
  );
}

function InventoryWorkspace({
  session,
  data,
  selectedProductId,
  onCreateCategory,
  onCreateProduct,
  onSelectProduct,
  onMovement
}: {
  session: AuthSession;
  data: AdminData;
  selectedProductId: string | null;
  onCreateCategory: (action: () => Promise<unknown>) => void;
  onCreateProduct: (action: () => Promise<unknown>) => void;
  onSelectProduct: (productId: string) => void;
  onMovement: (
    kind: "entry" | "exit" | "adjustment" | "transfer",
    payload: { productId: string; branchId: string; toBranchId?: string; quantity: number; unitCost: number; reference: string; notes: string }
  ) => Promise<void>;
}) {
  const selectedProduct = data.products.find((product) => product.id === selectedProductId) ?? data.products[0];
  const selectedStock = data.stock.filter((item) => item.productId === selectedProduct?.id);

  return (
    <section className="inventory-workspace">
      <div className="inventory-left">
        <FormTabs tabs={[
          {
            label: "Nueva categoria",
            content: <CategoryQuickForm session={session} onCreate={onCreateCategory} />
          },
          {
            label: "Nuevo producto",
            content: <ProductQuickForm session={session} categories={data.categories} branches={data.branches} onCreate={onCreateProduct} />
          },
          {
            label: `Catalogo (${data.products.length})`,
            content: (
              <section className="panel admin-panel">
                <div className="panel-title">
                  <strong>Catalogo de productos</strong>
                  <span>{data.products.length} productos</span>
                </div>
                <div className="product-admin-list">
                  {data.products.length === 0 ? (
                    <p className="empty-state">Sin productos registrados.<br /><small>Usa "Nuevo producto" para agregar uno.</small></p>
                  ) : data.products.map((product) => (
                    <button
                      className={product.id === selectedProduct?.id ? "product-admin-row product-admin-row-active" : "product-admin-row"}
                      key={product.id}
                      type="button"
                      onClick={() => onSelectProduct(product.id)}
                    >
                      <span>
                        <strong>{product.name}</strong>
                        <small>{product.categoryName || product.brand || "Sin categoria"}</small>
                      </span>
                      <span>
                        <strong>{money.format(product.price)}</strong>
                        <small>{productQuantity(product)} unidades</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )
          }
        ]} />
      </div>

      <div className="inventory-right">
        <section className="panel admin-panel">
          <div className="panel-title">
            <strong>{selectedProduct?.name ?? "Producto"}</strong>
            <span>{selectedProduct?.barcode ?? selectedProduct?.unit ?? "Inventario"}</span>
          </div>
          <div className="statement-kpis">
            <article>
              <span>Precio</span>
              <strong>{money.format(selectedProduct?.price ?? 0)}</strong>
            </article>
            <article>
              <span>Costo</span>
              <strong>{money.format(selectedProduct?.cost ?? 0)}</strong>
            </article>
            <article>
              <span>Existencia</span>
              <strong>{productQuantity(selectedProduct)}</strong>
            </article>
          </div>
        </section>

        <AdminTwoColumn>
          <InventoryMovementForm
            branches={data.branches}
            products={data.products}
            selectedProductId={selectedProduct?.id}
            onMovement={onMovement}
          />
          <DataTable
            title="Stock por sucursal"
            columns={["Sucursal", "Disponible", "Minimo", "Estado"]}
            rows={selectedStock.map((item) => [
              item.branchName,
              `${item.availableQuantity ?? item.quantityOnHand}`,
              `${item.minimumStock}`,
              item.isLowStock ? "Bajo minimo" : "OK"
            ])}
          />
        </AdminTwoColumn>

        <AdminTwoColumn>
          <DataTable
            title="Alertas de bajo stock"
            columns={["Producto", "Sucursal", "Disponible", "Minimo"]}
            rows={data.inventoryAlerts.map((item) => [
              item.productName,
              item.branchName,
              `${item.availableQuantity ?? item.quantityOnHand}`,
              `${item.minimumStock}`
            ])}
          />
          <DataTable
            title="Movimientos recientes"
            columns={["Fecha", "Tipo", "Cantidad", "Referencia"]}
            rows={data.inventoryMovements.map((movement) => [
              new Date(movement.createdAt).toLocaleDateString("es-DO"),
              inventoryMovementLabel(movement.type),
              `${movement.quantity}`,
              movement.reference ?? movement.branchName ?? "-"
            ])}
          />
        </AdminTwoColumn>

        <DataTable
          title="Kardex"
          columns={["Fecha", "Tipo", "Cantidad", "Balance"]}
          rows={data.kardex.map((entry) => [
            new Date(entry.createdAt).toLocaleDateString("es-DO"),
            inventoryMovementLabel(entry.type),
            `${entry.quantity}`,
            `${entry.balance}`
          ])}
        />
      </div>
    </section>
  );
}

function CategoryQuickForm({
  session,
  category,
  onCreate,
  onUpdate,
  onDelete
}: {
  session: AuthSession;
  category?: CategorySummary | null;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (category: CategorySummary, payload: unknown) => void;
  onDelete?: (category: CategorySummary) => void;
}) {
  const isEditing = Boolean(category);
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");

  useEffect(() => {
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
  }, [category?.id]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      tenantId: category?.tenantId ?? session.tenantId,
      companyId: category?.companyId ?? session.companyId,
      name,
      description
    };

    if (category && onUpdate) {
      onUpdate(category, payload);
    } else {
      onCreate(() => api.createCategory(payload));
      setName("");
      setDescription("");
    }
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar categoria" : "Nueva categoria"}</strong>
        {category && <span>{category.productCount} productos</span>}
      </div>
      <div className="quick-form-fields">
        <FG label="Nombre de la categoria">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Bebidas, Lacteos, Electronicos" required />
        </FG>
        <FG label="Descripcion">
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripcion opcional de la categoria" />
        </FG>
      </div>
      <div className="action-row">
        <button className="primary-button" type="submit">{isEditing ? "Guardar cambios" : "Crear categoria"}</button>
        {category && onDelete && (
          <button disabled={category.productCount > 0} type="button" onClick={() => onDelete(category)}>
            Desactivar
          </button>
        )}
      </div>
      {category && category.productCount > 0 && (
        <small className="form-hint">Solo se puede desactivar una categoria sin productos asociados.</small>
      )}
    </form>
  );
}

function CategoryList({
  categories,
  selectedCategoryId,
  onCreateNew,
  onSelect
}: {
  categories: CategorySummary[];
  selectedCategoryId: string | null;
  onCreateNew: () => void;
  onSelect: (categoryId: string) => void;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Categorias</strong>
        <button type="button" onClick={onCreateNew}>Nueva</button>
      </div>
      <div className="product-admin-list">
        {categories.length === 0 ? (
          <p className="empty-state">Sin categorias registradas.</p>
        ) : categories.map((category) => (
          <button
            className={category.id === selectedCategoryId ? "product-admin-row product-admin-row-active" : "product-admin-row"}
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
          >
            <span>
              <strong>{category.name}</strong>
              <small>{category.description || "Sin descripcion"}</small>
            </span>
            <span>
              <strong>{category.productCount}</strong>
              <small>productos</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ProductQuickForm({
  session,
  product,
  categories,
  branches,
  onCreate,
  onUpdate,
  onDelete
}: {
  session: AuthSession;
  product?: ProductSummary | null;
  categories: CategorySummary[];
  branches: Branch[];
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (action: () => Promise<unknown>) => void;
  onDelete?: (product: ProductSummary) => void;
}) {
  const isEditing = Boolean(product);
  const currentStock = product?.totalQuantityOnHand ?? product?.quantityOnHand ?? 0;
  const defaultCategoryId = product?.categoryId ?? categories[0]?.id ?? "";
  const defaultBranchId = branches[0]?.id ?? "";

  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [name, setName] = useState(product?.name ?? "");
  const [barcode, setBarcode] = useState(product?.barcode ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [unit, setUnit] = useState(product?.unit ?? "Unidad");
  const [cost, setCost] = useState(product?.cost ?? 0);
  const [price, setPrice] = useState(product?.price ?? 0);
  const [taxRate, setTaxRate] = useState(product?.taxRate ?? 0.18);
  const [minimumStock, setMinimumStock] = useState(product?.minimumStock ?? 0);
  const [stockValue, setStockValue] = useState(currentStock);
  const [branchId, setBranchId] = useState(defaultBranchId);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [imageUrl, setImageUrl] = useState<string | null>(product?.imageUrl ?? null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    const stock = product?.totalQuantityOnHand ?? product?.quantityOnHand ?? 0;
    setCategoryId(product?.categoryId ?? categories[0]?.id ?? "");
    setName(product?.name ?? "");
    setBarcode(product?.barcode ?? "");
    setBrand(product?.brand ?? "");
    setUnit(product?.unit ?? "Unidad");
    setCost(product?.cost ?? 0);
    setPrice(product?.price ?? 0);
    setTaxRate(product?.taxRate ?? 0.18);
    setMinimumStock(product?.minimumStock ?? 0);
    setStockValue(product ? stock : 0);
    setIsActive(product?.isActive ?? true);
    setImageUrl(product?.imageUrl ?? null);
    setImageError(null);
  }, [product?.id, categories]);

  useEffect(() => {
    if (!branchId && branches[0]?.id) setBranchId(branches[0].id);
  }, [branches, branchId]);

  function resetCreateFields() {
    setCategoryId(categories[0]?.id ?? "");
    setName("");
    setBarcode("");
    setBrand("");
    setUnit("Unidad");
    setCost(0);
    setPrice(0);
    setTaxRate(0.18);
    setMinimumStock(0);
    setStockValue(0);
    setIsActive(true);
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !product?.id) return;
    setUploadingImage(true);
    setImageError(null);
    try {
      const result = await api.uploadProductImage(product.id, file);
      setImageUrl(result.imageUrl);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!categoryId) return;
    const payload = {
      tenantId: product?.tenantId ?? session.tenantId,
      companyId: product?.companyId ?? session.companyId,
      categoryId,
      name,
      barcode,
      brand,
      unit,
      cost,
      price,
      wholesalePrice: price,
      taxRate,
      minimumStock,
      imageUrl: imageUrl ?? null,
      isActive
    };

    if (product && onUpdate) {
      const stockDelta = stockValue - currentStock;
      onUpdate(async () => {
        await api.updateProduct(product.id, payload);
        if (stockDelta !== 0 && branchId) {
          await api.registerInventoryAdjustment({
            tenantId: session.tenantId,
            companyId: session.companyId,
            branchId,
            productId: product.id,
            quantityDelta: stockDelta,
            unitCost: cost,
            reference: "Ajuste desde edicion de producto",
            notes: null
          });
        }
      });
      return;
    }

    onCreate(async () => {
      const createdProduct = await api.createProduct({
        ...payload,
        isActive: true
      }) as { id: string };
      if (stockValue > 0 && branchId) {
        await api.registerInventoryEntry({
          tenantId: session.tenantId,
          companyId: session.companyId,
          branchId,
          productId: createdProduct.id,
          quantity: stockValue,
          unitCost: cost,
          reference: "Stock inicial",
          notes: null
        });
      }
    });
    resetCreateFields();
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? `Editar: ${product?.name}` : "Nuevo producto"}</strong>
        {!isEditing && <Plus size={18} />}
      </div>
      <div className="quick-form-fields">
        {isEditing && (
          <FG label="Imagen del producto">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={name}
                  style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }}
                />
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.35rem 0.75rem", borderRadius: 6, fontSize: 13,
                    background: uploadingImage ? "#e5e7eb" : "#f3f4f6",
                    border: "1px solid #d1d5db", cursor: uploadingImage ? "not-allowed" : "pointer",
                    color: "#374151", fontWeight: 500
                  }}
                >
                  {uploadingImage ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
                  {uploadingImage ? "Subiendo..." : imageUrl ? "Cambiar imagen" : "Subir imagen"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: "none" }}
                    disabled={uploadingImage}
                    onChange={handleImageUpload}
                  />
                </label>
                {imageError && <span style={{ fontSize: 12, color: "#dc2626" }}>{imageError}</span>}
                {imageUrl && !uploadingImage && (
                  <button
                    type="button"
                    style={{ fontSize: 12, color: "#6b7280", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                    onClick={() => setImageUrl(null)}
                  >
                    Quitar imagen
                  </button>
                )}
              </div>
            </div>
          </FG>
        )}
        <FG label="Categoria">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            {categories.length === 0
              ? <option value="">Crea una categoria primero</option>
              : categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FG>
        <FG label="Nombre del producto">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Leche entera 1L" required />
        </FG>
        <FG label="Codigo de barras">
          <input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Escanea o escribe el codigo" />
        </FG>
        <FG label="Marca">
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ej: Nestle, Samsung" />
        </FG>
        <FG label="Unidad de medida">
          <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Ej: Unidad, Caja, Kg" required />
        </FG>
        <FG label="Costo de compra" hint="Precio al que compras el producto.">
          <input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(Number(e.target.value))} placeholder="0.00" />
        </FG>
        <FG label="Precio de venta" hint="Precio al que vendes al cliente.">
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="0.00" required />
        </FG>
        <FG label="ITBIS" hint="Impuesto sobre el producto.">
          <select value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))}>
            <option value={0.18}>18% - Gravado</option>
            <option value={0}>0% - Exento</option>
          </select>
        </FG>
        <FG label="Stock minimo" hint="Alerta cuando el stock baje de este numero.">
          <input type="number" min="0" value={minimumStock} onChange={(e) => setMinimumStock(Number(e.target.value))} placeholder="0" />
        </FG>
        <FG
          label={isEditing ? "Stock actual" : "Stock inicial"}
          hint={isEditing ? `Cambia el valor para ajustar el inventario (actual: ${currentStock})` : "Cantidad disponible al crear el producto."}
        >
          <input type="number" min="0" value={stockValue} onChange={(e) => setStockValue(Number(e.target.value))} placeholder="0" />
        </FG>
        {((!isEditing && stockValue > 0) || (isEditing && stockValue !== currentStock)) && (
          <FG label={isEditing ? "Sucursal para el ajuste" : "Sucursal para stock inicial"}>
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)} required>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </FG>
        )}
        {isEditing && (
          <FG label="Estado">
            <select value={isActive ? "1" : "0"} onChange={(e) => setIsActive(e.target.value === "1")}>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </FG>
        )}
      </div>
      <div className="action-row">
        <button className="primary-button" disabled={!categoryId} type="submit">
          {isEditing ? "Guardar cambios" : "Crear producto"}
        </button>
        {product && onDelete && <button type="button" onClick={() => onDelete(product)}>Desactivar</button>}
      </div>
    </form>
  );
}
function InventoryMovementForm({
  branches,
  products,
  selectedProductId,
  onMovement
}: {
  branches: Branch[];
  products: ProductSummary[];
  selectedProductId?: string;
  onMovement: (
    kind: "entry" | "exit" | "adjustment" | "transfer",
    payload: { productId: string; branchId: string; toBranchId?: string; quantity: number; unitCost: number; reference: string; notes: string }
  ) => Promise<void>;
}) {
  const [kind, setKind] = useState<"entry" | "exit" | "adjustment" | "transfer">("entry");
  const [productId, setProductId] = useState(selectedProductId ?? "");
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [toBranchId, setToBranchId] = useState(branches[1]?.id ?? branches[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedProductId) {
      setProductId(selectedProductId);
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (!branchId && branches[0]?.id) {
      setBranchId(branches[0].id);
    }
    if ((!toBranchId || toBranchId === branchId) && branches.length > 1) {
      setToBranchId(branches.find((branch) => branch.id !== branchId)?.id ?? branches[0].id);
    }
  }, [branches, branchId, toBranchId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!productId || !branchId || (kind === "transfer" && (!toBranchId || toBranchId === branchId))) return;
    setIsSubmitting(true);
    try {
      await onMovement(kind, { productId, branchId, toBranchId, quantity, unitCost, reference, notes });
      setQuantity(1);
      setReference("");
      setNotes("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>Movimiento de inventario</strong>
        <span>{products.length} productos</span>
      </div>
      <div className="quick-form-fields">
        <FG label="Tipo de movimiento">
          <select value={kind} onChange={(event) => setKind(event.target.value as "entry" | "exit" | "adjustment" | "transfer")}>
            <option value="entry">Entrada (recepcion de mercancia)</option>
            <option value="exit">Salida (consumo o baja)</option>
            <option value="adjustment">Ajuste de inventario</option>
            <option value="transfer">Transferencia entre sucursales</option>
          </select>
        </FG>
        <FG label="Producto">
          <select value={productId} onChange={(event) => setProductId(event.target.value)} required>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </FG>
        <FG label={kind === "transfer" ? "Sucursal origen" : "Sucursal"}>
          <select value={branchId} onChange={(event) => setBranchId(event.target.value)} required>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </FG>
        {kind === "transfer" && (
          <FG label="Sucursal destino" hint={branches.length < 2 ? "Crea otra sucursal para poder transferir." : undefined}>
            <select value={toBranchId} onChange={(event) => setToBranchId(event.target.value)} required>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </FG>
        )}
        <FG label="Cantidad" hint={kind === "adjustment" ? "Usa numero negativo para reducir stock." : undefined}>
          <input
            min={kind === "adjustment" ? undefined : 0.01}
            step="0.01"
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            placeholder={kind === "adjustment" ? "Ej: 5 o -3" : "Ej: 10"}
            required
          />
        </FG>
        <FG label="Costo unitario" hint="Costo de compra por unidad.">
          <input step="0.01" type="number" value={unitCost} onChange={(event) => setUnitCost(Number(event.target.value))} placeholder="0.00" />
        </FG>
        <FG label="Referencia">
          <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Ej: OC-0012, Factura #456" />
        </FG>
        <FG label="Notas internas">
          <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Observaciones del movimiento" />
        </FG>
      </div>
      <button
        className="primary-button"
        disabled={isSubmitting || !productId || !branchId || quantity === 0 || (kind === "transfer" && (!toBranchId || toBranchId === branchId))}
        type="submit"
      >
        <Plus size={18} />
        <span>{isSubmitting ? "Registrando..." : kind === "transfer" ? "Registrar transferencia" : "Registrar movimiento"}</span>
      </button>
    </form>
  );
}

function PurchasesWorkspace({
  session,
  data,
  selectedSupplierId,
  onCreateSupplier,
  onCreatePurchase,
  onCreateExpenseCategory,
  onCreateExpense,
  onSelectSupplier,
  onSupplierPayment,
  onIssuePurchase,
  onCancelPurchase,
  onReceivePurchase,
  onApproveExpense,
  onCancelExpense,
  onPayExpense
}: {
  session: AuthSession;
  data: AdminData;
  selectedSupplierId: string | null;
  onCreateSupplier: (action: () => Promise<unknown>) => void;
  onCreatePurchase: (action: () => Promise<unknown>) => void;
  onCreateExpenseCategory: (action: () => Promise<unknown>) => void;
  onCreateExpense: (action: () => Promise<unknown>) => void;
  onSelectSupplier: (supplierId: string) => void;
  onSupplierPayment: (amount: number, method: number, reference: string, notes: string) => Promise<void>;
  onIssuePurchase: (purchaseId: string) => Promise<void>;
  onCancelPurchase: (purchaseId: string) => Promise<void>;
  onReceivePurchase: (purchaseId: string) => Promise<void>;
  onApproveExpense: (expenseId: string) => Promise<void>;
  onCancelExpense: (expenseId: string) => Promise<void>;
  onPayExpense: (expenseId: string) => Promise<void>;
}) {
  const selectedSupplier = data.suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? data.suppliers[0];
  const statement = data.supplierStatement;
  const supplierPayables = statement?.payables ?? data.payables.filter((payable) => payable.supplierId === selectedSupplier?.id);

  return (
    <section className="purchases-workspace">
      <div className="purchases-left">
        <FormTabs tabs={[
          {
            label: "Nuevo suplidor",
            content: <SupplierQuickForm session={session} onCreate={onCreateSupplier} />
          },
          {
            label: "Nueva compra",
            content: (
              <PurchaseQuickForm
                session={session}
                branches={data.branches}
                suppliers={data.suppliers}
                products={data.products}
                selectedSupplierId={selectedSupplier?.id}
                onCreate={onCreatePurchase}
              />
            )
          },
          {
            label: `Suplidores (${data.suppliers.length})`,
            content: (
              <section className="panel admin-panel">
                <div className="panel-title">
                  <strong>Suplidores</strong>
                  <span>{data.suppliers.length} registros</span>
                </div>
                <div className="supplier-list">
                  {data.suppliers.length === 0 ? (
                    <p className="empty-state">Sin suplidores registrados.<br /><small>Usa "Nuevo suplidor" para agregar uno.</small></p>
                  ) : data.suppliers.map((supplier) => (
                    <button
                      className={supplier.id === selectedSupplier?.id ? "supplier-row supplier-row-active" : "supplier-row"}
                      key={supplier.id}
                      type="button"
                      onClick={() => onSelectSupplier(supplier.id)}
                    >
                      <span>
                        <strong>{supplier.name}</strong>
                        <small>{supplier.contactName || supplier.phone || "Sin contacto"}</small>
                      </span>
                      <span>
                        <strong>{money.format(supplier.balance ?? 0)}</strong>
                        <small>{supplier.paymentTermsDays ?? 0} dias</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )
          }
        ]} />
      </div>

      <div className="purchases-right">
        <section className="panel admin-panel">
          <div className="panel-title">
            <strong>{selectedSupplier?.name ?? "Estado de suplidor"}</strong>
            <span>CxP</span>
          </div>
          <div className="statement-kpis">
            <article>
              <span>Limite</span>
              <strong>{money.format(statement?.creditLimit ?? selectedSupplier?.creditLimit ?? 0)}</strong>
            </article>
            <article>
              <span>Balance</span>
              <strong>{money.format(statement?.balance ?? selectedSupplier?.balance ?? 0)}</strong>
            </article>
            <article>
              <span>Disponible</span>
              <strong>{money.format(statement?.availableCredit ?? 0)}</strong>
            </article>
          </div>
        </section>

        <AdminTwoColumn>
          <DataTable
            title="Cuentas por pagar"
            columns={["Documento", "Vence", "Estado", "Balance"]}
            rows={supplierPayables.map((payable) => [
              payable.documentNumber,
              new Date(payable.dueAt).toLocaleDateString("es-DO"),
              payable.isOverdue ? "Vencido" : statusLabel("payable", payable.status),
              money.format(payable.balance)
            ])}
          />
          <SupplierPaymentForm
            disabled={!selectedSupplier || (statement?.balance ?? selectedSupplier?.balance ?? 0) <= 0}
            maxAmount={statement?.balance ?? selectedSupplier?.balance ?? 0}
            onPayment={onSupplierPayment}
          />
        </AdminTwoColumn>

        <PurchaseActionTable
          purchases={data.purchases}
          selectedPurchaseId={data.purchaseDetail?.purchase.id ?? null}
          onCancel={onCancelPurchase}
          onIssue={onIssuePurchase}
          onPrint={() => Promise.resolve()}
          onReceive={onReceivePurchase}
          onSelect={() => Promise.resolve()}
        />

        <AdminTwoColumn>
          <div className="stacked-forms">
            <ExpenseCategoryQuickForm session={session} onCreate={onCreateExpenseCategory} />
            <ExpenseQuickForm
              session={session}
              branches={data.branches}
              categories={data.expenseCategories}
              onCreate={onCreateExpense}
            />
          </div>
          <ExpenseActionTable expenses={data.expenses} onApprove={onApproveExpense} onCancel={onCancelExpense} onPay={onPayExpense} />
        </AdminTwoColumn>

        <DataTable
          title="Pagos a suplidores"
          columns={["Fecha", "Metodo", "Referencia", "Monto"]}
          rows={(statement?.payments ?? []).map((payment) => [
            new Date(payment.createdAt).toLocaleDateString("es-DO"),
            paymentMethodLabel(payment.method),
            payment.reference ?? "-",
            money.format(payment.amount)
          ])}
        />
      </div>
    </section>
  );
}

function SupplierQuickForm({
  session,
  supplier,
  onCreate,
  onUpdate,
  onDelete
}: {
  session: AuthSession;
  supplier?: SupplierSummary | null;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (supplier: SupplierSummary, payload: unknown) => void;
  onDelete?: (supplier: SupplierSummary) => void;
}) {
  const isEditing = Boolean(supplier);
  const [name, setName] = useState(supplier?.name ?? "");
  const [taxId, setTaxId] = useState(supplier?.taxId ?? "");
  const [contactName, setContactName] = useState(supplier?.contactName ?? "");
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [email, setEmail] = useState(supplier?.email ?? "");
  const [address, setAddress] = useState(supplier?.address ?? "");
  const [paymentTermsDays, setPaymentTermsDays] = useState(supplier?.paymentTermsDays ?? 15);
  const [creditLimit, setCreditLimit] = useState(supplier?.creditLimit ?? 0);

  useEffect(() => {
    setName(supplier?.name ?? "");
    setTaxId(supplier?.taxId ?? "");
    setContactName(supplier?.contactName ?? "");
    setPhone(supplier?.phone ?? "");
    setEmail(supplier?.email ?? "");
    setAddress(supplier?.address ?? "");
    setPaymentTermsDays(supplier?.paymentTermsDays ?? 15);
    setCreditLimit(supplier?.creditLimit ?? 0);
  }, [supplier?.id]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      tenantId: supplier?.tenantId ?? session.tenantId,
      companyId: supplier?.companyId ?? session.companyId,
      name,
      taxId,
      contactName,
      phone,
      email,
      address,
      paymentTermsDays,
      creditLimit,
      isActive: true
    };

    if (supplier && onUpdate) {
      onUpdate(supplier, payload);
    } else {
      onCreate(() => api.createSupplier(payload));
      setName("");
      setTaxId("");
      setContactName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setPaymentTermsDays(15);
      setCreditLimit(0);
    }
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar suplidor" : "Nuevo suplidor"}</strong>
        {supplier && <span>{supplier.name}</span>}
      </div>
      <div className="quick-form-fields">
        <FG label="Nombre">
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </FG>
        <FG label="RNC">
          <input value={taxId} onChange={(event) => setTaxId(event.target.value)} />
        </FG>
        <FG label="Contacto">
          <input value={contactName} onChange={(event) => setContactName(event.target.value)} />
        </FG>
        <FG label="Telefono">
          <input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </FG>
        <FG label="Correo">
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </FG>
        <FG label="Direccion">
          <input value={address} onChange={(event) => setAddress(event.target.value)} />
        </FG>
        <FG label="Plazo de credito">
          <input min={0} type="number" value={paymentTermsDays} onChange={(event) => setPaymentTermsDays(Number(event.target.value))} />
        </FG>
        <FG label="Limite de credito">
          <input min={0} step="0.01" type="number" value={creditLimit} onChange={(event) => setCreditLimit(Number(event.target.value))} />
        </FG>
      </div>
      <div className="action-row">
        <button className="primary-button" type="submit">{isEditing ? "Guardar cambios" : "Crear suplidor"}</button>
        {supplier && onDelete && <button type="button" onClick={() => onDelete(supplier)}>Desactivar</button>}
      </div>
    </form>
  );
}

type PurchaseFormLine = {
  key: string;
  productId: string;
  quantity: number;
  unitCost: number;
  taxRate: number;
  discount: number;
};

function newPurchaseFormLine(productId = "", seed = Date.now()): PurchaseFormLine {
  return {
    key: `purchase-line-${seed}-${Math.random().toString(36).slice(2)}`,
    productId,
    quantity: 1,
    unitCost: 0,
    taxRate: 0.18,
    discount: 0
  };
}

function PurchaseQuickForm({
  session,
  purchaseDetail,
  branches,
  suppliers,
  products,
  selectedSupplierId,
  onCreate,
  onUpdate
}: {
  session: AuthSession;
  purchaseDetail?: PurchaseDetail | null;
  branches: Branch[];
  suppliers: SupplierSummary[];
  products: ProductSummary[];
  selectedSupplierId?: string;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (purchase: PurchaseSummary, payload: unknown) => void;
}) {
  const purchase = purchaseDetail?.purchase ?? null;
  const isEditing = Boolean(purchase);
  const canEdit = !purchase || purchase.status === 1;
  const [supplierId, setSupplierId] = useState(selectedSupplierId ?? "");
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [expectedAt, setExpectedAt] = useState("");
  const [supplierReference, setSupplierReference] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<PurchaseFormLine[]>([newPurchaseFormLine(products[0]?.id ?? "")]);

  useEffect(() => {
    if (!purchase) {
      setSupplierId(selectedSupplierId ?? suppliers[0]?.id ?? "");
      setBranchId(branches[0]?.id ?? "");
      setExpectedAt("");
      setSupplierReference("");
      setNotes("");
      setLines([newPurchaseFormLine(products[0]?.id ?? "")]);
      return;
    }

    setSupplierId(purchase.supplierId ?? "");
    setBranchId(purchase.branchId ?? "");
    setExpectedAt(toDateInputValue(purchase.expectedAt));
    setSupplierReference(purchase.supplierReference ?? "");
    setNotes(purchase.notes ?? "");
    setLines(purchaseDetail?.lines.length
      ? purchaseDetail.lines.map((line, index) => ({
        key: `purchase-line-${purchase.id}-${index}`,
        productId: line.productId,
        quantity: line.quantity,
        unitCost: line.unitCost,
        taxRate: line.taxRate,
        discount: line.discount
      }))
      : [newPurchaseFormLine(products[0]?.id ?? "")]);
  }, [purchase?.id, purchaseDetail?.lines, selectedSupplierId, branches, suppliers, products]);

  useEffect(() => {
    if (!purchase && selectedSupplierId) setSupplierId(selectedSupplierId);
  }, [purchase, selectedSupplierId]);

  useEffect(() => {
    if (!branchId && branches[0]?.id) setBranchId(branches[0].id);
    if (!supplierId && suppliers[0]?.id) setSupplierId(suppliers[0].id);
    if (lines.some((line) => !line.productId) && products[0]?.id) {
      setLines((current) => current.map((line) => line.productId ? line : { ...line, productId: products[0].id }));
    }
  }, [branches, branchId, lines, products, supplierId, suppliers]);

  const totals = lines.reduce((acc, line) => {
    const net = Math.max(0, (line.unitCost * line.quantity) - line.discount);
    const tax = net * line.taxRate;
    return {
      subtotal: acc.subtotal + net,
      taxTotal: acc.taxTotal + tax,
      discountTotal: acc.discountTotal + line.discount,
      grandTotal: acc.grandTotal + net + tax
    };
  }, { subtotal: 0, taxTotal: 0, discountTotal: 0, grandTotal: 0 });

  function updateLine(key: string, patch: Partial<PurchaseFormLine>) {
    setLines((current) => current.map((line) => line.key === key ? { ...line, ...patch } : line));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!supplierId || !branchId || lines.length === 0 || lines.some((line) => !line.productId)) return;

    const payload = {
      tenantId: purchase?.tenantId ?? session.tenantId,
      companyId: purchase?.companyId ?? session.companyId,
      branchId,
      supplierId,
      userId: session.userId,
      notes: notes || null,
      expectedAt: expectedAt || null,
      supplierReference: supplierReference || null,
      lines: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        unitCost: line.unitCost,
        taxRate: line.taxRate,
        discount: line.discount
      }))
    };

    if (purchase && onUpdate) {
      onUpdate(purchase, payload);
      return;
    }

    onCreate(() => api.createPurchase(payload));
    setExpectedAt("");
    setSupplierReference("");
    setNotes("");
    setLines([newPurchaseFormLine(products[0]?.id ?? "")]);
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar orden de compra" : "Nueva compra"}</strong>
        {purchase ? <span>{statusLabel("purchase", purchase.status)}</span> : <Plus size={18} />}
      </div>
      <div className="quick-form-fields">
        <FG label="Suplidor">
          <select disabled={!canEdit} value={supplierId} onChange={(event) => setSupplierId(event.target.value)} required>
            {suppliers.length === 0 ? <option value="">Crea un suplidor primero</option> : suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
        </FG>
        <FG label="Sucursal destino">
          <select disabled={!canEdit} value={branchId} onChange={(event) => setBranchId(event.target.value)} required>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
        </FG>
        <FG label="Esperada">
          <input disabled={!canEdit} type="date" value={expectedAt} onChange={(event) => setExpectedAt(event.target.value)} />
        </FG>
        <FG label="Referencia suplidor">
          <input disabled={!canEdit} value={supplierReference} onChange={(event) => setSupplierReference(event.target.value)} placeholder="Factura, cotizacion o referencia" />
        </FG>
        <FG label="Notas">
          <input disabled={!canEdit} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Observaciones de la compra" />
        </FG>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table action-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Costo</th>
              <th>ITBIS %</th>
              <th>Desc.</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const net = Math.max(0, (line.unitCost * line.quantity) - line.discount);
              return (
                <tr key={line.key}>
                  <td>
                    <select disabled={!canEdit} value={line.productId} onChange={(event) => updateLine(line.key, { productId: event.target.value })} required>
                      {products.length === 0 ? <option value="">Crea un producto primero</option> : products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </td>
                  <td><input disabled={!canEdit} min={0.01} step="0.01" type="number" value={line.quantity} onChange={(event) => updateLine(line.key, { quantity: Number(event.target.value) })} required /></td>
                  <td><input disabled={!canEdit} min={0} step="0.01" type="number" value={line.unitCost} onChange={(event) => updateLine(line.key, { unitCost: Number(event.target.value) })} required /></td>
                  <td><input disabled={!canEdit} min={0} max={100} step="0.01" type="number" value={line.taxRate * 100} onChange={(event) => updateLine(line.key, { taxRate: Number(event.target.value) / 100 })} /></td>
                  <td><input disabled={!canEdit} min={0} step="0.01" type="number" value={line.discount} onChange={(event) => updateLine(line.key, { discount: Number(event.target.value) })} /></td>
                  <td>{money.format(net + (net * line.taxRate))}</td>
                  <td>
                    {canEdit && lines.length > 1 && (
                      <button type="button" onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}>Quitar</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="statement-kpis">
        <article><span>Subtotal</span><strong>{money.format(totals.subtotal)}</strong></article>
        <article><span>ITBIS</span><strong>{money.format(totals.taxTotal)}</strong></article>
        <article><span>Total</span><strong>{money.format(totals.grandTotal)}</strong></article>
      </div>

      <div className="action-row">
        {canEdit && (
          <button type="button" onClick={() => setLines((current) => [...current, newPurchaseFormLine(products[0]?.id ?? "")])}>
            Agregar linea
          </button>
        )}
        <button className="primary-button" disabled={!canEdit || !supplierId || !branchId || products.length === 0} type="submit">
          <Plus size={18} />
          <span>{isEditing ? "Guardar cambios" : "Crear orden de compra"}</span>
        </button>
      </div>
    </form>
  );
}

function PurchaseReturnQuickForm({
  session,
  purchases,
  returnDetail,
  onCreate,
  onUpdate
}: {
  session: AuthSession;
  purchases: PurchaseSummary[];
  returnDetail?: PurchaseReturnDetail | null;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (purchaseReturn: PurchaseReturnSummary, payload: unknown) => void;
}) {
  const purchaseReturn = returnDetail?.return ?? null;
  const isEditing = Boolean(purchaseReturn);
  const canEdit = !purchaseReturn || purchaseReturn.status === 1;
  const receivedPurchases = purchases.filter((purchase) => purchase.status === 3);
  const [purchaseId, setPurchaseId] = useState(purchaseReturn?.purchaseId ?? receivedPurchases[0]?.id ?? "");
  const [reason, setReason] = useState(purchaseReturn?.reason ?? "");
  const [supplierCreditNote, setSupplierCreditNote] = useState(purchaseReturn?.supplierCreditNote ?? "");
  const [purchaseDetail, setPurchaseDetail] = useState<PurchaseDetail | null>(null);
  const [lineQuantities, setLineQuantities] = useState<Record<string, number>>(
    () => Object.fromEntries((returnDetail?.lines ?? []).map((line) => [line.productId, line.quantity]))
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (!purchaseReturn) {
      if (!purchaseId && receivedPurchases[0]?.id) setPurchaseId(receivedPurchases[0].id);
      return;
    }

    setPurchaseId(purchaseReturn.purchaseId);
    setReason(purchaseReturn.reason ?? "");
    setSupplierCreditNote(purchaseReturn.supplierCreditNote ?? "");
    setLineQuantities(Object.fromEntries((returnDetail?.lines ?? []).map((line) => [line.productId, line.quantity])));
  }, [purchaseId, purchaseReturn?.id, purchaseReturn, receivedPurchases, returnDetail?.lines]);

  useEffect(() => {
    if (!purchaseId) {
      setPurchaseDetail(null);
      return;
    }

    let cancelled = false;
    setIsLoadingDetail(true);
    api.getPurchase(purchaseId)
      .then((detail) => {
        if (!cancelled) {
          setPurchaseDetail(detail);
          setLineQuantities(purchaseReturn
            ? Object.fromEntries((returnDetail?.lines ?? []).map((line) => [line.productId, line.quantity]))
            : {});
        }
      })
      .catch(() => {
        if (!cancelled) setPurchaseDetail(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [purchaseId, purchaseReturn, returnDetail?.lines]);

  const selectedLines = purchaseDetail?.lines.filter((line) => (lineQuantities[line.productId] ?? 0) > 0) ?? [];
  const estimatedTotal = selectedLines.reduce((sum, line) => {
    const quantity = lineQuantities[line.productId] ?? 0;
    return sum + quantity * line.unitCost * (1 + line.taxRate) - line.discount;
  }, 0);

  function setQuantity(productId: string, quantity: number) {
    setLineQuantities((current) => ({ ...current, [productId]: quantity }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const lines = selectedLines.map((line) => ({
      productId: line.productId,
      quantity: lineQuantities[line.productId]
    }));

    if (!purchaseId || lines.length === 0) return;

    const payload = {
      purchaseId,
      userId: session.userId,
      reason: reason || null,
      supplierCreditNote: supplierCreditNote || null,
      lines
    };

    if (purchaseReturn && onUpdate) {
      onUpdate(purchaseReturn, payload);
      return;
    }

    onCreate(() => api.createPurchaseReturn(payload));

    setReason("");
    setSupplierCreditNote("");
    setLineQuantities({});
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar devolucion" : "Nueva devolucion"}</strong>
        <span>{purchaseReturn ? statusLabel("purchaseReturn", purchaseReturn.status) : money.format(estimatedTotal)}</span>
      </div>
      <div className="quick-form-fields">
        <FG label="Compra recibida">
          <select disabled={!canEdit} value={purchaseId} onChange={(event) => setPurchaseId(event.target.value)} required>
            {receivedPurchases.length === 0 ? (
              <option value="">No hay compras recibidas</option>
            ) : receivedPurchases.map((purchase) => (
              <option key={purchase.id} value={purchase.id}>
                {purchase.number} - {purchase.supplierName ?? "Suplidor"} - {money.format(purchase.grandTotal)}
              </option>
            ))}
          </select>
        </FG>
        <FG label="Motivo">
          <input disabled={!canEdit} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ej: Producto danado, error de despacho" />
        </FG>
        <FG label="Nota de credito suplidor">
          <input disabled={!canEdit} value={supplierCreditNote} onChange={(event) => setSupplierCreditNote(event.target.value)} placeholder="Numero de documento del suplidor" />
        </FG>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table action-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Comprado</th>
              <th>Costo</th>
              <th>Devolver</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingDetail && (
              <tr><td colSpan={4}>Cargando lineas...</td></tr>
            )}
            {!isLoadingDetail && purchaseDetail?.lines.length === 0 && (
              <tr><td colSpan={4}>La compra no tiene lineas.</td></tr>
            )}
            {!isLoadingDetail && purchaseDetail?.lines.map((line) => (
              <tr key={line.productId}>
                <td>{line.productName}</td>
                <td>{line.quantity}</td>
                <td>{money.format(line.unitCost)}</td>
                <td>
                  <input
                    max={line.quantity}
                    min={0}
                    step="0.01"
                    type="number"
                    disabled={!canEdit}
                    value={lineQuantities[line.productId] ?? 0}
                    onChange={(event) => setQuantity(line.productId, Number(event.target.value))}
                  />
                </td>
              </tr>
            ))}
            {!isLoadingDetail && !purchaseDetail && (
              <tr><td colSpan={4}>Selecciona una compra recibida.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <button className="primary-button" disabled={!canEdit || !purchaseId || selectedLines.length === 0} type="submit">
        <Plus size={18} />
        <span>{isEditing ? "Guardar cambios" : "Crear devolucion"}</span>
      </button>
    </form>
  );
}

function SupplierPaymentForm({
  disabled,
  maxAmount,
  onPayment
}: {
  disabled: boolean;
  maxAmount: number;
  onPayment: (amount: number, method: number, reference: string, notes: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState(4);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onPayment(amount, method, reference, notes);
      setAmount(0);
      setReference("");
      setNotes("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>Pagar suplidor</strong>
        <span>{money.format(maxAmount)}</span>
      </div>
      <div className="quick-form-fields">
        <FG label="Monto a pagar" hint={`Balance pendiente: ${money.format(maxAmount)}`}>
          <input disabled={disabled} max={maxAmount} min={0} type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} placeholder="0.00" required />
        </FG>
        <FG label="Forma de pago">
          <select disabled={disabled} value={method} onChange={(event) => setMethod(Number(event.target.value))}>
            <option value={1}>Efectivo</option>
            <option value={2}>Tarjeta</option>
            <option value={4}>Transferencia bancaria</option>
          </select>
        </FG>
        <FG label="Referencia" hint="Numero de cheque o confirmacion.">
          <input disabled={disabled} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Ej: CHQ-00123" />
        </FG>
        <FG label="Notas">
          <input disabled={disabled} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Observaciones del pago" />
        </FG>
      </div>
      <button className="primary-button" disabled={disabled || isSubmitting || amount <= 0} type="submit">
        <Plus size={18} />
        <span>{isSubmitting ? "Aplicando..." : "Aplicar pago"}</span>
      </button>
    </form>
  );
}

function ExpenseCategoryQuickForm({
  session,
  category,
  onCreate,
  onUpdate,
  onDelete
}: {
  session: AuthSession;
  category?: ExpenseCategorySummary | null;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (category: ExpenseCategorySummary, payload: unknown) => void;
  onDelete?: (category: ExpenseCategorySummary) => void;
}) {
  const isEditing = Boolean(category);
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  useEffect(() => {
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
    setIsActive(category?.isActive ?? true);
  }, [category?.id]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      tenantId: category?.tenantId ?? session.tenantId,
      companyId: category?.companyId ?? session.companyId,
      name,
      description,
      isActive
    };

    if (category && onUpdate) {
      onUpdate(category, payload);
      return;
    }

    onCreate(() => api.createExpenseCategory({ ...payload, isActive: true }));
    setName("");
    setDescription("");
    setIsActive(true);
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar categoria" : "Categoria de gasto"}</strong>
        {category ? <span>{category.isActive ? "Activa" : "Inactiva"}</span> : <Plus size={18} />}
      </div>
      <div className="quick-form-fields">
      <FG label="Nombre de la categoria">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Servicios, Nomina, Alquiler" required />
      </FG>
      <FG label="Descripcion">
        <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripcion opcional" />
      </FG>
      {isEditing && (
        <label className="check-row">
          <input checked={isActive} onChange={(event) => setIsActive(event.target.checked)} type="checkbox" />
          <span>Categoria activa</span>
        </label>
      )}
      </div>
      <div className="action-row">
        <button className="primary-button" type="submit">{isEditing ? "Guardar cambios" : "Crear categoria"}</button>
        {category && onDelete && <button type="button" onClick={() => onDelete(category)}>Desactivar</button>}
      </div>
    </form>
  );
}

function ExpenseCategoryList({
  categories,
  selectedCategoryId,
  onCreateNew,
  onSelect
}: {
  categories: ExpenseCategorySummary[];
  selectedCategoryId: string | null;
  onCreateNew: () => void;
  onSelect: (categoryId: string) => void;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Categorias de gasto</strong>
        <button type="button" onClick={onCreateNew}>Nueva</button>
      </div>
      <div className="supplier-list">
        {categories.length === 0 ? (
          <p className="empty-state">Sin categorias registradas.</p>
        ) : categories.map((category) => (
          <button
            className={category.id === selectedCategoryId ? "supplier-row supplier-row-active" : "supplier-row"}
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
          >
            <span>
              <strong>{category.name}</strong>
              <small>{category.description || "Sin descripcion"}</small>
            </span>
            <span>
              <strong>{category.isActive ? "Activa" : "Inactiva"}</strong>
              <small>Categoria</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ExpenseQuickForm({
  session,
  expense,
  branches,
  categories,
  onCreate,
  onUpdate,
  onCancel
}: {
  session: AuthSession;
  expense?: ExpenseSummary | null;
  branches: Branch[];
  categories: ExpenseCategorySummary[];
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (expense: ExpenseSummary, payload: unknown) => void;
  onCancel?: (expense: ExpenseSummary) => void;
}) {
  const isEditing = Boolean(expense);
  const canEdit = !expense || expense.status === 1;
  const [branchId, setBranchId] = useState(expense?.branchId ?? branches[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(expense?.expenseCategoryId ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [vendorName, setVendorName] = useState(expense?.vendorName ?? "");
  const [documentNumber, setDocumentNumber] = useState(expense?.documentNumber ?? "");
  const [expenseDate, setExpenseDate] = useState(toDateInputValue(expense?.expenseDate));
  const [dueAt, setDueAt] = useState(toDateInputValue(expense?.dueAt));
  const [amount, setAmount] = useState(expense?.amount ?? 0);
  const [taxAmount, setTaxAmount] = useState(expense?.taxAmount ?? 0);
  const [notes, setNotes] = useState(expense?.notes ?? "");

  useEffect(() => {
    setBranchId(expense?.branchId ?? branches[0]?.id ?? "");
    setCategoryId(expense?.expenseCategoryId ?? categories[0]?.id ?? "");
    setDescription(expense?.description ?? "");
    setVendorName(expense?.vendorName ?? "");
    setDocumentNumber(expense?.documentNumber ?? "");
    setExpenseDate(toDateInputValue(expense?.expenseDate));
    setDueAt(toDateInputValue(expense?.dueAt));
    setAmount(expense?.amount ?? 0);
    setTaxAmount(expense?.taxAmount ?? 0);
    setNotes(expense?.notes ?? "");
  }, [expense?.id, branches, categories]);

  useEffect(() => {
    if (!branchId && branches[0]?.id) setBranchId(branches[0].id);
    if (!categoryId && categories[0]?.id) setCategoryId(categories[0].id);
  }, [branches, branchId, categories, categoryId]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!branchId || !categoryId) return;
    const payload = {
      tenantId: expense?.tenantId ?? session.tenantId,
      companyId: expense?.companyId ?? session.companyId,
      branchId,
      userId: expense?.userId ?? session.userId,
      expenseCategoryId: categoryId,
      description,
      vendorName: vendorName || null,
      documentNumber: documentNumber || null,
      expenseDate: expenseDate || null,
      dueAt: dueAt || null,
      amount,
      taxAmount,
      notes: notes || null
    };

    if (expense && onUpdate) {
      onUpdate(expense, payload);
      return;
    }

    onCreate(() => api.createExpense(payload));
    setDescription("");
    setVendorName("");
    setDocumentNumber("");
    setExpenseDate("");
    setDueAt("");
    setAmount(0);
    setTaxAmount(0);
    setNotes("");
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar gasto" : "Nuevo gasto"}</strong>
        {expense ? <span>{statusLabel("expense", expense.status)}</span> : <Plus size={18} />}
      </div>
      <div className="quick-form-fields">
        <FG label="Sucursal">
          <select disabled={!canEdit} value={branchId} onChange={(event) => setBranchId(event.target.value)} required>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
        </FG>
        <FG label="Categoria del gasto">
          <select disabled={!canEdit} value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
            {categories.length === 0 ? <option value="">Crea una categoria primero</option> : categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </FG>
        <FG label="Descripcion del gasto">
          <input disabled={!canEdit} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ej: Pago de electricidad enero" required />
        </FG>
        <FG label="Proveedor o comercio">
          <input disabled={!canEdit} value={vendorName} onChange={(event) => setVendorName(event.target.value)} placeholder="Ej: EDENORTE, Claro RD" />
        </FG>
        <FG label="Documento">
          <input disabled={!canEdit} value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} placeholder="Factura, comprobante o referencia" />
        </FG>
        <FG label="Fecha del gasto">
          <input disabled={!canEdit} type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} />
        </FG>
        <FG label="Vence">
          <input disabled={!canEdit} type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
        </FG>
        <FG label="Monto" hint="Total del comprobante sin impuesto.">
          <input disabled={!canEdit} min={0} step="0.01" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} placeholder="0.00" required />
        </FG>
        <FG label="Impuesto (ITBIS)">
          <input disabled={!canEdit} min={0} step="0.01" type="number" value={taxAmount} onChange={(event) => setTaxAmount(Number(event.target.value))} placeholder="0.00" />
        </FG>
        <FG label="Notas">
          <input disabled={!canEdit} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Observaciones internas" />
        </FG>
      </div>
      <div className="action-row">
        <button className="primary-button" disabled={!canEdit || !branchId || !categoryId} type="submit">
          {isEditing ? "Guardar cambios" : "Registrar gasto"}
        </button>
        {expense && expense.status === 1 && onCancel && <button type="button" onClick={() => onCancel(expense)}>Cancelar gasto</button>}
      </div>
    </form>
  );
}

function PurchaseReturnWorkspace({
  purchaseReturns,
  detail,
  selectedReturnId,
  onSelect,
  onCreateNew,
  onConfirm,
  onCancel
}: {
  purchaseReturns: PurchaseReturnSummary[];
  detail: PurchaseReturnDetail | null;
  selectedReturnId: string | null;
  onSelect: (returnId: string) => Promise<void>;
  onCreateNew?: () => void;
  onConfirm: (returnId: string) => Promise<void>;
  onCancel: (returnId: string) => Promise<void>;
}) {
  const selectedReturn = detail?.return ?? purchaseReturns.find((item) => item.id === selectedReturnId) ?? null;

  return (
    <AdminTwoColumn>
      <section className="panel admin-panel">
        <div className="panel-title">
          <strong>Devoluciones</strong>
          {onCreateNew ? <button type="button" onClick={onCreateNew}>Nueva</button> : <span>{purchaseReturns.length} registros</span>}
        </div>
        {purchaseReturns.length === 0 ? (
          <p className="empty-state">Sin devoluciones registradas.</p>
        ) : (
          <div className="supplier-list">
            {purchaseReturns.map((purchaseReturn) => (
              <button
                className={purchaseReturn.id === selectedReturnId ? "supplier-row supplier-row-active" : "supplier-row"}
                key={purchaseReturn.id}
                type="button"
                onClick={() => onSelect(purchaseReturn.id)}
              >
                <span>
                  <strong>{purchaseReturn.number}</strong>
                  <small>{purchaseReturn.supplierName ?? "Suplidor"}</small>
                </span>
                <span>
                  <strong>{money.format(purchaseReturn.total)}</strong>
                  <small>{statusLabel("purchaseReturn", purchaseReturn.status)}</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel admin-panel">
        <div className="panel-title">
          <strong>{selectedReturn?.number ?? "Detalle de devolucion"}</strong>
          <span>{selectedReturn ? statusLabel("purchaseReturn", selectedReturn.status) : "-"}</span>
        </div>

        {!selectedReturn ? (
          <p className="empty-state">Selecciona una devolucion para ver sus lineas.</p>
        ) : (
          <>
            <div className="statement-kpis">
              <article><span>Subtotal</span><strong>{money.format(selectedReturn.subtotal)}</strong></article>
              <article><span>ITBIS</span><strong>{money.format(selectedReturn.taxTotal)}</strong></article>
              <article><span>Total</span><strong>{money.format(selectedReturn.total)}</strong></article>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table action-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Costo</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail?.lines ?? []).map((line) => (
                    <tr key={line.purchaseLineId}>
                      <td>{line.productName}</td>
                      <td>{line.quantity}</td>
                      <td>{money.format(line.unitCost)}</td>
                      <td>{money.format(line.lineTotal)}</td>
                    </tr>
                  ))}
                  {detail && detail.lines.length === 0 && (
                    <tr><td colSpan={4}>Sin lineas para mostrar.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {(selectedReturn.reason || selectedReturn.supplierCreditNote) && (
              <div className="empty-state">
                {selectedReturn.reason && <span>Motivo: {selectedReturn.reason}</span>}
                {selectedReturn.supplierCreditNote && <span>Nota suplidor: {selectedReturn.supplierCreditNote}</span>}
              </div>
            )}

            {selectedReturn.status === 1 && (
              <div className="action-row">
                <button className="primary-button" type="button" onClick={() => onConfirm(selectedReturn.id)}>
                  Confirmar devolucion
                </button>
                <button type="button" onClick={() => onCancel(selectedReturn.id)}>
                  Cancelar
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </AdminTwoColumn>
  );
}

function PurchaseActionTable({
  purchases,
  selectedPurchaseId,
  onCancel,
  onCreateNew,
  onIssue,
  onPrint,
  onReceive,
  onSelect
}: {
  purchases: PurchaseSummary[];
  selectedPurchaseId?: string | null;
  onCancel: (purchaseId: string) => Promise<void>;
  onCreateNew?: () => void;
  onIssue: (purchaseId: string) => Promise<void>;
  onPrint: (purchaseId: string) => Promise<void>;
  onReceive: (purchaseId: string) => Promise<void>;
  onSelect: (purchaseId: string) => void | Promise<void>;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Ordenes de compra</strong>
        {onCreateNew ? <button type="button" onClick={onCreateNew}>Nueva</button> : <span>{purchases.length} registros</span>}
      </div>
      {purchases.length === 0 ? (
        <p className="empty-state">Sin compras para mostrar.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table action-table">
            <thead>
              <tr>
                <th>Numero</th>
                <th>Suplidor</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr
                  className={purchase.id === selectedPurchaseId ? "admin-table-row-active" : undefined}
                  key={purchase.id}
                  onClick={() => onSelect(purchase.id)}
                >
                  <td>{purchase.number}</td>
                  <td>{purchase.supplierName ?? "-"}</td>
                  <td>{statusLabel("purchase", purchase.status)}</td>
                  <td>{money.format(purchase.grandTotal)}</td>
                  <td>
                    {purchase.status === 1 && (
                      <div className="inline-actions">
                        <button type="button" onClick={(event) => { event.stopPropagation(); onIssue(purchase.id); }}>Emitir</button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); onCancel(purchase.id); }}>Cancelar</button>
                      </div>
                    )}
                    {purchase.status === 2 && (
                      <div className="inline-actions">
                        <button type="button" onClick={(event) => { event.stopPropagation(); onReceive(purchase.id); }}>Recibir</button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); onCancel(purchase.id); }}>Cancelar</button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); onPrint(purchase.id); }}>Imprimir</button>
                      </div>
                    )}
                    {purchase.status > 2 && (
                      <div className="inline-actions">
                        <span>{purchase.receivedAt ? new Date(purchase.receivedAt).toLocaleDateString("es-DO") : "-"}</span>
                        {purchase.status !== 4 && <button type="button" onClick={(event) => { event.stopPropagation(); onPrint(purchase.id); }}>Imprimir</button>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PurchaseDetailPanel({
  detail,
  onPrint
}: {
  detail: PurchaseDetail | null;
  onPrint: (purchaseId: string) => Promise<void>;
}) {
  const purchase = detail?.purchase;

  return (
    <section className="panel admin-panel purchase-detail-panel">
      <div className="panel-title">
        <strong>{purchase ? `Detalle ${purchase.number}` : "Detalle de orden"}</strong>
        <span>{purchase ? statusLabel("purchase", purchase.status) : "Selecciona una orden"}</span>
      </div>

      {!purchase ? (
        <p className="empty-state">Selecciona una orden de compra para ver sus productos.</p>
      ) : (
        <>
          <div className="statement-kpis">
            <article><span>Suplidor</span><strong>{purchase.supplierName ?? "-"}</strong></article>
            <article><span>Fecha</span><strong>{purchase.orderedAt ? new Date(purchase.orderedAt).toLocaleDateString("es-DO") : "-"}</strong></article>
            <article><span>Total</span><strong>{money.format(purchase.grandTotal)}</strong></article>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table action-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Costo</th>
                  <th>ITBIS</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detail.lines.map((line) => (
                  <tr key={line.productId}>
                    <td>{line.productName}</td>
                    <td>{line.quantity}</td>
                    <td>{money.format(line.unitCost)}</td>
                    <td>{Math.round(line.taxRate * 100)}%</td>
                    <td>{money.format(line.lineTotal)}</td>
                  </tr>
                ))}
                {detail.lines.length === 0 && (
                  <tr><td colSpan={5}>Sin lineas para mostrar.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="action-row purchase-detail-actions">
            {purchase.status !== 4 && (
              <button className="primary-button" type="button" onClick={() => onPrint(purchase.id)}>
                Imprimir orden
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function printPurchaseOrderDocument(document: PurchaseOrderDocument, companyName: string) {
  const win = window.open("", "_blank", "width=820,height=900,toolbar=no,menubar=no");
  if (!win) return;
  win.document.write(buildPurchaseOrderHtml(document, companyName));
  win.document.close();
  win.focus();
  win.print();
}

function buildPurchaseOrderHtml(document: PurchaseOrderDocument, companyName: string): string {
  const purchase = document.purchase;
  const lines = document.lines.map((line) => `
    <tr>
      <td>${escapePrintHtml(line.productName)}</td>
      <td class="num">${formatQuantity(line.quantity)}</td>
      <td class="num">${money.format(line.unitCost)}</td>
      <td class="num">${Math.round(line.taxRate * 100)}%</td>
      <td class="num">${money.format(line.discount)}</td>
      <td class="num">${money.format(line.lineTotal)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Orden ${escapePrintHtml(purchase.number)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      color: #111827;
      font-family: Arial, Helvetica, sans-serif;
      background: #fff;
    }
    .document { max-width: 860px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 3px solid #111827;
      padding-bottom: 18px;
      margin-bottom: 22px;
    }
    .brand h1 { margin: 0 0 6px; font-size: 24px; letter-spacing: 0; }
    .brand p, .meta p, .supplier p { margin: 2px 0; color: #4b5563; font-size: 13px; }
    .badge {
      display: inline-block;
      padding: 6px 10px;
      border: 1px solid #111827;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 22px; margin-bottom: 20px; }
    .box { border: 1px solid #d1d5db; padding: 14px; }
    .box h2 { margin: 0 0 10px; font-size: 13px; text-transform: uppercase; color: #374151; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th { text-align: left; border-bottom: 2px solid #111827; padding: 9px 8px; font-size: 11px; text-transform: uppercase; }
    td { border-bottom: 1px solid #e5e7eb; padding: 9px 8px; vertical-align: top; }
    .num { text-align: right; white-space: nowrap; }
    .totals { width: 320px; margin-left: auto; margin-top: 18px; }
    .row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #e5e7eb; }
    .row.total { font-size: 18px; font-weight: 700; border-bottom: 2px solid #111827; }
    .notes { margin-top: 28px; min-height: 62px; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 58px; }
    .signature { border-top: 1px solid #111827; padding-top: 8px; text-align: center; font-size: 12px; }
    @media print {
      body { padding: 18mm; }
      @page { size: letter; margin: 0; }
    }
  </style>
</head>
<body>
  <main class="document">
    <section class="header">
      <div class="brand">
        <h1>${escapePrintHtml(companyName)}</h1>
        <p>${escapePrintHtml(document.branchName)}${document.branchCode ? ` (${escapePrintHtml(document.branchCode)})` : ""}</p>
        <p>Orden de compra para recepcion de mercancia</p>
      </div>
      <div class="meta">
        <span class="badge">${escapePrintHtml(statusLabel("purchase", purchase.status))}</span>
        <p><strong>Orden:</strong> ${escapePrintHtml(purchase.number)}</p>
        <p><strong>Fecha:</strong> ${formatPurchaseDate(purchase.orderedAt)}</p>
        <p><strong>Esperada:</strong> ${purchase.expectedAt ? formatPurchaseDate(purchase.expectedAt) : "-"}</p>
      </div>
    </section>

    <section class="grid">
      <div class="box supplier">
        <h2>Suplidor</h2>
        <p><strong>${escapePrintHtml(document.supplierName)}</strong></p>
        <p>RNC/ID: ${escapePrintHtml(document.supplierTaxId ?? "-")}</p>
        <p>Telefono: ${escapePrintHtml(document.supplierPhone ?? "-")}</p>
        <p>Email: ${escapePrintHtml(document.supplierEmail ?? "-")}</p>
      </div>
      <div class="box">
        <h2>Resumen</h2>
        <div class="row"><span>Subtotal</span><strong>${money.format(purchase.subtotal ?? 0)}</strong></div>
        <div class="row"><span>ITBIS</span><strong>${money.format(purchase.taxTotal ?? 0)}</strong></div>
        <div class="row"><span>Descuento</span><strong>${money.format(purchase.discountTotal ?? 0)}</strong></div>
      </div>
    </section>

    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th class="num">Cantidad</th>
          <th class="num">Costo</th>
          <th class="num">ITBIS</th>
          <th class="num">Desc.</th>
          <th class="num">Total</th>
        </tr>
      </thead>
      <tbody>${lines || `<tr><td colspan="6">Sin lineas para mostrar.</td></tr>`}</tbody>
    </table>

    <section class="totals">
      <div class="row total"><span>Total</span><span>${money.format(purchase.grandTotal)}</span></div>
    </section>

    <section class="box notes">
      <h2>Notas</h2>
      <p>${escapePrintHtml(document.notes ?? "-")}</p>
    </section>

    <section class="signatures">
      <div class="signature">Preparado por</div>
      <div class="signature">Recibido / Autorizado</div>
    </section>
  </main>
</body>
</html>`;
}

function escapePrintHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPurchaseDate(value?: string) {
  return value ? new Date(value).toLocaleDateString("es-DO") : "-";
}

function toDateInputValue(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("es-DO", { maximumFractionDigits: 2 }).format(value);
}

function ExpenseActionTable({
  expenses,
  selectedExpenseId,
  onApprove,
  onCancel,
  onCreateNew,
  onSelect,
  onPay
}: {
  expenses: ExpenseSummary[];
  selectedExpenseId?: string | null;
  onApprove: (expenseId: string) => Promise<void>;
  onCancel: (expenseId: string) => Promise<void>;
  onCreateNew?: () => void;
  onSelect?: (expenseId: string) => void | Promise<void>;
  onPay: (expenseId: string) => Promise<void>;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Gastos</strong>
        {onCreateNew ? <button type="button" onClick={onCreateNew}>Nuevo</button> : <span>{expenses.length} registros</span>}
      </div>
      {expenses.length === 0 ? (
        <p className="empty-state">Sin gastos para mostrar.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table action-table">
            <thead>
              <tr>
                <th>Numero</th>
                <th>Descripcion</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr
                  className={expense.id === selectedExpenseId ? "admin-table-row-active" : undefined}
                  key={expense.id}
                  onClick={() => onSelect?.(expense.id)}
                >
                  <td>{expense.number}</td>
                  <td>{expense.description}</td>
                  <td>{statusLabel("expense", expense.status)}</td>
                  <td>{money.format(expense.totalAmount)}</td>
                  <td>
                    {expense.status === 1 && (
                      <div className="inline-actions">
                        <button type="button" onClick={(event) => { event.stopPropagation(); onApprove(expense.id); }}>Aprobar</button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); onCancel(expense.id); }}>Cancelar</button>
                      </div>
                    )}
                    {expense.status === 2 && <button type="button" onClick={(event) => { event.stopPropagation(); onPay(expense.id); }}>Pagar</button>}
                    {expense.status > 2 && <span>{expense.paymentMethod ? paymentMethodLabel(expense.paymentMethod) : "-"}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ExpenseDetailPanel({ expense }: { expense: ExpenseSummary | null }) {
  return (
    <section className="panel admin-panel expense-detail-panel">
      <div className="panel-title">
        <strong>{expense ? `Detalle ${expense.number}` : "Detalle del gasto"}</strong>
        <span>{expense ? statusLabel("expense", expense.status) : "Selecciona un gasto"}</span>
      </div>

      {!expense ? (
        <p className="empty-state">Selecciona un gasto para ver sus datos completos.</p>
      ) : (
        <>
          <div className="statement-kpis">
            <article><span>Categoria</span><strong>{expense.categoryName}</strong></article>
            <article><span>Documento</span><strong>{expense.documentNumber ?? "-"}</strong></article>
            <article><span>Total</span><strong>{money.format(expense.totalAmount)}</strong></article>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table action-table">
              <tbody>
                <tr><td>Descripcion</td><td>{expense.description}</td></tr>
                <tr><td>Proveedor</td><td>{expense.vendorName ?? "-"}</td></tr>
                <tr><td>Fecha</td><td>{expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString("es-DO") : "-"}</td></tr>
                <tr><td>Vence</td><td>{expense.dueAt ? new Date(expense.dueAt).toLocaleDateString("es-DO") : "-"}</td></tr>
                <tr><td>Monto</td><td>{money.format(expense.amount)}</td></tr>
                <tr><td>ITBIS</td><td>{money.format(expense.taxAmount)}</td></tr>
                <tr><td>Metodo de pago</td><td>{expense.paymentMethod ? paymentMethodLabel(expense.paymentMethod) : "-"}</td></tr>
                <tr><td>Referencia</td><td>{expense.reference ?? "-"}</td></tr>
                <tr><td>Notas</td><td>{expense.notes ?? "-"}</td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function FinanceWorkspace({
  session,
  data,
  selectedAccountId,
  onCreateAccount,
  onCreateJournalEntry,
  onSelectAccount,
  onPostJournalEntry,
  onVoidJournalEntry
}: {
  session: AuthSession;
  data: AdminData;
  selectedAccountId: string | null;
  onCreateAccount: (action: () => Promise<unknown>) => void;
  onCreateJournalEntry: (action: () => Promise<unknown>) => void;
  onSelectAccount: (accountId: string) => void;
  onPostJournalEntry: (entryId: string) => Promise<void>;
  onVoidJournalEntry: (entryId: string) => Promise<void>;
}) {
  const selectedAccount = data.accounts.find((account) => account.id === selectedAccountId) ?? data.accounts[0];
  const trialLines = data.trialBalance?.lines ?? [];

  return (
    <section className="finance-workspace">
      <div className="finance-left">
        <FormTabs tabs={[
          {
            label: "Nueva cuenta",
            content: <AccountQuickForm session={session} accounts={data.accounts} onCreate={onCreateAccount} />
          },
          {
            label: "Nuevo asiento",
            content: <JournalQuickForm session={session} accounts={data.accounts} onCreate={onCreateJournalEntry} />
          },
          {
            label: `Plan de cuentas (${data.accounts.length})`,
            content: (
              <section className="panel admin-panel">
                <div className="panel-title">
                  <strong>Plan de cuentas</strong>
                  <span>{data.accounts.length} cuentas</span>
                </div>
                <div className="account-list">
                  {data.accounts.length === 0 ? (
                    <p className="empty-state">Sin cuentas registradas.</p>
                  ) : data.accounts.map((account) => (
                    <button
                      className={account.id === selectedAccount?.id ? "account-row account-row-active" : "account-row"}
                      key={account.id}
                      type="button"
                      onClick={() => onSelectAccount(account.id)}
                    >
                      <span>
                        <strong>{account.code} - {account.name}</strong>
                        <small>{accountTypeLabel(account.type)}</small>
                      </span>
                      <span>
                        <strong>{account.isActive ? "Activa" : "Inactiva"}</strong>
                        <small>{account.isCashAccount ? "Caja/Banco" : "General"}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )
          }
        ]} />
      </div>

      <div className="finance-right">
        <section className="panel admin-panel">
          <div className="panel-title">
            <strong>Balance de comprobacion</strong>
            <span>{trialLines.length} lineas</span>
          </div>
          <div className="statement-kpis">
            <article>
              <span>Debito</span>
              <strong>{money.format(data.trialBalance?.totalDebit ?? 0)}</strong>
            </article>
            <article>
              <span>Credito</span>
              <strong>{money.format(data.trialBalance?.totalCredit ?? 0)}</strong>
            </article>
            <article>
              <span>Diferencia</span>
              <strong>{money.format(data.trialBalance?.difference ?? 0)}</strong>
            </article>
          </div>
        </section>

        <JournalActionTable entries={data.journalEntries} onPost={onPostJournalEntry} onVoid={onVoidJournalEntry} />

        <AdminTwoColumn>
          <DataTable
            title="Balance por cuenta"
            columns={["Cuenta", "Debito", "Credito", "Balance"]}
            rows={trialLines.map((line) => [
              `${line.accountCode} - ${line.accountName}`,
              money.format(line.debit),
              money.format(line.credit),
              money.format(line.balance)
            ])}
          />
          <DataTable
            title={data.generalLedger ? `Mayor ${data.generalLedger.accountCode}` : "Mayor general"}
            columns={["Fecha", "Asiento", "Debito", "Balance"]}
            rows={(data.generalLedger?.lines ?? []).map((line) => [
              new Date(line.entryDate).toLocaleDateString("es-DO"),
              line.number,
              money.format(line.debit - line.credit),
              money.format(line.runningBalance)
            ])}
          />
        </AdminTwoColumn>
      </div>
    </section>
  );
}

function BankAccountForm({
  session,
  account,
  accounts,
  onCreate,
  onUpdate
}: {
  session: AuthSession;
  account?: BankAccountSummary | null;
  accounts: AccountSummary[];
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate: (account: BankAccountSummary, payload: unknown) => void;
}) {
  const [bankName, setBankName] = useState(account?.bankName ?? "");
  const [accountName, setAccountName] = useState(account?.accountName ?? "");
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber ?? "");
  const [currency, setCurrency] = useState(account?.currency ?? "DOP");
  const [accountingAccountId, setAccountingAccountId] = useState(account?.accountingAccountId ?? "");
  const [openingBalance, setOpeningBalance] = useState(account?.openingBalance ?? 0);
  const [isActive, setIsActive] = useState(account?.isActive ?? true);

  useEffect(() => {
    setBankName(account?.bankName ?? "");
    setAccountName(account?.accountName ?? "");
    setAccountNumber(account?.accountNumber ?? "");
    setCurrency(account?.currency ?? "DOP");
    setAccountingAccountId(account?.accountingAccountId ?? "");
    setOpeningBalance(account?.openingBalance ?? 0);
    setIsActive(account?.isActive ?? true);
  }, [account?.id]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      tenantId: account?.tenantId ?? session.tenantId,
      companyId: account?.companyId ?? session.companyId,
      bankName,
      accountName,
      accountNumber,
      currency,
      accountingAccountId: accountingAccountId || null,
      openingBalance,
      openingBalanceDate: account?.openingBalanceDate ?? new Date().toISOString(),
      isActive
    };

    if (account) {
      onUpdate(account, payload);
      return;
    }

    onCreate(() => api.createBankAccount(payload));
    setBankName("");
    setAccountName("");
    setAccountNumber("");
    setCurrency("DOP");
    setAccountingAccountId("");
    setOpeningBalance(0);
    setIsActive(true);
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{account ? "Editar banco" : "Nueva cuenta bancaria"}</strong>
        {account ? <span>{account.bankName}</span> : <Plus size={18} />}
      </div>
      <div className="quick-form-fields">
        <FG label="Banco"><input value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="Banco Popular" required /></FG>
        <FG label="Alias de cuenta"><input value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Cuenta operativa" required /></FG>
        <FG label="Numero de cuenta"><input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} required /></FG>
        <FG label="Moneda"><input value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} maxLength={8} /></FG>
        <FG label="Cuenta contable">
          <select value={accountingAccountId} onChange={(event) => setAccountingAccountId(event.target.value)}>
            <option value="">Sin asociar</option>
            {accounts.filter((item) => item.type === 1 && item.isActive).map((item) => (
              <option key={item.id} value={item.id}>{item.code} - {item.name}</option>
            ))}
          </select>
        </FG>
        <FG label="Balance inicial"><input type="number" value={openingBalance} onChange={(event) => setOpeningBalance(Number(event.target.value))} /></FG>
        {account && (
          <label className="check-row">
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            <span>Cuenta activa</span>
          </label>
        )}
      </div>
      <button className="primary-button" type="submit">{account ? "Guardar banco" : "Crear banco"}</button>
    </form>
  );
}

function BankTransactionForm({
  session,
  bankAccount,
  onCreate
}: {
  session: AuthSession;
  bankAccount?: BankAccountSummary | null;
  onCreate: (action: () => Promise<unknown>) => void;
}) {
  const [transactionDate, setTransactionDate] = useState(todayInputValue());
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState(0);
  const [balanceAfter, setBalanceAfter] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!bankAccount) return;

    const payload = {
      tenantId: session.tenantId,
      companyId: session.companyId,
      bankAccountId: bankAccount.id,
      transactionDate: `${transactionDate}T12:00:00.000Z`,
      description,
      reference: reference || null,
      amount,
      balanceAfter: balanceAfter ? Number(balanceAfter) : null,
      notes: "Importado manualmente"
    };

    onCreate(() => api.importBankTransaction(payload));
    setDescription("");
    setReference("");
    setAmount(0);
    setBalanceAfter("");
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>Importar movimiento</strong>
        <span>{bankAccount?.currency ?? "DOP"}</span>
      </div>
      {!bankAccount ? (
        <p className="empty-state">Crea o selecciona una cuenta bancaria primero.</p>
      ) : (
        <div className="quick-form-fields">
          <FG label="Fecha"><input type="date" value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} required /></FG>
          <FG label="Descripcion"><input value={description} onChange={(event) => setDescription(event.target.value)} required /></FG>
          <FG label="Referencia"><input value={reference} onChange={(event) => setReference(event.target.value)} /></FG>
          <FG label="Monto" hint="Positivo deposito, negativo retiro"><input type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} required /></FG>
          <FG label="Balance posterior"><input type="number" value={balanceAfter} onChange={(event) => setBalanceAfter(event.target.value)} /></FG>
          <button className="primary-button" type="submit">Importar movimiento</button>
        </div>
      )}
    </form>
  );
}

function BankAccountList({
  accounts,
  selectedAccountId,
  onCreateNew,
  onSelect
}: {
  accounts: BankAccountSummary[];
  selectedAccountId: string | null;
  onCreateNew: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Cuentas bancarias</strong>
        <button type="button" onClick={onCreateNew}>Nueva</button>
      </div>
      <div className="account-list">
        {accounts.length === 0 ? (
          <p className="empty-state">Sin cuentas bancarias.</p>
        ) : accounts.map((account) => (
          <button
            key={account.id}
            type="button"
            className={account.id === selectedAccountId ? "account-row account-row-active" : "account-row"}
            onClick={() => onSelect(account.id)}
          >
            <span>
              <strong>{account.bankName} - {account.accountName}</strong>
              <small>{account.accountNumber} · {account.currency}</small>
            </span>
            <span>
              <strong>{money.format(account.currentBalance)}</strong>
              <small>{account.importedTransactions} por conciliar</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function BankTransactionTable({
  transactions,
  journalEntries,
  onIgnore,
  onReconcile
}: {
  transactions: BankTransactionSummary[];
  journalEntries: JournalEntrySummary[];
  onIgnore: (transaction: BankTransactionSummary) => void;
  onReconcile: (transaction: BankTransactionSummary, journalEntryId: string) => void;
}) {
  const postedEntries = journalEntries.filter((entry) => entry.status === 2);

  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Movimientos bancarios</strong>
        <span>{transactions.length} registros</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Fecha</th><th>Descripcion</th><th>Monto</th><th>Estado</th><th>Conciliacion</th></tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan={5}>Sin movimientos.</td></tr>
            ) : transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.transactionDate).toLocaleDateString("es-DO")}</td>
                <td>
                  <strong>{transaction.description}</strong>
                  <small>{transaction.reference ?? transaction.bankAccountName}</small>
                </td>
                <td className={transaction.amount < 0 ? "text-danger" : "text-success"}>{money.format(transaction.amount)}</td>
                <td>{bankTransactionStatusLabel(transaction.status)}</td>
                <td>
                  {transaction.status === 1 ? (
                    <div className="inline-actions">
                      <select defaultValue="" onChange={(event) => event.target.value && onReconcile(transaction, event.target.value)}>
                        <option value="">Conciliar con asiento</option>
                        {postedEntries.map((entry) => (
                          <option key={entry.id} value={entry.id}>{entry.number} · {money.format(entry.totalDebit)}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => onIgnore(transaction)}>Ignorar</button>
                    </div>
                  ) : transaction.matchedJournalEntryId ? "Conciliado" : "Ignorado"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AccountQuickForm({
  session,
  account,
  accounts,
  onCreate,
  onUpdate,
  onDelete
}: {
  session: AuthSession;
  account?: AccountSummary | null;
  accounts: AccountSummary[];
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (account: AccountSummary, payload: unknown) => void;
  onDelete?: (account: AccountSummary) => void;
}) {
  const isEditing = Boolean(account);
  const [code, setCode] = useState(account?.code ?? "");
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState(account?.type ?? 1);
  const [parentAccountId, setParentAccountId] = useState(account?.parentAccountId ?? "");
  const [isCashAccount, setIsCashAccount] = useState(account?.isCashAccount ?? false);
  const [isActive, setIsActive] = useState(account?.isActive ?? true);

  useEffect(() => {
    setCode(account?.code ?? "");
    setName(account?.name ?? "");
    setType(account?.type ?? 1);
    setParentAccountId(account?.parentAccountId ?? "");
    setIsCashAccount(account?.isCashAccount ?? false);
    setIsActive(account?.isActive ?? true);
  }, [account?.id]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      tenantId: account?.tenantId ?? session.tenantId,
      companyId: account?.companyId ?? session.companyId,
      code,
      name,
      type,
      parentAccountId: parentAccountId || null,
      isCashAccount,
      isActive
    };

    if (account && onUpdate) {
      onUpdate(account, payload);
      return;
    }

    onCreate(() => api.createAccount({ ...payload, isActive: true }));
    setCode("");
    setName("");
    setParentAccountId("");
    setIsCashAccount(false);
    setIsActive(true);
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar cuenta" : "Nueva cuenta"}</strong>
        {account ? <span>{account.code}</span> : <Plus size={18} />}
      </div>
      <div className="quick-form-fields">
        <FG label="Codigo de cuenta" hint="Ej: 1101, 2201, 4001">
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Ej: 1101" required />
        </FG>
        <FG label="Nombre de la cuenta">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Caja general" required />
        </FG>
        <FG label="Tipo de cuenta">
          <select value={type} onChange={(event) => setType(Number(event.target.value))}>
            <option value={1}>Activo</option>
            <option value={2}>Pasivo</option>
            <option value={3}>Capital</option>
            <option value={4}>Ingreso</option>
            <option value={5}>Gasto</option>
            <option value={6}>Costo</option>
          </select>
        </FG>
        <FG label="Cuenta padre (opcional)">
          <select value={parentAccountId} onChange={(event) => setParentAccountId(event.target.value)}>
            <option value="">Sin cuenta padre</option>
            {accounts.filter((parent) => parent.id !== account?.id).map((parent) => (
              <option key={parent.id} value={parent.id}>{parent.code} - {parent.name}</option>
            ))}
          </select>
        </FG>
        <label className="check-row">
          <input checked={isCashAccount} onChange={(event) => setIsCashAccount(event.target.checked)} type="checkbox" />
          <span>Cuenta de caja o banco</span>
        </label>
        {isEditing && (
          <label className="check-row">
            <input checked={isActive} onChange={(event) => setIsActive(event.target.checked)} type="checkbox" />
            <span>Cuenta activa</span>
          </label>
        )}
      </div>
      <div className="action-row">
        <button className="primary-button" type="submit">{isEditing ? "Guardar cambios" : "Crear cuenta"}</button>
        {account && onDelete && <button type="button" onClick={() => onDelete(account)}>Desactivar</button>}
      </div>
    </form>
  );
}

type JournalFormLine = {
  key: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
};

function newJournalFormLine(accountId = "", side: "debit" | "credit" = "debit", amount = 0): JournalFormLine {
  return {
    key: `journal-line-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    accountId,
    description: "",
    debit: side === "debit" ? amount : 0,
    credit: side === "credit" ? amount : 0
  };
}

function JournalQuickForm({
  session,
  accounts,
  detail,
  onCreate,
  onUpdate
}: {
  session: AuthSession;
  accounts: AccountSummary[];
  detail?: JournalEntryDetail | null;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (entry: JournalEntrySummary, payload: unknown) => void;
}) {
  const entry = detail?.entry ?? null;
  const isEditing = Boolean(entry);
  const canEdit = !entry || entry.status === 1;
  const [description, setDescription] = useState(entry?.description ?? "");
  const [entryDate, setEntryDate] = useState(toDateInputValue(entry?.entryDate));
  const [referenceType, setReferenceType] = useState(entry?.referenceType ?? "Frontend");
  const [lines, setLines] = useState<JournalFormLine[]>([
    newJournalFormLine(accounts[0]?.id ?? "", "debit", 0),
    newJournalFormLine(accounts[1]?.id ?? accounts[0]?.id ?? "", "credit", 0)
  ]);

  useEffect(() => {
    if (!entry) {
      setDescription("");
      setEntryDate("");
      setReferenceType("Frontend");
      setLines([
        newJournalFormLine(accounts[0]?.id ?? "", "debit", 0),
        newJournalFormLine(accounts[1]?.id ?? accounts[0]?.id ?? "", "credit", 0)
      ]);
      return;
    }

    setDescription(entry.description);
    setEntryDate(toDateInputValue(entry.entryDate));
    setReferenceType(entry.referenceType ?? "");
    setLines(detail?.lines.length
      ? detail.lines.map((line, index) => ({
        key: `journal-line-${entry.id}-${index}`,
        accountId: line.accountId,
        description: line.description ?? "",
        debit: line.debit,
        credit: line.credit
      }))
      : [
        newJournalFormLine(accounts[0]?.id ?? "", "debit", 0),
        newJournalFormLine(accounts[1]?.id ?? accounts[0]?.id ?? "", "credit", 0)
      ]);
  }, [entry?.id, detail?.lines, accounts]);

  useEffect(() => {
    if (accounts[0]?.id && lines.some((line) => !line.accountId)) {
      setLines((current) => current.map((line) => line.accountId ? line : { ...line, accountId: accounts[0].id }));
    }
  }, [accounts, lines]);

  const totals = lines.reduce((acc, line) => ({
    debit: acc.debit + line.debit,
    credit: acc.credit + line.credit
  }), { debit: 0, credit: 0 });
  const isBalanced = totals.debit > 0 && totals.debit === totals.credit;

  function updateLine(key: string, patch: Partial<JournalFormLine>) {
    setLines((current) => current.map((line) => line.key === key ? { ...line, ...patch } : line));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!isBalanced || lines.length < 2 || lines.some((line) => !line.accountId)) return;

    const payload = {
      tenantId: entry?.tenantId ?? session.tenantId,
      companyId: entry?.companyId ?? session.companyId,
      entryDate: entryDate || null,
      description,
      referenceType: referenceType || null,
      referenceId: null,
      lines: lines.map((line) => ({
        accountId: line.accountId,
        description: line.description || description,
        debit: line.debit,
        credit: line.credit
      }))
    };

    if (entry && onUpdate) {
      onUpdate(entry, payload);
      return;
    }

    onCreate(() => api.createJournalEntry(payload));
    setDescription("");
    setEntryDate("");
    setReferenceType("Frontend");
    setLines([
      newJournalFormLine(accounts[0]?.id ?? "", "debit", 0),
      newJournalFormLine(accounts[1]?.id ?? accounts[0]?.id ?? "", "credit", 0)
    ]);
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar asiento" : "Nuevo asiento"}</strong>
        {entry ? <span>{statusLabel("journal", entry.status)}</span> : <Plus size={18} />}
      </div>
      <div className="quick-form-fields">
        <FG label="Descripcion del asiento">
          <input disabled={!canEdit} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ej: Pago de renta enero" required />
        </FG>
        <FG label="Fecha">
          <input disabled={!canEdit} type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} />
        </FG>
        <FG label="Referencia">
          <input disabled={!canEdit} value={referenceType} onChange={(event) => setReferenceType(event.target.value)} placeholder="Origen o referencia" />
        </FG>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table action-table">
          <thead>
            <tr>
              <th>Cuenta</th>
              <th>Descripcion</th>
              <th>Debito</th>
              <th>Credito</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.key}>
                <td>
                  <select disabled={!canEdit} value={line.accountId} onChange={(event) => updateLine(line.key, { accountId: event.target.value })} required>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>{account.code} - {account.name}</option>
                    ))}
                  </select>
                </td>
                <td><input disabled={!canEdit} value={line.description} onChange={(event) => updateLine(line.key, { description: event.target.value })} placeholder="Detalle" /></td>
                <td><input disabled={!canEdit} min={0} step="0.01" type="number" value={line.debit} onChange={(event) => updateLine(line.key, { debit: Number(event.target.value), credit: Number(event.target.value) > 0 ? 0 : line.credit })} /></td>
                <td><input disabled={!canEdit} min={0} step="0.01" type="number" value={line.credit} onChange={(event) => updateLine(line.key, { credit: Number(event.target.value), debit: Number(event.target.value) > 0 ? 0 : line.debit })} /></td>
                <td>
                  {canEdit && lines.length > 2 && (
                    <button type="button" onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}>Quitar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="statement-kpis">
        <article><span>Debito</span><strong>{money.format(totals.debit)}</strong></article>
        <article><span>Credito</span><strong>{money.format(totals.credit)}</strong></article>
        <article><span>Diferencia</span><strong>{money.format(totals.debit - totals.credit)}</strong></article>
      </div>

      <div className="action-row">
        {canEdit && (
          <button type="button" onClick={() => setLines((current) => [...current, newJournalFormLine(accounts[0]?.id ?? "")])}>
            Agregar linea
          </button>
        )}
        <button className="primary-button" disabled={!canEdit || accounts.length < 2 || !isBalanced} type="submit">
          <Plus size={18} />
          <span>{isEditing ? "Guardar cambios" : "Crear asiento"}</span>
        </button>
      </div>
    </form>
  );
}

function JournalActionTable({
  entries,
  selectedEntryId,
  onCreateNew,
  onPost,
  onSelect,
  onVoid
}: {
  entries: JournalEntrySummary[];
  selectedEntryId?: string | null;
  onCreateNew?: () => void;
  onPost: (entryId: string) => Promise<void>;
  onSelect?: (entryId: string) => void | Promise<void>;
  onVoid: (entryId: string) => Promise<void>;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Asientos contables</strong>
        {onCreateNew ? <button type="button" onClick={onCreateNew}>Nuevo</button> : <span>{entries.length} registros</span>}
      </div>
      {entries.length === 0 ? (
        <p className="empty-state">Sin asientos para mostrar.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table action-table">
            <thead>
              <tr>
                <th>Numero</th>
                <th>Descripcion</th>
                <th>Estado</th>
                <th>Debito</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  className={entry.id === selectedEntryId ? "admin-table-row-active" : undefined}
                  key={entry.id}
                  onClick={() => onSelect?.(entry.id)}
                >
                  <td>{entry.number}</td>
                  <td>{entry.description}</td>
                  <td>{statusLabel("journal", entry.status)}</td>
                  <td>{money.format(entry.totalDebit)}</td>
                  <td>
                    {entry.status === 1 && <button type="button" onClick={(event) => { event.stopPropagation(); onPost(entry.id); }}>Postear</button>}
                    {entry.status === 2 && <button type="button" onClick={(event) => { event.stopPropagation(); onVoid(entry.id); }}>Anular</button>}
                    {entry.status === 3 && <span>Anulado</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function TrialBalanceAccountTable({
  lines,
  selectedAccountId,
  onSelect
}: {
  lines: TrialBalanceLine[];
  selectedAccountId?: string | null;
  onSelect: (accountId: string) => void | Promise<void>;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Balance por cuenta</strong>
        <span>{lines.length} cuentas</span>
      </div>
      {lines.length === 0 ? (
        <p className="empty-state">Sin movimientos contables para mostrar.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table action-table">
            <thead>
              <tr>
                <th>Cuenta</th>
                <th>Debito</th>
                <th>Credito</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr
                  className={line.accountId === selectedAccountId ? "admin-table-row-active" : undefined}
                  key={line.accountId}
                  onClick={() => onSelect(line.accountId)}
                >
                  <td>{line.accountCode} - {line.accountName}</td>
                  <td>{money.format(line.debit)}</td>
                  <td>{money.format(line.credit)}</td>
                  <td>{money.format(line.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function HumanResourcesWorkspace({
  session,
  data,
  selectedPayrollPeriodId,
  onCreateEmployee,
  onCreatePayrollPeriod,
  onSelectPayrollPeriod,
  onTerminateEmployee,
  onCancelPayroll,
  onCalculatePayroll,
  onPostPayroll,
  onPayPayroll
}: {
  session: AuthSession;
  data: AdminData;
  selectedPayrollPeriodId: string | null;
  onCreateEmployee: (action: () => Promise<unknown>) => void;
  onCreatePayrollPeriod: (action: () => Promise<unknown>) => void;
  onSelectPayrollPeriod: (periodId: string) => void;
  onTerminateEmployee: (employeeId: string) => Promise<void>;
  onCancelPayroll: (periodId: string) => Promise<void>;
  onCalculatePayroll: (periodId: string) => Promise<void>;
  onPostPayroll: (periodId: string) => Promise<void>;
  onPayPayroll: (periodId: string) => Promise<void>;
}) {
  const selectedPeriod = data.payrollPeriods.find((period) => period.id === selectedPayrollPeriodId) ?? data.payrollPeriods[0];
  const detail = data.payrollDetail;

  return (
    <section className="hr-workspace">
      <div className="hr-left">
        <FormTabs tabs={[
          {
            label: "Nuevo empleado",
            content: <EmployeeQuickForm session={session} branches={data.branches} onCreate={onCreateEmployee} />
          },
          {
            label: "Nuevo periodo",
            content: <PayrollPeriodQuickForm session={session} onCreate={onCreatePayrollPeriod} />
          },
          {
            label: `Empleados (${data.employees.length})`,
            content: <EmployeeActionList employees={data.employees} onTerminate={onTerminateEmployee} />
          }
        ]} />
      </div>

      <div className="hr-right">
        <section className="panel admin-panel">
          <div className="panel-title">
            <strong>{selectedPeriod?.name ?? "Nomina"}</strong>
            <span>{selectedPeriod ? statusLabel("payroll", selectedPeriod.status) : "RRHH"}</span>
          </div>
          <div className="statement-kpis">
            <article>
              <span>Bruto</span>
              <strong>{money.format(detail?.period.grossPay ?? selectedPeriod?.grossPay ?? 0)}</strong>
            </article>
            <article>
              <span>Deducciones</span>
              <strong>{money.format(detail?.period.totalDeductions ?? selectedPeriod?.totalDeductions ?? 0)}</strong>
            </article>
            <article>
              <span>Neto</span>
              <strong>{money.format(detail?.period.netPay ?? selectedPeriod?.netPay ?? 0)}</strong>
            </article>
          </div>
        </section>

        <AdminTwoColumn>
          <PayrollPeriodList
            periods={data.payrollPeriods}
            selectedPayrollPeriodId={selectedPeriod?.id}
            onCreateNew={() => undefined}
            onSelect={onSelectPayrollPeriod}
            onCancel={onCancelPayroll}
            onCalculate={onCalculatePayroll}
            onPost={onPostPayroll}
            onPay={onPayPayroll}
          />
          <DataTable
            title="Resumen empleados"
            columns={["Area", "Activos", "Suspendidos", "Nomina"]}
            rows={employeeDepartmentRows(data.employees)}
          />
        </AdminTwoColumn>

        <DataTable
          title="Lineas de nomina"
          columns={["Empleado", "Dias", "Bruto", "Deducciones", "Neto"]}
          rows={(detail?.lines ?? []).map((line) => [
            `${line.employeeCode} - ${line.employeeName}`,
            `${line.daysWorked}`,
            money.format(line.regularPay + line.overtimePay + line.bonus),
            money.format(line.deductions),
            money.format(line.netPay)
          ])}
        />
      </div>
    </section>
  );
}

function EmployeeActionList({
  employees,
  selectedEmployeeId,
  onCreateNew,
  onSelect,
  onTerminate
}: {
  employees: EmployeeSummary[];
  selectedEmployeeId?: string | null;
  onCreateNew?: () => void;
  onSelect?: (employeeId: string) => void;
  onTerminate: (employeeId: string) => Promise<void>;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Empleados</strong>
        {onCreateNew ? <button type="button" onClick={onCreateNew}>Nuevo</button> : <span>{employees.length} registros</span>}
      </div>
      <div className="employee-list">
        {employees.length === 0 ? (
          <p className="empty-state">Sin empleados registrados.</p>
        ) : employees.map((employee) => (
          <article className={employee.id === selectedEmployeeId ? "employee-row employee-row-active" : "employee-row"} key={employee.id}>
            <span>
              <strong>{employee.code} - {employee.fullName}</strong>
              <small>{employee.position || employee.department || "Sin area"}</small>
            </span>
            <span>
              <strong>{money.format(employee.baseSalary)}</strong>
              <small>{statusLabel("employee", employee.status)}</small>
            </span>
            {onSelect && <button type="button" onClick={() => onSelect(employee.id)}>Editar</button>}
            {employee.status !== 3 && (
              <button type="button" onClick={() => onTerminate(employee.id)}>Terminar</button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function PayrollPeriodList({
  periods,
  selectedPayrollPeriodId,
  onCreateNew,
  onSelect,
  onCancel,
  onCalculate,
  onPost,
  onPay
}: {
  periods: PayrollPeriodSummary[];
  selectedPayrollPeriodId?: string;
  onCreateNew: () => void;
  onSelect: (periodId: string) => void;
  onCancel: (periodId: string) => Promise<void>;
  onCalculate: (periodId: string) => Promise<void>;
  onPost: (periodId: string) => Promise<void>;
  onPay: (periodId: string) => Promise<void>;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Periodos de nomina</strong>
        <button type="button" onClick={onCreateNew}>Nuevo</button>
      </div>
      <div className="payroll-list">
        {periods.length === 0 ? (
          <p className="empty-state">Sin periodos registrados.</p>
        ) : periods.map((period) => (
          <article className={period.id === selectedPayrollPeriodId ? "payroll-row payroll-row-active" : "payroll-row"} key={period.id}>
            <button type="button" onClick={() => onSelect(period.id)}>
              <span>
                <strong>{period.number} - {period.name}</strong>
                <small>{period.fromDate ? new Date(period.fromDate).toLocaleDateString("es-DO") : "-"} / {period.payDate ? new Date(period.payDate).toLocaleDateString("es-DO") : "-"}</small>
              </span>
              <span>
                <strong>{money.format(period.netPay)}</strong>
                <small>{statusLabel("payroll", period.status)}</small>
              </span>
            </button>
            <div className="inline-actions">
              {period.status === 1 && <button type="button" onClick={() => onCalculate(period.id)}>Calcular</button>}
              {(period.status === 1 || period.status === 2) && <button type="button" onClick={() => onCancel(period.id)}>Cancelar</button>}
              {period.status === 2 && <button type="button" onClick={() => onPost(period.id)}>Postear</button>}
              {period.status === 3 && <button type="button" onClick={() => onPay(period.id)}>Pagar</button>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EmployeeQuickForm({
  session,
  employee,
  branches,
  onCreate,
  onUpdate,
  onDelete
}: {
  session: AuthSession;
  employee?: EmployeeSummary | null;
  branches: Branch[];
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (employee: EmployeeSummary, payload: unknown) => void;
  onDelete?: (employee: EmployeeSummary) => void;
}) {
  const isEditing = Boolean(employee);
  const [code, setCode] = useState(employee?.code ?? `EMP-${Date.now().toString().slice(-5)}`);
  const [fullName, setFullName] = useState(employee?.fullName ?? "");
  const [documentId, setDocumentId] = useState(employee?.documentId ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [department, setDepartment] = useState(employee?.department ?? "Operaciones");
  const [position, setPosition] = useState(employee?.position ?? "Colaborador");
  const [branchId, setBranchId] = useState(employee?.branchId ?? branches[0]?.id ?? "");
  const [baseSalary, setBaseSalary] = useState(employee?.baseSalary ?? 25000);
  const [paymentMethod, setPaymentMethod] = useState(employee?.paymentMethod ?? 4);
  const [bankAccount, setBankAccount] = useState(employee?.bankAccount ?? "");
  const [status, setStatus] = useState(employee?.status ?? 1);

  useEffect(() => {
    setCode(employee?.code ?? `EMP-${Date.now().toString().slice(-5)}`);
    setFullName(employee?.fullName ?? "");
    setDocumentId(employee?.documentId ?? "");
    setPhone(employee?.phone ?? "");
    setEmail(employee?.email ?? "");
    setDepartment(employee?.department ?? "Operaciones");
    setPosition(employee?.position ?? "Colaborador");
    setBranchId(employee?.branchId ?? branches[0]?.id ?? "");
    setBaseSalary(employee?.baseSalary ?? 25000);
    setPaymentMethod(employee?.paymentMethod ?? 4);
    setBankAccount(employee?.bankAccount ?? "");
    setStatus(employee?.status ?? 1);
  }, [employee?.id, branches]);

  useEffect(() => {
    if (!branchId && branches[0]?.id) setBranchId(branches[0].id);
  }, [branches, branchId]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      tenantId: employee?.tenantId ?? session.tenantId,
      companyId: employee?.companyId ?? session.companyId,
      branchId,
      code,
      fullName,
      documentId,
      phone,
      email: email || null,
      department,
      position,
      hireDate: employee?.hireDate ?? null,
      baseSalary,
      paymentMethod,
      bankAccount: bankAccount || null,
      status
    };

    if (employee && onUpdate) {
      onUpdate(employee, payload);
      return;
    }

    onCreate(() => api.createEmployee({ ...payload, status: 1 }));
    setCode(`EMP-${Date.now().toString().slice(-5)}`);
    setFullName("");
    setDocumentId("");
    setPhone("");
    setEmail("");
    setDepartment("Operaciones");
    setPosition("Colaborador");
    setBaseSalary(25000);
    setPaymentMethod(4);
    setBankAccount("");
    setStatus(1);
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar empleado" : "Alta rapida de empleado"}</strong>
        {employee ? <span>{employee.code}</span> : <Plus size={18} />}
      </div>
      <div className="quick-form-fields">
      <FG label="Codigo">
        <input value={code} onChange={(event) => setCode(event.target.value)} required />
      </FG>
      <FG label="Sucursal">
        <select value={branchId} onChange={(event) => setBranchId(event.target.value)}>
          {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
        </select>
      </FG>
      <FG label="Nombre completo">
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nombre y apellidos del empleado" required />
      </FG>
      <FG label="Cedula o documento" hint="Numero de documento de identidad.">
        <input value={documentId} onChange={(event) => setDocumentId(event.target.value)} placeholder="Ej: 001-1234567-8" />
      </FG>
      <FG label="Telefono">
        <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Ej: 809-000-0000" />
      </FG>
      <FG label="Correo">
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="empleado@empresa.com" />
      </FG>
      <FG label="Departamento">
        <input value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="Ej: Ventas, Operaciones" />
      </FG>
      <FG label="Puesto o cargo">
        <input value={position} onChange={(event) => setPosition(event.target.value)} placeholder="Ej: Cajero, Supervisor" />
      </FG>
      <FG label="Salario base mensual">
        <input type="number" value={baseSalary} onChange={(event) => setBaseSalary(Number(event.target.value))} placeholder="0.00" />
      </FG>
      <FG label="Metodo de pago">
        <select value={paymentMethod} onChange={(event) => setPaymentMethod(Number(event.target.value))}>
          <option value={1}>Efectivo</option>
          <option value={2}>Tarjeta</option>
          <option value={4}>Transferencia</option>
        </select>
      </FG>
      <FG label="Cuenta bancaria">
        <input value={bankAccount} onChange={(event) => setBankAccount(event.target.value)} placeholder="Numero de cuenta o referencia" />
      </FG>
      {isEditing && (
        <FG label="Estado">
          <select value={status} onChange={(event) => setStatus(Number(event.target.value))}>
            <option value={1}>Activo</option>
            <option value={2}>Suspendido</option>
            <option value={3}>Terminado</option>
          </select>
        </FG>
      )}
      </div>
      <div className="action-row">
        <button className="primary-button" type="submit">{isEditing ? "Guardar cambios" : "Crear empleado"}</button>
        {employee && employee.status !== 3 && onDelete && <button type="button" onClick={() => onDelete(employee)}>Terminar</button>}
      </div>
    </form>
  );
}

function PayrollPeriodQuickForm({
  session,
  period,
  onCreate,
  onUpdate,
  onCancel
}: {
  session: AuthSession;
  period?: PayrollPeriodSummary | null;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (period: PayrollPeriodSummary, payload: unknown) => void;
  onCancel?: (period: PayrollPeriodSummary) => void;
}) {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
  const isEditing = Boolean(period);
  const canEdit = !period || period.status === 1;
  const canCancel = period && (period.status === 1 || period.status === 2);
  const defaultName = `Nomina ${today.toLocaleDateString("es-DO", { month: "long", year: "numeric" })}`;
  const [name, setName] = useState(period?.name ?? defaultName);
  const [fromDate, setFromDate] = useState(toDateInputValue(period?.fromDate) || firstDay);
  const [toDate, setToDate] = useState(toDateInputValue(period?.toDate) || lastDay);
  const [payDate, setPayDate] = useState(toDateInputValue(period?.payDate) || lastDay);

  useEffect(() => {
    setName(period?.name ?? defaultName);
    setFromDate(toDateInputValue(period?.fromDate) || firstDay);
    setToDate(toDateInputValue(period?.toDate) || lastDay);
    setPayDate(toDateInputValue(period?.payDate) || lastDay);
  }, [period?.id]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      tenantId: session.tenantId,
      companyId: period?.companyId ?? session.companyId,
      name,
      fromDate,
      toDate,
      payDate
    };

    if (period && onUpdate) {
      onUpdate(period, payload);
      return;
    }

    onCreate(() => api.createPayrollPeriod(payload));
    setName(`Nomina ${Date.now().toString().slice(-4)}`);
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar periodo" : "Periodo de nomina"}</strong>
        {period ? <span>{statusLabel("payroll", period.status)}</span> : <Plus size={18} />}
      </div>
      <div className="quick-form-fields">
        <FG label="Nombre del periodo" hint={period && !canEdit ? "Solo los periodos en borrador pueden editarse." : undefined}>
          <input disabled={!canEdit} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Nomina enero 2025" required />
        </FG>
        <FG label="Fecha de inicio">
          <input disabled={!canEdit} type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} required />
        </FG>
        <FG label="Fecha de cierre">
          <input disabled={!canEdit} type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} required />
        </FG>
        <FG label="Fecha de pago">
          <input disabled={!canEdit} type="date" value={payDate} onChange={(event) => setPayDate(event.target.value)} required />
        </FG>
      </div>
      <div className="action-row">
        <button className="primary-button" disabled={!canEdit} type="submit">
          {isEditing ? "Guardar cambios" : "Crear periodo"}
        </button>
        {canCancel && onCancel && <button type="button" onClick={() => onCancel(period)}>Cancelar periodo</button>}
      </div>
    </form>
  );
}

function CrmWorkspace({
  session,
  data,
  selectedLeadId,
  onSelectLead,
  onCreateLead,
  onCreateOpportunity,
  onCreateActivity,
  onAdvanceLead,
  onConvertLead,
  onCompleteActivity
}: {
  session: AuthSession;
  data: AdminData;
  selectedLeadId: string | null;
  onSelectLead: (leadId: string) => void;
  onCreateLead: (action: () => Promise<unknown>) => void;
  onCreateOpportunity: (action: () => Promise<unknown>) => void;
  onCreateActivity: (action: () => Promise<unknown>) => void;
  onAdvanceLead: (leadId: string) => Promise<void>;
  onConvertLead: (leadId: string) => Promise<void>;
  onCompleteActivity: (activityId: string) => Promise<void>;
}) {
  const selectedLead = data.leads.find((lead) => lead.id === selectedLeadId) ?? data.leads[0];
  const leadActivities = data.activities.filter((activity) => activity.leadId === selectedLead?.id);
  const leadOpportunities = data.opportunities.filter((opportunity) => opportunity.leadId === selectedLead?.id);

  return (
    <section className="crm-workspace">
      <div className="crm-left">
        <FormTabs tabs={[
          {
            label: "Nuevo lead",
            content: <CrmLeadQuickForm session={session} onCreate={onCreateLead} />
          },
          {
            label: "Oportunidad",
            content: <CrmOpportunityQuickForm session={session} leads={data.leads} selectedLeadId={selectedLead?.id} onCreate={onCreateOpportunity} />
          },
          {
            label: "Actividad",
            content: (
              <CrmActivityQuickForm
                session={session}
                leads={data.leads}
                opportunities={data.opportunities}
                selectedLeadId={selectedLead?.id}
                onCreate={onCreateActivity}
              />
            )
          }
        ]} />
      </div>

      <div className="crm-right">
        <section className="panel admin-panel">
          <div className="panel-title">
            <strong>{selectedLead?.companyName || selectedLead?.contactName || "Pipeline CRM"}</strong>
            <span>{selectedLead ? statusLabel("lead", selectedLead.status) : "Leads"}</span>
          </div>
          <div className="statement-kpis">
            <article>
              <span>Leads</span>
              <strong>{data.leads.length}</strong>
            </article>
            <article>
              <span>Pipeline</span>
              <strong>{money.format(data.opportunities.reduce((sum, opportunity) => sum + opportunity.estimatedValue, 0))}</strong>
            </article>
            <article>
              <span>Actividades</span>
              <strong>{data.activities.filter((activity) => activity.status === 1).length}</strong>
            </article>
          </div>
        </section>

        <AdminTwoColumn>
          <CrmLeadList
            leads={data.leads}
            selectedLeadId={selectedLead?.id}
            onSelectLead={onSelectLead}
            onAdvanceLead={onAdvanceLead}
            onConvertLead={onConvertLead}
          />
          <CrmActivityList activities={leadActivities.length > 0 ? leadActivities : data.activities} onCompleteActivity={onCompleteActivity} />
        </AdminTwoColumn>

        <AdminTwoColumn>
          <DataTable
            title="Oportunidades del lead"
            columns={["Nombre", "Etapa", "Cierre", "Valor"]}
            rows={(leadOpportunities.length > 0 ? leadOpportunities : data.opportunities).map((opportunity) => [
              opportunity.name,
              statusLabel("opportunity", opportunity.stage),
              opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString("es-DO") : "-",
              money.format(opportunity.estimatedValue)
            ])}
          />
          <DataTable
            title="Forecast por etapa"
            columns={["Etapa", "Cantidad", "Valor"]}
            rows={opportunityStageRows(data.opportunities)}
          />
        </AdminTwoColumn>
      </div>
    </section>
  );
}

function CrmLeadList({
  leads,
  selectedLeadId,
  onCreateNew,
  onSelectLead,
  onAdvanceLead,
  onConvertLead
}: {
  leads: CrmLeadSummary[];
  selectedLeadId?: string;
  onCreateNew?: () => void;
  onSelectLead: (leadId: string) => void;
  onAdvanceLead: (leadId: string) => Promise<void>;
  onConvertLead: (leadId: string, payload: unknown) => Promise<void>;
}) {
  const [conversionLeadId, setConversionLeadId] = useState<string | null>(null);
  const [createOpportunity, setCreateOpportunity] = useState(true);
  const [opportunityName, setOpportunityName] = useState("");
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [expectedCloseDate, setExpectedCloseDate] = useState("");

  function startConversion(lead: CrmLeadSummary) {
    setConversionLeadId(lead.id);
    setCreateOpportunity(true);
    setOpportunityName(lead.companyName || lead.contactName || "Oportunidad CRM");
    setEstimatedValue(lead.estimatedValue);
    setExpectedCloseDate("");
  }

  function submitConversion(event: FormEvent, leadId: string) {
    event.preventDefault();
    onConvertLead(leadId, {
      createOpportunity,
      opportunityName: createOpportunity ? opportunityName || null : null,
      estimatedValue: createOpportunity ? estimatedValue : null,
      expectedCloseDate: createOpportunity && expectedCloseDate ? expectedCloseDate : null
    });
    setConversionLeadId(null);
  }

  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Leads</strong>
        {onCreateNew ? <button type="button" onClick={onCreateNew}>Nuevo</button> : <span>{leads.length} registros</span>}
      </div>
      <div className="crm-lead-list">
        {leads.length === 0 ? (
          <p className="empty-state">Sin leads registrados.</p>
        ) : leads.map((lead) => (
          <article className={lead.id === selectedLeadId ? "crm-lead-row crm-lead-row-active" : "crm-lead-row"} key={lead.id}>
            <button type="button" onClick={() => onSelectLead(lead.id)}>
              <span>
                <strong>{lead.companyName || lead.contactName}</strong>
                <small>{lead.contactName} - {lead.phone || lead.email || "Sin contacto"}</small>
              </span>
              <span>
                <strong>{money.format(lead.estimatedValue)}</strong>
                <small>{statusLabel("lead", lead.status)}</small>
              </span>
            </button>
            <div className="inline-actions">
              {lead.status < 3 && <button type="button" onClick={() => onAdvanceLead(lead.id)}>Avanzar</button>}
              {lead.status !== 4 && <button type="button" onClick={() => startConversion(lead)}>Convertir</button>}
            </div>
            {conversionLeadId === lead.id && (
              <form className="crm-conversion-form" onSubmit={(event) => submitConversion(event, lead.id)}>
                <label className="check-row">
                  <input checked={createOpportunity} onChange={(event) => setCreateOpportunity(event.target.checked)} type="checkbox" />
                  <span>Crear oportunidad al convertir</span>
                </label>
                {createOpportunity && (
                  <div className="quick-form-fields">
                    <FG label="Nombre de oportunidad">
                      <input value={opportunityName} onChange={(event) => setOpportunityName(event.target.value)} placeholder="Nombre de la oportunidad" />
                    </FG>
                    <FG label="Valor estimado">
                      <input min={0} step="0.01" type="number" value={estimatedValue} onChange={(event) => setEstimatedValue(Number(event.target.value))} />
                    </FG>
                    <FG label="Cierre esperado">
                      <input type="date" value={expectedCloseDate} onChange={(event) => setExpectedCloseDate(event.target.value)} />
                    </FG>
                  </div>
                )}
                <div className="action-row">
                  <button className="primary-button" type="submit">Confirmar conversion</button>
                  <button type="button" onClick={() => setConversionLeadId(null)}>Cancelar</button>
                </div>
              </form>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function CrmActivityList({
  activities,
  selectedActivityId,
  onCancelActivity,
  onCompleteActivity,
  onCreateNew,
  onSelectActivity
}: {
  activities: CrmActivitySummary[];
  selectedActivityId?: string | null;
  onCancelActivity?: (activityId: string) => Promise<void>;
  onCompleteActivity: (activityId: string) => Promise<void>;
  onCreateNew?: () => void;
  onSelectActivity?: (activityId: string) => void;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Actividades</strong>
        {onCreateNew ? <button type="button" onClick={onCreateNew}>Nueva</button> : <span>{activities.length} registros</span>}
      </div>
      <div className="crm-lead-list">
        {activities.length === 0 ? (
          <p className="empty-state">Sin actividades pendientes.</p>
        ) : activities.map((activity) => (
          <article
            className={activity.id === selectedActivityId ? "crm-activity-row crm-activity-row-active" : "crm-activity-row"}
            key={activity.id}
            onClick={() => onSelectActivity?.(activity.id)}
          >
            <span>
              <strong>{activity.subject}</strong>
              <small>{crmActivityTypeLabel(activity.type)} - {activity.dueAt ? new Date(activity.dueAt).toLocaleDateString("es-DO") : "Sin fecha"}</small>
            </span>
            <span>
              <strong>{statusLabel("activity", activity.status)}</strong>
              <small>{activity.description || "-"}</small>
            </span>
            {activity.status === 1 && (
              <div className="inline-actions">
                <button type="button" onClick={(event) => { event.stopPropagation(); onCompleteActivity(activity.id); }}>Completar</button>
                {onCancelActivity && <button type="button" onClick={(event) => { event.stopPropagation(); onCancelActivity(activity.id); }}>Cancelar</button>}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function CrmLeadQuickForm({
  session,
  lead,
  onCreate,
  onUpdate
}: {
  session: AuthSession;
  lead?: CrmLeadSummary | null;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (lead: CrmLeadSummary, payload: unknown) => void;
}) {
  const isEditing = Boolean(lead);
  const [contactName, setContactName] = useState(lead?.contactName ?? "");
  const [companyName, setCompanyName] = useState(lead?.companyName ?? "");
  const [phone, setPhone] = useState(lead?.phone ?? "");
  const [email, setEmail] = useState(lead?.email ?? "");
  const [source, setSource] = useState(lead?.source ?? "Frontend");
  const [status, setStatus] = useState(lead?.status ?? 1);
  const [estimatedValue, setEstimatedValue] = useState(lead?.estimatedValue ?? 10000);
  const [notes, setNotes] = useState(lead?.notes ?? "");
  const [nextFollowUpAt, setNextFollowUpAt] = useState(lead?.nextFollowUpAt?.slice(0, 10) ?? "");

  useEffect(() => {
    setContactName(lead?.contactName ?? "");
    setCompanyName(lead?.companyName ?? "");
    setPhone(lead?.phone ?? "");
    setEmail(lead?.email ?? "");
    setSource(lead?.source ?? "Frontend");
    setStatus(lead?.status ?? 1);
    setEstimatedValue(lead?.estimatedValue ?? 10000);
    setNotes(lead?.notes ?? "");
    setNextFollowUpAt(lead?.nextFollowUpAt?.slice(0, 10) ?? "");
  }, [lead?.id]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      tenantId: lead?.tenantId ?? session.tenantId,
      companyId: lead?.companyId ?? session.companyId,
      assignedUserId: lead?.assignedUserId ?? null,
      companyName: companyName || null,
      contactName,
      phone: phone || null,
      email: email || null,
      source: source || null,
      status,
      estimatedValue,
      notes: notes || null,
      nextFollowUpAt: nextFollowUpAt || null
    };

    if (lead && onUpdate) {
      onUpdate(lead, payload);
      return;
    }

    onCreate(() => api.createCrmLead({ ...payload, status: 1, notes: notes || "Creado desde consola ERP" }));
    setContactName("");
    setCompanyName("");
    setPhone("");
    setEmail("");
    setSource("Frontend");
    setStatus(1);
    setEstimatedValue(10000);
    setNotes("");
    setNextFollowUpAt("");
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar lead" : "Nuevo lead"}</strong>
        {lead ? <span>{statusLabel("lead", lead.status)}</span> : <Plus size={18} />}
      </div>
      <div className="quick-form-fields">
      <FG label="Nombre del contacto">
        <input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Nombre de la persona de contacto" required />
      </FG>
      <FG label="Empresa">
        <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Nombre de la empresa (opcional)" />
      </FG>
      <FG label="Telefono">
        <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Ej: 809-000-0000" />
      </FG>
      <FG label="Correo electronico">
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="contacto@empresa.com" />
      </FG>
      <FG label="Origen del lead" hint="Como llegaste a este contacto.">
        <input value={source} onChange={(event) => setSource(event.target.value)} placeholder="Ej: Referido, Web, Redes sociales" />
      </FG>
      <FG label="Valor estimado">
        <input type="number" value={estimatedValue} onChange={(event) => setEstimatedValue(Number(event.target.value))} placeholder="0.00" />
      </FG>
      {isEditing && (
        <FG label="Estado">
          <select value={status} onChange={(event) => setStatus(Number(event.target.value))}>
            <option value={1}>Nuevo</option>
            <option value={2}>Contactado</option>
            <option value={3}>Calificado</option>
            <option value={4}>Convertido</option>
            <option value={5}>Perdido</option>
          </select>
        </FG>
      )}
      <FG label="Notas">
        <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notas internas del seguimiento" />
      </FG>
      <FG label="Proximo seguimiento">
        <input type="date" value={nextFollowUpAt} onChange={(event) => setNextFollowUpAt(event.target.value)} />
      </FG>
      </div>
      <button className="primary-button" type="submit">{isEditing ? "Guardar cambios" : "Crear lead"}</button>
    </form>
  );
}

function CrmOpportunityQuickForm({
  session,
  opportunity,
  leads,
  selectedLeadId,
  onCreate,
  onUpdate
}: {
  session: AuthSession;
  opportunity?: CrmOpportunitySummary | null;
  leads: CrmLeadSummary[];
  selectedLeadId?: string;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (opportunity: CrmOpportunitySummary, payload: unknown) => void;
}) {
  const isEditing = Boolean(opportunity);
  const selectedLead = leads.find((lead) => lead.id === (opportunity?.leadId ?? selectedLeadId));
  const [leadId, setLeadId] = useState(opportunity?.leadId ?? selectedLeadId ?? "");
  const [name, setName] = useState(opportunity?.name ?? (selectedLead?.companyName || selectedLead?.contactName || ""));
  const [stage, setStage] = useState(opportunity?.stage ?? 1);
  const [estimatedValue, setEstimatedValue] = useState(opportunity?.estimatedValue ?? selectedLead?.estimatedValue ?? 10000);
  const [expectedCloseDate, setExpectedCloseDate] = useState(opportunity?.expectedCloseDate?.slice(0, 10) ?? "");
  const [notes, setNotes] = useState(opportunity?.notes ?? "");

  useEffect(() => {
    if (opportunity) {
      setLeadId(opportunity.leadId ?? "");
      setName(opportunity.name);
      setStage(opportunity.stage);
      setEstimatedValue(opportunity.estimatedValue);
      setExpectedCloseDate(opportunity.expectedCloseDate?.slice(0, 10) ?? "");
      setNotes(opportunity.notes ?? "");
      return;
    }

    if (selectedLeadId) {
      setLeadId(selectedLeadId);
      const lead = leads.find((item) => item.id === selectedLeadId);
      if (lead && !name) setName(lead.companyName || lead.contactName);
      if (lead) setEstimatedValue(lead.estimatedValue);
    }
  }, [opportunity?.id, selectedLeadId, leads, name]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      tenantId: opportunity?.tenantId ?? session.tenantId,
      companyId: opportunity?.companyId ?? session.companyId,
      leadId: leadId || null,
      customerId: opportunity?.customerId ?? null,
      assignedUserId: opportunity?.assignedUserId ?? null,
      name,
      stage,
      estimatedValue,
      expectedCloseDate: expectedCloseDate || null,
      notes: notes || null
    };

    if (opportunity && onUpdate) {
      onUpdate(opportunity, payload);
      return;
    }

    onCreate(() => api.createCrmOpportunity({ ...payload, stage: 1, notes: notes || "Creada desde consola CRM" }));
    setName("");
    setStage(1);
    setExpectedCloseDate("");
    setEstimatedValue(10000);
    setNotes("");
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar oportunidad" : "Nueva oportunidad"}</strong>
        {opportunity ? <span>{statusLabel("opportunity", opportunity.stage)}</span> : <Plus size={18} />}
      </div>
      <div className="quick-form-fields">
        <FG label="Lead asociado">
          <select value={leadId} onChange={(event) => setLeadId(event.target.value)}>
            <option value="">Sin lead</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>{lead.companyName || lead.contactName}</option>
            ))}
          </select>
        </FG>
        <FG label="Nombre de la oportunidad">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Propuesta de software 2025" required />
        </FG>
        <FG label="Valor estimado">
          <input type="number" value={estimatedValue} onChange={(event) => setEstimatedValue(Number(event.target.value))} placeholder="0.00" />
        </FG>
        {isEditing && (
          <FG label="Etapa">
            <select value={stage} onChange={(event) => setStage(Number(event.target.value))}>
              <option value={1}>Prospeccion</option>
              <option value={2}>Cotizada</option>
              <option value={3}>Negociacion</option>
              <option value={4}>Ganada</option>
              <option value={5}>Perdida</option>
            </select>
          </FG>
        )}
        <FG label="Fecha estimada de cierre">
          <input type="date" value={expectedCloseDate} onChange={(event) => setExpectedCloseDate(event.target.value)} />
        </FG>
        <FG label="Notas">
          <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notas de la oportunidad" />
        </FG>
      </div>
      <button className="primary-button" type="submit">
        {isEditing ? "Guardar cambios" : "Crear oportunidad"}
      </button>
    </form>
  );
}

function CrmOpportunityList({
  opportunities,
  selectedOpportunityId,
  onCreateNew,
  onSelectOpportunity
}: {
  opportunities: CrmOpportunitySummary[];
  selectedOpportunityId?: string;
  onCreateNew: () => void;
  onSelectOpportunity: (opportunityId: string) => void;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Oportunidades</strong>
        <button type="button" onClick={onCreateNew}>Nueva</button>
      </div>
      <div className="crm-lead-list">
        {opportunities.length === 0 ? (
          <p className="empty-state">Sin oportunidades registradas.</p>
        ) : opportunities.map((opportunity) => (
          <article className={opportunity.id === selectedOpportunityId ? "crm-lead-row crm-lead-row-active" : "crm-lead-row"} key={opportunity.id}>
            <button type="button" onClick={() => onSelectOpportunity(opportunity.id)}>
              <span>
                <strong>{opportunity.name}</strong>
                <small>{opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString("es-DO") : "Sin cierre estimado"}</small>
              </span>
              <span>
                <strong>{money.format(opportunity.estimatedValue)}</strong>
                <small>{statusLabel("opportunity", opportunity.stage)}</small>
              </span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function CrmActivityQuickForm({
  session,
  activity,
  leads,
  opportunities,
  selectedLeadId,
  onCreate,
  onUpdate,
  onCancel
}: {
  session: AuthSession;
  activity?: CrmActivitySummary | null;
  leads: CrmLeadSummary[];
  opportunities: CrmOpportunitySummary[];
  selectedLeadId?: string;
  onCreate: (action: () => Promise<unknown>) => void;
  onUpdate?: (activity: CrmActivitySummary, payload: unknown) => void;
  onCancel?: (activity: CrmActivitySummary) => void;
}) {
  const isEditing = Boolean(activity);
  const [leadId, setLeadId] = useState(activity?.leadId ?? selectedLeadId ?? "");
  const [opportunityId, setOpportunityId] = useState(activity?.opportunityId ?? "");
  const [type, setType] = useState(activity?.type ?? 1);
  const [status, setStatus] = useState(activity?.status ?? 1);
  const [subject, setSubject] = useState(activity?.subject ?? "");
  const [description, setDescription] = useState(activity?.description ?? "");
  const [dueAt, setDueAt] = useState(activity?.dueAt?.slice(0, 10) ?? "");

  useEffect(() => {
    if (activity) {
      setLeadId(activity.leadId ?? "");
      setOpportunityId(activity.opportunityId ?? "");
      setType(activity.type);
      setStatus(activity.status);
      setSubject(activity.subject);
      setDescription(activity.description ?? "");
      setDueAt(activity.dueAt?.slice(0, 10) ?? "");
      return;
    }

    if (selectedLeadId) setLeadId(selectedLeadId);
    setOpportunityId("");
    setType(1);
    setStatus(1);
    setSubject("");
    setDescription("");
    setDueAt("");
  }, [activity?.id, selectedLeadId]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      tenantId: activity?.tenantId ?? session.tenantId,
      companyId: activity?.companyId ?? session.companyId,
      leadId: leadId || null,
      opportunityId: opportunityId || null,
      customerId: activity?.customerId ?? null,
      assignedUserId: activity?.assignedUserId ?? null,
      type,
      status,
      subject,
      description: description || null,
      dueAt: dueAt || null
    };

    if (activity && onUpdate) {
      onUpdate(activity, payload);
      return;
    }

    onCreate(() => api.createCrmActivity({ ...payload, status: 1 }));
    setSubject("");
    setDescription("");
    setDueAt("");
  }

  return (
    <form className="panel quick-form" onSubmit={submit}>
      <div className="panel-title">
        <strong>{isEditing ? "Editar actividad" : "Nueva actividad"}</strong>
        {activity ? <span>{statusLabel("activity", activity.status)}</span> : <Plus size={18} />}
      </div>
      <div className="quick-form-fields">
        <FG label="Lead relacionado">
          <select value={leadId} onChange={(event) => setLeadId(event.target.value)}>
            <option value="">Sin lead</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>{lead.companyName || lead.contactName}</option>
            ))}
          </select>
        </FG>
        <FG label="Oportunidad relacionada">
          <select value={opportunityId} onChange={(event) => setOpportunityId(event.target.value)}>
            <option value="">Sin oportunidad</option>
            {opportunities.map((opportunity) => (
              <option key={opportunity.id} value={opportunity.id}>{opportunity.name}</option>
            ))}
          </select>
        </FG>
        <FG label="Tipo de actividad">
          <select value={type} onChange={(event) => setType(Number(event.target.value))}>
            <option value={1}>Llamada telefonica</option>
            <option value={2}>Correo electronico</option>
            <option value={3}>Reunion presencial</option>
            <option value={4}>Tarea</option>
            <option value={5}>Nota interna</option>
          </select>
        </FG>
        {isEditing && (
          <FG label="Estado">
            <select value={status} onChange={(event) => setStatus(Number(event.target.value))}>
              <option value={1}>Pendiente</option>
              <option value={2}>Realizada</option>
              <option value={3}>Cancelada</option>
            </select>
          </FG>
        )}
        <FG label="Asunto">
          <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Describe brevemente la actividad" required />
        </FG>
        <FG label="Descripcion adicional">
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Detalles, acuerdos, proximos pasos..." />
        </FG>
        <FG label="Fecha limite">
          <input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
        </FG>
      </div>
      <div className="action-row">
        <button className="primary-button" type="submit">
          {isEditing ? "Guardar cambios" : "Crear actividad"}
        </button>
        {activity && activity.status === 1 && onCancel && <button type="button" onClick={() => onCancel(activity)}>Cancelar actividad</button>}
      </div>
    </form>
  );
}

function QuickForm({ title, onSubmit, children }: { title: string; onSubmit: (event: FormEvent) => void; children: ReactNode }) {
  return (
    <form className="panel quick-form" onSubmit={onSubmit}>
      <div className="panel-title">
        <strong>{title}</strong>
        <Plus size={18} />
      </div>
      <div className="quick-form-fields">{children}</div>
      <button className="primary-button" type="submit">
        <Plus size={18} />
        <span>Crear</span>
      </button>
    </form>
  );
}

function FG({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {hint && <small className="form-hint">{hint}</small>}
    </div>
  );
}

function FormTabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="form-tabs-wrap">
      <div className="tabs-list" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            role="tab"
            aria-selected={i === active}
            className={i === active ? "tab-btn tab-btn-active" : "tab-btn"}
            onClick={() => setActive(i)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-panel" role="tabpanel">
        {tabs[active].content}
      </div>
    </div>
  );
}

function ReportsWorkspace({
  data,
  branches,
  selectedBranchId,
  fromDate,
  toDate,
  onBranchChange,
  onDateRangeChange,
  onExport,
  session,
  onCreateSuggestedPurchase
}: {
  data: AdminData;
  branches: Branch[];
  selectedBranchId: string;
  fromDate: string;
  toDate: string;
  onBranchChange: (branchId: string | null) => void;
  onDateRangeChange: (fromDate: string, toDate: string) => void;
  onExport: (report: string) => Promise<void>;
  session: AuthSession;
  onCreateSuggestedPurchase: (action: () => Promise<unknown>) => void;
}) {
  const dashboard = data.executiveDashboard;
  const analytics = data.predictiveAnalytics;
  const [reorderSupplierId, setReorderSupplierId] = useState("");
  const reportOptions = [
    { key: "sales", label: "Ventas" },
    { key: "products", label: "Productos" },
    { key: "inventory", label: "Inventario" },
    { key: "margins", label: "Margenes" },
    { key: "cash-movements", label: "Caja" },
    { key: "expenses", label: "Gastos" },
    { key: "purchases", label: "Compras" },
    { key: "supplier-returns", label: "Dev. suplidores" },
    { key: "receivables-aging", label: "CxC aging" },
    { key: "payables-aging", label: "CxP aging" }
  ];
  const productsById = useMemo(
    () => new Map(data.products.map((product) => [product.id, product])),
    [data.products]
  );
  const suggestedReorderItems = useMemo(
    () => (analytics?.inventory ?? [])
      .filter((item) => item.riskLevel !== "ok" && item.recommendedReorderQuantity > 0)
      .filter((item) => productsById.has(item.productId)),
    [analytics?.inventory, productsById]
  );
  const suggestedReorderTotal = suggestedReorderItems.reduce((sum, item) => {
    const product = productsById.get(item.productId);
    return sum + item.recommendedReorderQuantity * (product?.cost ?? 0) * (1 + (product?.taxRate ?? 0));
  }, 0);

  useEffect(() => {
    if (!reorderSupplierId && data.suppliers[0]?.id) {
      setReorderSupplierId(data.suppliers[0].id);
    }
  }, [data.suppliers, reorderSupplierId]);

  function createSuggestedPurchase() {
    if (!reorderSupplierId || !selectedBranchId || suggestedReorderItems.length === 0) return;
    const lines = suggestedReorderItems.map((item) => {
      const product = productsById.get(item.productId);
      return {
        productId: item.productId,
        quantity: Math.max(1, Math.ceil(item.recommendedReorderQuantity)),
        unitCost: product?.cost ?? 0,
        taxRate: product?.taxRate ?? 0,
        discount: 0
      };
    });

    onCreateSuggestedPurchase(() => api.createPurchase({
      tenantId: session.tenantId,
      companyId: session.companyId,
      branchId: selectedBranchId,
      supplierId: reorderSupplierId,
      userId: session.userId,
      notes: `Orden sugerida desde analitica predictiva (${analytics?.observationDays ?? 30} dias).`,
      supplierReference: "Reposicion sugerida",
      expectedAt: null,
      lines
    }));
  }

  return (
    <section className="reports-workspace">
      <section className="panel admin-panel report-filter-panel">
        <div className="panel-title">
          <strong>Filtros del reporte</strong>
          <span>{fromDate || "-"} / {toDate || "-"}</span>
        </div>
        <div className="report-filter-grid">
          <FG label="Sucursal">
            <select value={selectedBranchId} onChange={(event) => onBranchChange(event.target.value || null)}>
              <option value="">Todas las sucursales</option>
              {branches.length === 0 ? (
                <option value="">Sin sucursales</option>
              ) : branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </FG>
          <FG label="Desde">
            <input type="date" value={fromDate} onChange={(event) => onDateRangeChange(event.target.value, toDate)} />
          </FG>
          <FG label="Hasta">
            <input type="date" value={toDate} onChange={(event) => onDateRangeChange(fromDate, event.target.value)} />
          </FG>
        </div>
      </section>

      <section className="report-kpi-grid">
        <article className="report-kpi">
          <span>Ventas</span>
          <strong>{money.format(dashboard?.sales.totalSales ?? 0)}</strong>
          <small>{dashboard?.sales.transactionCount ?? 0} transacciones</small>
        </article>
        <article className="report-kpi">
          <span>Margen bruto</span>
          <strong>{money.format(dashboard?.margins.grossProfit ?? 0)}</strong>
          <small>{((dashboard?.margins.grossMargin ?? 0) * 100).toFixed(1)}%</small>
        </article>
        <article className="report-kpi">
          <span>Inventario</span>
          <strong>{money.format(dashboard?.inventory.estimatedCostValue ?? 0)}</strong>
          <small>{dashboard?.inventory.lowStockProducts ?? 0} bajo minimo</small>
        </article>
        <article className="report-kpi">
          <span>Flujo neto</span>
          <strong>{money.format(dashboard?.cash.net ?? 0)}</strong>
          <small>Ingresos menos egresos</small>
        </article>
      </section>

      <section className="report-kpi-grid">
        <article className="report-kpi">
          <span>Pronostico 7 dias</span>
          <strong>{money.format(analytics?.sales.projectedSales7Days ?? 0)}</strong>
          <small>{analytics?.sales.trendLabel ?? "Sin datos"} ({(analytics?.sales.trendPercent ?? 0).toFixed(1)}%)</small>
        </article>
        <article className="report-kpi">
          <span>Pronostico 30 dias</span>
          <strong>{money.format(analytics?.sales.projectedSales30Days ?? 0)}</strong>
          <small>Promedio diario {money.format(analytics?.sales.averageDailySales ?? 0)}</small>
        </article>
        <article className="report-kpi">
          <span>Inventario critico</span>
          <strong>{analytics?.inventory.filter((item) => item.riskLevel === "critical").length ?? 0}</strong>
          <small>{analytics?.inventory.filter((item) => item.riskLevel === "warning").length ?? 0} en advertencia</small>
        </article>
        <article className="report-kpi">
          <span>Periodo IA</span>
          <strong>{analytics?.observationDays ?? 30} dias</strong>
          <small>{analytics?.generatedAtUtc ? new Date(analytics.generatedAtUtc).toLocaleString("es-DO") : "Pendiente"}</small>
        </article>
      </section>

      <AdminTwoColumn>
        <DataTable
          title="Alertas predictivas"
          columns={["Tipo", "Severidad", "Detalle"]}
          rows={(analytics?.insights ?? []).map((insight) => [
            insight.title,
            analyticsSeverityLabel(insight.severity),
            insight.detail
          ])}
        />
        <DataTable
          title="Reposicion sugerida"
          columns={["Producto", "Sucursal", "Riesgo", "Dias", "Reponer"]}
          rows={(analytics?.inventory ?? []).filter((item) => item.riskLevel !== "ok").slice(0, 8).map((item) => [
            item.productName,
            item.branchName,
            inventoryRiskLabel(item.riskLevel),
            item.estimatedDaysRemaining === null || item.estimatedDaysRemaining === undefined ? "Sin consumo" : `${item.estimatedDaysRemaining}`,
            `${item.recommendedReorderQuantity}`
          ])}
        />
      </AdminTwoColumn>

      <section className="panel admin-panel">
        <div className="panel-title">
          <strong>Orden de compra sugerida</strong>
          <span>{suggestedReorderItems.length} productos</span>
        </div>
        <div className="report-filter-grid">
          <FG label="Suplidor">
            <select value={reorderSupplierId} onChange={(event) => setReorderSupplierId(event.target.value)}>
              {data.suppliers.length === 0 ? (
                <option value="">Crea un suplidor primero</option>
              ) : data.suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </FG>
          <FG label="Monto estimado">
            <input value={money.format(suggestedReorderTotal)} readOnly />
          </FG>
          <FG label="Accion">
            <button
              className="primary-button"
              disabled={!reorderSupplierId || !selectedBranchId || suggestedReorderItems.length === 0}
              type="button"
              onClick={createSuggestedPurchase}
            >
              Crear orden en borrador
            </button>
          </FG>
        </div>
        {suggestedReorderItems.length === 0 && (
          <p className="empty-state">No hay productos criticos con reposicion sugerida.</p>
        )}
      </section>

      <AdminTwoColumn>
        <section className="panel admin-panel">
          <div className="panel-title">
            <strong>Exportaciones CSV</strong>
            <span>{reportOptions.length} reportes</span>
          </div>
          <div className="export-grid">
            {reportOptions.map((option) => (
              <button key={option.key} type="button" onClick={() => onExport(option.key)}>
                {option.label}
              </button>
            ))}
          </div>
        </section>
        <DataTable
          title="Top clientes"
          columns={["Cliente", "Ventas", "Transacciones"]}
          rows={(dashboard?.customers.customers ?? []).map((customer) => [
            customer.customerName,
            money.format(customer.totalSales),
            `${customer.transactionCount}`
          ])}
        />
      </AdminTwoColumn>

      <AdminTwoColumn>
        <DataTable
          title="Ventas por dia"
          columns={["Fecha", "Transacciones", "Total"]}
          rows={(data.salesReport?.byDay ?? []).map((item) => [
            new Date(item.date).toLocaleDateString("es-DO"),
            `${item.transactionCount}`,
            money.format(item.totalSales)
          ])}
        />
        <DataTable
          title="Ventas por metodo de pago"
          columns={["Metodo", "Total"]}
          rows={(data.salesReport?.byPayment ?? []).map((item) => [
            paymentMethodLabel(item.method),
            money.format(item.total)
          ])}
        />
      </AdminTwoColumn>

      <AdminTwoColumn>
        <DataTable
          title="Ventas por usuario"
          columns={["Usuario", "Transacciones", "Total"]}
          rows={(data.salesReport?.byUser ?? []).map((item) => [
            item.userName,
            `${item.transactionCount}`,
            money.format(item.totalSales)
          ])}
        />
        <DataTable
          title="Movimientos de caja"
          columns={["Fecha", "Tipo", "Descripcion", "Monto"]}
          rows={(dashboard?.cash.items ?? []).slice(0, 12).map((item) => [
            new Date(item.createdAt).toLocaleString("es-DO"),
            cashMovementTypeLabel(item.type),
            item.description,
            money.format(item.amount)
          ])}
        />
      </AdminTwoColumn>

      <AdminTwoColumn>
        <DataTable
          title="Productos vendidos"
          columns={["Producto", "Cantidad", "Revenue", "Margen"]}
          rows={(dashboard?.products.items ?? []).slice(0, 8).map((item) => [
            item.productName,
            `${item.quantity}`,
            money.format(item.revenue),
            `${(item.grossMargin * 100).toFixed(1)}%`
          ])}
        />
        <DataTable
          title="Gastos por categoria"
          columns={["Categoria", "Cantidad", "Total"]}
          rows={(data.expenseReport?.byCategory ?? []).map((item) => [
            item.categoryName,
            `${item.count}`,
            money.format(item.total)
          ])}
        />
      </AdminTwoColumn>

      <AdminTwoColumn>
        <AgingPanel title="CxC por antiguedad" report={data.receivablesAging} />
        <AgingPanel title="CxP por antiguedad" report={data.payablesAging} />
      </AdminTwoColumn>

      <DataTable
        title="Compras por suplidor"
        columns={["Suplidor", "Compras", "Devoluciones", "Neto"]}
        rows={(data.purchaseReport?.bySupplier ?? []).map((item) => [
          item.supplierName,
          money.format(item.purchaseTotal),
          money.format(item.returnTotal),
          money.format(item.netTotal)
        ])}
      />
    </section>
  );
}

function AgingPanel({ title, report }: { title: string; report: AgingReport | null }) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>{title}</strong>
        <span>{money.format(report?.total ?? 0)}</span>
      </div>
      <div className="aging-grid">
        <article>
          <span>Actual</span>
          <strong>{money.format(report?.current ?? 0)}</strong>
        </article>
        <article>
          <span>1-30</span>
          <strong>{money.format(report?.days1To30 ?? 0)}</strong>
        </article>
        <article>
          <span>31-60</span>
          <strong>{money.format(report?.days31To60 ?? 0)}</strong>
        </article>
        <article>
          <span>61-90</span>
          <strong>{money.format(report?.days61To90 ?? 0)}</strong>
        </article>
        <article>
          <span>90+</span>
          <strong>{money.format(report?.over90 ?? 0)}</strong>
        </article>
      </div>
    </section>
  );
}

function inventoryRiskLabel(riskLevel: string) {
  return {
    critical: "Critico",
    warning: "Advertencia",
    ok: "Estable"
  }[riskLevel] ?? riskLevel;
}

function analyticsSeverityLabel(severity: string) {
  return {
    danger: "Critico",
    warning: "Advertencia",
    success: "Positivo",
    info: "Informativo"
  }[severity] ?? severity;
}

function getSummaryCards(view: AppView, data: AdminData) {
  const group = moduleGroup(view);

  if (group === "operations") {
    if (view === "operations-cash") {
      return [
        { label: "Caja", value: data.currentCash ? "Abierta" : "Cerrada" },
        { label: "Efectivo esperado", value: money.format(data.currentCash?.expectedCash ?? 0) },
        { label: "Sesiones", value: `${data.cashSessions.length}` }
      ];
    }

    if (view === "operations-fiscal") {
      return [
        { label: "Facturas", value: `${data.invoices.length}` },
        { label: "Pendientes", value: `${data.fiscalPending.length}` },
        { label: "Monto fiscal", value: money.format(data.invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0)) }
      ];
    }

    const total = data.saleHistory.reduce((sum, s) => sum + s.grandTotal, 0);
    return [
      { label: "Facturas hoy", value: `${data.saleHistory.length}` },
      { label: "Total vendido", value: money.format(total) },
      { label: "Ticket promedio", value: money.format(data.saleHistory.length > 0 ? total / data.saleHistory.length : 0) }
    ];
  }

  if (group === "customers") {
    return [
      { label: "Clientes", value: `${data.customers.length}` },
      { label: "Credito abierto", value: money.format(data.customers.reduce((sum, c) => sum + (c.creditBalance ?? 0), 0)) },
      { label: "Documentos CxC", value: `${data.receivables.length}` }
    ];
  }

  if (group === "inventory") {
    return [
      { label: "Productos", value: `${data.products.length}` },
      { label: "Unidades", value: `${data.stock.reduce((sum, item) => sum + item.quantityOnHand, 0)}` },
      { label: "Bajo minimo", value: `${data.inventoryAlerts.length}` }
    ];
  }

  if (group === "purchases") {
    return [
      { label: "Suplidores", value: `${data.suppliers.length}` },
      { label: "Compras", value: `${data.purchases.length}` },
      { label: "Devoluciones", value: `${data.purchaseReturns.length}` },
      { label: "CxP abierta", value: money.format(data.payables.reduce((sum, p) => sum + p.balance, 0)) }
    ];
  }

  if (group === "finance") {
    return [
      { label: "Cuentas", value: `${data.accounts.length}` },
      { label: "Asientos", value: `${data.journalEntries.length}` },
      { label: "Diferencia balance", value: money.format(data.trialBalance?.difference ?? 0) }
    ];
  }

  if (group === "hr") {
    return [
      { label: "Empleados", value: `${data.employees.length}` },
      { label: "Nominas", value: `${data.payrollPeriods.length}` },
      { label: "Nomina neta", value: money.format(data.payrollPeriods.reduce((sum, p) => sum + p.netPay, 0)) }
    ];
  }

  if (group === "crm") {
    return [
      { label: "Leads", value: `${data.leads.length}` },
      { label: "Pipeline", value: money.format(data.opportunities.reduce((sum, o) => sum + o.estimatedValue, 0)) },
      { label: "Actividades", value: `${data.activities.length}` }
    ];
  }

  if (group === "security") {
    return [
      { label: "Usuarios", value: `${data.users.length}` },
      { label: "Roles", value: `${data.roles.length}` },
      { label: "Sucursales", value: `${data.adminBranches.length}` }
    ];
  }

  return [
    { label: "Ventas", value: money.format(data.executiveDashboard?.sales.totalSales ?? 0) },
    { label: "Margen", value: money.format(data.executiveDashboard?.margins.grossProfit ?? 0) },
    { label: "CxC/CxP", value: money.format((data.receivablesAging?.total ?? 0) + (data.payablesAging?.total ?? 0)) }
  ];
}

function accountTypeLabel(type: number) {
  return ["", "Activo", "Pasivo", "Capital", "Ingreso", "Gasto", "Costo"][type] ?? "Cuenta";
}

function productQuantity(product?: ProductSummary) {
  return product?.totalQuantityOnHand ?? product?.quantityOnHand ?? 0;
}

function inventoryMovementLabel(type: number) {
  return {
    1: "Apertura",
    2: "Compra",
    3: "Venta",
    4: "Ajuste",
    5: "Transferencia entrada",
    6: "Transferencia salida",
    7: "Devolucion",
    8: "Devolucion suplidor"
  }[type] ?? `${type}`;
}

function employeeDepartmentRows(employees: EmployeeSummary[]) {
  const groups = new Map<string, { active: number; suspended: number; payroll: number }>();
  for (const employee of employees) {
    const key = employee.department || "Sin area";
    const current = groups.get(key) ?? { active: 0, suspended: 0, payroll: 0 };
    if (employee.status === 1) current.active += 1;
    if (employee.status === 2) current.suspended += 1;
    if (employee.status !== 3) current.payroll += employee.baseSalary;
    groups.set(key, current);
  }

  return Array.from(groups.entries()).map(([department, summary]) => [
    department,
    `${summary.active}`,
    `${summary.suspended}`,
    money.format(summary.payroll)
  ]);
}

function opportunityStageRows(opportunities: CrmOpportunitySummary[]) {
  const groups = new Map<number, { count: number; value: number }>();
  for (const opportunity of opportunities) {
    const current = groups.get(opportunity.stage) ?? { count: 0, value: 0 };
    current.count += 1;
    current.value += opportunity.estimatedValue;
    groups.set(opportunity.stage, current);
  }

  return Array.from(groups.entries()).map(([stage, summary]) => [
    statusLabel("opportunity", stage),
    `${summary.count}`,
    money.format(summary.value)
  ]);
}

function crmActivityTypeLabel(type: number) {
  return {
    1: "Llamada",
    2: "Email",
    3: "Reunion",
    4: "Tarea",
    5: "Nota"
  }[type] ?? `${type}`;
}

function statusLabel(kind: string, status: number) {
  const labels: Record<string, Record<number, string>> = {
    purchase: { 1: "Borrador", 2: "Ordenada", 3: "Recibida", 4: "Cancelada" },
    purchaseReturn: { 1: "Borrador", 2: "Confirmada", 3: "Cancelada" },
    receivable: { 1: "Abierto", 2: "Parcial", 3: "Pagado", 4: "Cancelado" },
    payable: { 1: "Abierto", 2: "Parcial", 3: "Pagado", 4: "Cancelado" },
    expense: { 1: "Borrador", 2: "Aprobado", 3: "Pagado", 4: "Cancelado" },
    journal: { 1: "Borrador", 2: "Posteado", 3: "Anulado" },
    employee: { 1: "Activo", 2: "Suspendido", 3: "Terminado" },
    payroll: { 1: "Borrador", 2: "Calculada", 3: "Posteada", 4: "Pagada", 5: "Cancelada" },
    lead: { 1: "Nuevo", 2: "Contactado", 3: "Calificado", 4: "Convertido", 5: "Perdido" },
    opportunity: { 1: "Prospeccion", 2: "Cotizada", 3: "Negociacion", 4: "Ganada", 5: "Perdida" },
    activity: { 1: "Pendiente", 2: "Realizada", 3: "Cancelada" }
  };
  return labels[kind]?.[status] ?? `${status}`;
}

function paymentMethodLabel(method: number) {
  return {
    1: "Efectivo",
    2: "Tarjeta",
    3: "Credito",
    4: "Transferencia"
  }[method] ?? `${method}`;
}

function bankTransactionStatusLabel(status: number) {
  return {
    1: "Importado",
    2: "Conciliado",
    3: "Ignorado"
  }[status] ?? `${status}`;
}

function saleStatusLabel(status: number) {
  return { 3: "Completada", 5: "Devuelta" }[status] ?? `${status}`;
}

function creditNoteModificationLabel(code: number) {
  return {
    1: "1 - Anulacion",
    2: "2 - Correccion texto",
    3: "3 - Correccion monto"
  }[code] ?? `${code}`;
}

function buildReceiptHtml(sel: SaleHistoryDetail, companyName: string): string {
  const fmt = new Intl.NumberFormat("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtMoney = (v: number) => `RD$ ${fmt.format(v)}`;
  const date = new Date(sel.createdAt);
  const dateStr = date.toLocaleDateString("es-DO", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = date.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const divider = `<div class="div">--------------------------------</div>`;
  const dividerBold = `<div class="div bold">================================</div>`;

  const totalPaid = sel.payments.reduce((s, p) => s + p.amount, 0);
  const change = totalPaid - sel.grandTotal;

  const linesHtml = sel.lines.map(l => `
    <div class="item">
      <div class="item-name">${l.productName}</div>
      <div class="item-row">
        <span>${l.quantity} x ${fmtMoney(l.unitPrice)}</span>
        <span>${fmtMoney(l.lineTotal)}</span>
      </div>
      ${l.discount > 0 ? `<div class="item-row disc"><span>Descuento</span><span>- ${fmtMoney(l.discount)}</span></div>` : ""}
    </div>`).join("");

  const paymentsHtml = sel.payments.map(p => `
    <div class="total-row">
      <span>${paymentMethodLabel(p.method)}</span>
      <span>${fmtMoney(p.amount)}</span>
    </div>`).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${sel.saleNumber}</title>
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
    <div class="company">${companyName}</div>
    <div class="branch">${sel.branchName ?? ""}</div>
  </div>
  ${dividerBold}
  <div class="meta-row"><span>Fecha:</span><span>${dateStr}</span></div>
  <div class="meta-row"><span>Hora:</span><span>${timeStr}</span></div>
  <div class="meta-row"><span>Factura:</span><span class="bold">${sel.saleNumber}</span></div>
  <div class="meta-row"><span>NCF:</span><span class="bold">${sel.localNcf ?? "PENDIENTE"}</span></div>
  <div class="meta-row"><span>Cajero:</span><span>${sel.userName ?? "-"}</span></div>
  <div class="meta-row"><span>Cliente:</span><span>${sel.customerName ?? "Consumidor Final"}</span></div>
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
    <div>¡Gracias por su compra!</div>
    <div class="small" style="margin-top:4px;">Conserve su factura para cambios</div>
    <div class="small">y devoluciones.</div>
  </div>
</body>
</html>`;
}

function SaleHistoryView({
  history,
  detail,
  creditNotes,
  selectedSaleId,
  search,
  companyName,
  page,
  totalPages,
  total,
  onPageChange,
  onSearchChange,
  onSelect,
  onReturn,
  onCreateCreditNote,
  onSearchSubmit
}: {
  history: SaleHistorySummary[];
  detail: SaleHistoryDetail | null;
  creditNotes: CreditNote[];
  selectedSaleId: string | null;
  search: string;
  companyName: string;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
  onReturn: (saleId: string, lines: { productId: string; quantity: number }[]) => Promise<void>;
  onCreateCreditNote: (payload: { modificationCode: number; reason: string; amount?: number | null }) => Promise<void>;
  onSearchSubmit: (q: string) => Promise<void>;
}) {
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isCreditNoteOpen, setIsCreditNoteOpen] = useState(false);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [creditNoteCode, setCreditNoteCode] = useState(1);
  const [creditNoteReason, setCreditNoteReason] = useState("");
  const [creditNoteAmount, setCreditNoteAmount] = useState(0);

  useEffect(() => {
    setIsReturnOpen(false);
    setIsCreditNoteOpen(false);
    setReturnQuantities({});
    setCreditNoteCode(1);
    setCreditNoteReason("");
    setCreditNoteAmount(detail?.grandTotal ?? 0);
  }, [detail?.saleId]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    onSearchSubmit(search);
  }

  function printReceipt() {
    if (!detail) return;
    printReceiptDocument(detail, companyName);
  }

  const sel = detail;
  const returnLines = sel?.lines
    .map((line) => ({ productId: line.productId, quantity: returnQuantities[line.productId] ?? 0 }))
    .filter((line) => line.quantity > 0) ?? [];

  async function submitReturn(event: FormEvent) {
    event.preventDefault();
    if (!sel || returnLines.length === 0) return;
    await onReturn(sel.saleId, returnLines);
    setIsReturnOpen(false);
    setReturnQuantities({});
  }

  async function submitCreditNote(event: FormEvent) {
    event.preventDefault();
    if (!sel || !sel.invoiceId || !creditNoteReason.trim()) return;
    await onCreateCreditNote({
      modificationCode: creditNoteCode,
      reason: creditNoteReason,
      amount: creditNoteCode === 3 ? creditNoteAmount : null
    });
    setIsCreditNoteOpen(false);
    setCreditNoteReason("");
  }

  function printCreditNote(note: CreditNote) {
    if (!sel) return;
    const win = window.open("", "_blank", "width=420,height=720");
    if (!win) return;
    win.document.write(buildCreditNoteHtml(note, sel, companyName));
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <section className="customer-workspace">
      {/* ── Lista izquierda ── */}
      <div className="customer-left">
        <section className="panel admin-panel">
          <div className="panel-title"><strong>Buscar facturas</strong></div>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, padding: "8px 0" }}>
            <input
              className="field-input"
              placeholder="Numero o cliente..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ whiteSpace: "nowrap" }}>Buscar</button>
          </form>
        </section>

        <section className="panel admin-panel">
          <div className="panel-title">
            <strong>Facturas</strong>
            <span>{history.length} registros</span>
          </div>
          <div className="customer-list">
            {history.length === 0 ? (
              <p className="empty-state">Sin facturas para mostrar.</p>
            ) : history.map((sale) => (
              <button
                key={sale.saleId}
                className={sale.saleId === selectedSaleId ? "customer-row customer-row-active" : "customer-row"}
                type="button"
                onClick={() => onSelect(sale.saleId)}
              >
                <span>
                  <strong>{sale.saleNumber}</strong>
                  <small>{sale.customerName ?? "Consumidor Final"} · {sale.branchName ?? ""}</small>
                </span>
                <span>
                  <strong>{money.format(sale.grandTotal)}</strong>
                  <small>{new Date(sale.createdAt).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })} · {saleStatusLabel(sale.status)}</small>
                </span>
              </button>
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={50}
            onPageChange={onPageChange}
          />
        </section>
      </div>

      {/* ── Vista previa derecha ── */}
      <div className="customer-right">
        {sel ? (
          <>
            {/* Previsualización del ticket */}
            <section className="panel admin-panel" style={{ display: "flex", justifyContent: "center", background: "#f5f5f5" }}>
              <div style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 12,
                background: "#fff",
                width: 280,
                padding: "12px 14px 20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                lineHeight: 1.5
              }}>
                {/* Encabezado */}
                <div style={{ textAlign: "center", marginBottom: 6 }}>
                  <div style={{ fontWeight: "bold", fontSize: 16, letterSpacing: 1 }}>{companyName}</div>
                  <div style={{ fontSize: 11 }}>{sel.branchName ?? ""}</div>
                </div>
                <div style={{ textAlign: "center", borderTop: "2px dashed #000", borderBottom: "2px dashed #000", padding: "4px 0", marginBottom: 6 }}>
                  <div style={{ fontWeight: "bold", fontSize: 14 }}>{sel.saleNumber}</div>
                  {sel.status === 5 && <div style={{ fontWeight: "bold", fontSize: 12 }}>*** DEVOLUCION ***</div>}
                </div>

                {/* Meta */}
                <ReceiptRow label="Fecha" value={new Date(sel.createdAt).toLocaleDateString("es-DO")} />
                <ReceiptRow label="Hora" value={new Date(sel.createdAt).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })} />
                <ReceiptRow label="NCF" value={sel.localNcf ?? "PENDIENTE"} />
                <ReceiptRow label="Cajero" value={sel.userName ?? "-"} />
                <ReceiptRow label="Cliente" value={sel.customerName ?? "Consumidor Final"} />

                <Divider />

                {/* Items */}
                {sel.lines.map((line, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
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

                {/* Totales */}
                <ReceiptRow label="Subtotal" value={money.format(sel.subtotal)} />
                <ReceiptRow label="ITBIS (18%)" value={money.format(sel.taxTotal)} />
                {sel.discountTotal > 0 && <ReceiptRow label="Descuento" value={`- ${money.format(sel.discountTotal)}`} />}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 14, borderTop: "1px dashed #000", marginTop: 4, paddingTop: 4 }}>
                  <span>TOTAL</span><span>{money.format(sel.grandTotal)}</span>
                </div>

                <Divider />

                {/* Pagos */}
                <div style={{ fontWeight: "bold", fontSize: 11, marginBottom: 3 }}>FORMA DE PAGO</div>
                {sel.payments.map((pmt, i) => (
                  <ReceiptRow key={i} label={paymentMethodLabel(pmt.method)} value={money.format(pmt.amount)} />
                ))}
                {sel.payments.reduce((s, p) => s + p.amount, 0) - sel.grandTotal > 0.005 && (
                  <ReceiptRow label="Cambio" value={money.format(sel.payments.reduce((s, p) => s + p.amount, 0) - sel.grandTotal)} />
                )}

                <div style={{ textAlign: "center", marginTop: 12, fontSize: 11 }}>
                  <div>¡Gracias por su compra!</div>
                  <div style={{ fontSize: 10, marginTop: 3 }}>Conserve su factura para cambios y devoluciones.</div>
                </div>
              </div>
            </section>

            <div className="action-row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
              {sel.status === 3 && (
                <button type="button" onClick={() => setIsReturnOpen((current) => !current)}>
                  {isReturnOpen ? "Cerrar devolucion" : "Registrar devolucion"}
                </button>
              )}
              {sel.invoiceId && sel.status === 3 && (
                <button type="button" onClick={() => setIsCreditNoteOpen((current) => !current)}>
                  {isCreditNoteOpen ? "Cerrar nota de credito" : "Hacer nota de credito"}
                </button>
              )}
            </div>

            {isCreditNoteOpen && sel.invoiceId && sel.status === 3 && (
              <form className="panel admin-panel" style={{ marginTop: 12 }} onSubmit={submitCreditNote}>
                <div className="panel-title">
                  <strong>Nota de credito DGII</strong>
                  <span>{sel.localNcf ?? "NCF pendiente"}</span>
                </div>
                <div className="quick-form-fields">
                  <FG label="Codigo de modificacion">
                    <select value={creditNoteCode} onChange={(event) => {
                      const next = Number(event.target.value);
                      setCreditNoteCode(next);
                      setCreditNoteAmount(next === 1 ? sel.grandTotal : 0);
                    }}>
                      <option value={1}>1 - Anula el NCF modificado</option>
                      <option value={2}>2 - Corrige texto del comprobante</option>
                      <option value={3}>3 - Corrige montos del NCF</option>
                    </select>
                  </FG>
                  {creditNoteCode === 3 && (
                    <FG label="Monto a acreditar">
                      <input
                        className="field-input"
                        max={sel.grandTotal}
                        min={0.01}
                        step="0.01"
                        type="number"
                        value={creditNoteAmount}
                        onChange={(event) => setCreditNoteAmount(Number(event.target.value))}
                      />
                    </FG>
                  )}
                  <FG label="Razon de modificacion">
                    <input
                      className="field-input"
                      maxLength={90}
                      value={creditNoteReason}
                      onChange={(event) => setCreditNoteReason(event.target.value)}
                      placeholder="Ej: anulacion, error en precio, correccion de datos"
                      required
                    />
                  </FG>
                </div>
                <div className="action-row" style={{ justifyContent: "flex-end" }}>
                  <button className="primary-button" disabled={!creditNoteReason.trim() || (creditNoteCode === 3 && creditNoteAmount <= 0)} type="submit">
                    Emitir nota de credito
                  </button>
                </div>
              </form>
            )}

            <CreditNoteTable notes={creditNotes} onPrint={printCreditNote} />

            {isReturnOpen && sel.status === 3 && (
              <form className="panel admin-panel" style={{ marginTop: 12 }} onSubmit={submitReturn}>
                <div className="panel-title">
                  <strong>Devolver articulos</strong>
                  <span>{returnLines.length} lineas</span>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table action-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Facturado</th>
                        <th>Precio</th>
                        <th>Devolver</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sel.lines.map((line) => (
                        <tr key={line.productId}>
                          <td>{line.productName}</td>
                          <td>{line.quantity}</td>
                          <td>{money.format(line.unitPrice)}</td>
                          <td>
                            <input
                              className="field-input"
                              max={Math.abs(line.quantity)}
                              min={0}
                              step="0.01"
                              type="number"
                              value={returnQuantities[line.productId] ?? 0}
                              onChange={(event) => setReturnQuantities((current) => ({
                                ...current,
                                [line.productId]: Number(event.target.value)
                              }))}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="action-row" style={{ justifyContent: "flex-end" }}>
                  <button className="primary-button" disabled={returnLines.length === 0} type="submit">
                    Confirmar devolucion
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <button className="btn-primary" onClick={printReceipt}>
                🖨&nbsp; Reimprimir factura
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state admin-empty">Selecciona una factura para ver el detalle.</div>
        )}
      </div>
    </section>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
      <span>{label}:</span><span>{value}</span>
    </div>
  );
}

function CreditNoteTable({ notes, onPrint }: { notes: CreditNote[]; onPrint: (note: CreditNote) => void }) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <strong>Notas de credito</strong>
        <span>{notes.length} registros</span>
      </div>
      {notes.length === 0 ? (
        <p className="empty-state">Sin registros para mostrar.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table action-table">
            <thead>
              <tr>
                <th>NCF</th>
                <th>Codigo</th>
                <th>Razon</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id}>
                  <td>{note.localNcf ?? note.number}</td>
                  <td>{creditNoteModificationLabel(note.modificationCode)}</td>
                  <td>{note.reason}</td>
                  <td>{money.format(note.grandTotal)}</td>
                  <td>{fiscalStatusLabel(note.fiscalStatus)}</td>
                  <td>
                    <button type="button" onClick={() => onPrint(note)}>Imprimir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />;
}
