import type {
  AppNotification,
  AuthSession,
  AuditLogSummary,
  Branch,
  CheckoutReceipt,
  AdminRole,
  AdminUser,
  CashSession,
  CashSummary,
  Company,
  DashboardSnapshot,
  EmailStatus,
  ExecutiveDashboard,
  FiscalPendingDocument,
  InvoiceDetail,
  InvoiceSummary,
  NotificationResponse,
  PermissionSummary,
  PosDocumentDetail,
  PosDocumentSummary,
  PredictiveAnalytics,
  ProductSummary,
  ReturnReceipt
} from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5173/api";

const TOKEN_KEY         = "ramepos.authToken";
const REFRESH_TOKEN_KEY = "ramepos.refreshToken";

// ─── Callbacks registrados desde App.tsx ─────────────────────────────────────

type SessionRefreshedCallback = (session: AuthSession) => void;
type SessionExpiredCallback   = () => void;

let _onSessionRefreshed: SessionRefreshedCallback | null = null;
let _onSessionExpired:   SessionExpiredCallback   | null = null;

export function setSessionCallbacks(
  onRefreshed: SessionRefreshedCallback,
  onExpired:   SessionExpiredCallback
) {
  _onSessionRefreshed = onRefreshed;
  _onSessionExpired   = onExpired;
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else        localStorage.removeItem(TOKEN_KEY);
}

export function setRefreshToken(token: string | null) {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else       localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// ─── Mutex de refresh (evita N llamadas simultáneas) ─────────────────────────

let _refreshPromise: Promise<string> | null = null;

async function doTokenRefresh(): Promise<string> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error("no_refresh_token");

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken })
    });

    if (!response.ok) throw new Error("refresh_failed");

    const session = (await response.json()) as AuthSession;

    // Persiste los nuevos tokens
    localStorage.setItem(TOKEN_KEY,         session.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);

    // Notifica al store de React
    _onSessionRefreshed?.(session);

    return session.accessToken;
  })().catch((err) => {
    // Si el refresh falla: limpia tokens y notifica para redirigir a login
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    _onSessionExpired?.();
    throw err;
  }).finally(() => {
    _refreshPromise = null;
  });

  return _refreshPromise;
}

// ─── Fetcher base ─────────────────────────────────────────────────────────────

async function fetchWithAuth(url: string, init: RequestInit): Promise<Response> {
  const token = localStorage.getItem(TOKEN_KEY);
  return fetch(url, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });
}

// ─── request<T> con interceptor 401 ──────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url     = `${API_BASE_URL}${path}`;
  const headers = { "Content-Type": "application/json", ...init?.headers };
  const config  = { ...init, headers };

  let response = await fetchWithAuth(url, config);

  if (response.status === 401 && localStorage.getItem(TOKEN_KEY)) {
    const newToken = await doTokenRefresh();           // puede throw si el refresh falla
    response = await fetch(url, {
      ...config,
      headers: { ...config.headers, Authorization: `Bearer ${newToken}` }
    });
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ─── requestText con interceptor 401 (para exports PDF/CSV) ──────────────────

async function requestText(path: string, init?: RequestInit): Promise<string> {
  const url    = `${API_BASE_URL}${path}`;
  const config = { ...init, headers: { ...init?.headers } };

  let response = await fetchWithAuth(url, config);

  if (response.status === 401 && localStorage.getItem(TOKEN_KEY)) {
    const newToken = await doTokenRefresh();
    response = await fetch(url, {
      ...config,
      headers: { ...config.headers, Authorization: `Bearer ${newToken}` }
    });
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `HTTP ${response.status}`);
  }

  return response.text();
}

async function requestBlob(path: string, init?: RequestInit): Promise<Blob> {
  const url    = `${API_BASE_URL}${path}`;
  const config = { ...init, headers: { ...init?.headers } };

  let response = await fetchWithAuth(url, config);

  if (response.status === 401 && localStorage.getItem(TOKEN_KEY)) {
    const newToken = await doTokenRefresh();
    response = await fetch(url, {
      ...config,
      headers: { ...config.headers, Authorization: `Bearer ${newToken}` }
    });
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `HTTP ${response.status}`);
  }

  return response.blob();
}

async function uploadFile<T>(path: string, file: File): Promise<T> {
  const url  = `${API_BASE_URL}${path}`;
  const form = new FormData();
  form.append("file", file);

  const doUpload = (token: string | null) =>
    fetch(url, {
      method:  "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body:    form
    });

  let response = await doUpload(localStorage.getItem(TOKEN_KEY));

  if (response.status === 401 && localStorage.getItem(TOKEN_KEY)) {
    const newToken = await doTokenRefresh();
    response = await doUpload(newToken);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function reportQuery(tenantId: string, branchId?: string, fromUtc?: string, toUtc?: string) {
  return `tenantId=${tenantId}${branchId ? `&branchId=${branchId}` : ""}${fromUtc ? `&fromUtc=${fromUtc}` : ""}${toUtc ? `&toUtc=${toUtc}` : ""}`;
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  refresh: (refreshToken: string) =>
    request<AuthSession>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken })
    }),
  logout: (refreshToken: string) =>
    request<{ message: string }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken })
    }),
  forgotPassword: (email: string) =>
    request<{ message: string; developmentResetToken?: string | null }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    }),
  resetPassword: (email: string, resetToken: string, newPassword: string) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, resetToken, newPassword })
    }),
  getNotifications: (take = 20, unreadOnly = false) =>
    request<NotificationResponse>(`/notifications?take=${take}&unreadOnly=${unreadOnly}`),
  createNotification: (payload: unknown) =>
    request<AppNotification>("/notifications", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  markNotificationRead: (id: string) =>
    request<AppNotification>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () =>
    request<{ message: string }>("/notifications/read-all", { method: "PATCH" }),
  getEmailStatus: () => request<EmailStatus>("/admin/email/status"),
  sendTestEmail: (to?: string) =>
    request<{ message: string }>("/admin/email/test", {
      method: "POST",
      body: JSON.stringify({ to: to || null })
    }),
  getCompanies: () => request<Company[]>("/companies"),
  getAdminCompanies: () => request<Company[]>("/admin/companies"),
  createCompany: (payload: unknown) =>
    request<Company>("/admin/companies", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateCompany: (id: string, payload: unknown) =>
    request<Company>(`/admin/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  updateCompanySubscription: (id: string, payload: unknown) =>
    request<Company>(`/admin/companies/${id}/subscription`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  updateCompanySettings: (id: string, payload: unknown) =>
    request<Company>(`/admin/company-settings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteCompany: (id: string) => request<{ message: string }>(`/admin/companies/${id}`, { method: "DELETE" }),
  getAdminUsers: (tenantId: string, companyId?: string) =>
    request<AdminUser[]>(`/admin/users?tenantId=${tenantId}${companyId ? `&companyId=${companyId}` : ""}`),
  createUser: (payload: unknown) =>
    request<AdminUser>("/admin/users", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateUser: (id: string, payload: unknown) =>
    request<AdminUser>(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteUser: (id: string) => request<{ message: string }>(`/admin/users/${id}`, { method: "DELETE" }),
  getAdminRoles: (tenantId: string, companyId?: string) =>
    request<AdminRole[]>(`/admin/roles?tenantId=${tenantId}${companyId ? `&companyId=${companyId}` : ""}`),
  createRole: (payload: unknown) =>
    request<AdminRole>("/admin/roles", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateRole: (id: string, payload: unknown) =>
    request<AdminRole>(`/admin/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteRole: (id: string) => request<{ message: string }>(`/admin/roles/${id}`, { method: "DELETE" }),
  getPermissions: () => request<PermissionSummary[]>("/admin/permissions"),
  getAuditLogs: (
    tenantId: string,
    companyId?: string,
    q = "",
    succeeded?: boolean,
    page = 1,
    pageSize = 50
  ) =>
    request<import("../types/api").PagedResult<AuditLogSummary>>(
      `/admin/audit-logs?tenantId=${tenantId}${companyId ? `&companyId=${companyId}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}${succeeded === undefined ? "" : `&succeeded=${succeeded}`}&page=${page}&pageSize=${pageSize}`
    ),
  getAdminBranches: (tenantId: string, companyId?: string) =>
    request<Branch[]>(`/admin/branches?tenantId=${tenantId}${companyId ? `&companyId=${companyId}` : ""}`),
  createBranch: (payload: unknown) =>
    request<Branch>("/admin/branches", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateBranch: (id: string, payload: unknown) =>
    request<Branch>(`/admin/branches/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteBranch: (id: string) => request<{ message: string }>(`/admin/branches/${id}`, { method: "DELETE" }),
  getBranches: (tenantId: string) => request<Branch[]>(`/branches?tenantId=${tenantId}`),
  getProducts: (tenantId: string, branchId: string, q = "") =>
    request<ProductSummary[]>(`/products?tenantId=${tenantId}&branchId=${branchId}&q=${encodeURIComponent(q)}`),
  getPosCustomers: (tenantId: string, q = "") =>
    request<import("../types/api").CustomerSummary[]>(`/pos/customers?tenantId=${tenantId}&q=${encodeURIComponent(q)}`),
  getDashboard: (tenantId: string, branchId: string) =>
    request<DashboardSnapshot>(`/dashboard?tenantId=${tenantId}&branchId=${branchId}`),
  getExecutiveDashboard: (tenantId: string, branchId?: string, fromUtc?: string, toUtc?: string) =>
    request<ExecutiveDashboard>(`/reports/dashboard?${reportQuery(tenantId, branchId, fromUtc, toUtc)}`),
  getSalesReport: (tenantId: string, branchId?: string, fromUtc?: string, toUtc?: string) =>
    request<import("../types/api").SalesReport>(`/reports/sales?${reportQuery(tenantId, branchId, fromUtc, toUtc)}`),
  getExpenseReport: (tenantId: string, branchId?: string, fromUtc?: string, toUtc?: string) =>
    request<import("../types/api").ExpenseReport>(`/reports/expenses?${reportQuery(tenantId, branchId, fromUtc, toUtc)}`),
  getPurchaseReport: (tenantId: string, branchId?: string, fromUtc?: string, toUtc?: string) =>
    request<import("../types/api").PurchaseReport>(`/reports/purchases?${reportQuery(tenantId, branchId, fromUtc, toUtc)}`),
  getReceivablesAging: (tenantId: string) =>
    request<import("../types/api").AgingReport>(`/reports/receivables-aging?tenantId=${tenantId}`),
  getPayablesAging: (tenantId: string) =>
    request<import("../types/api").AgingReport>(`/reports/payables-aging?tenantId=${tenantId}`),
  getPredictiveAnalytics: (tenantId: string, branchId?: string, days = 30) =>
    request<PredictiveAnalytics>(`/analytics/predictions?tenantId=${tenantId}${branchId ? `&branchId=${branchId}` : ""}&days=${days}`),
  exportReportCsv: (report: string, tenantId: string, branchId?: string, fromUtc?: string, toUtc?: string) =>
    requestText(`/reports/export/${report}?${reportQuery(tenantId, branchId, fromUtc, toUtc)}`),
  getCashSessions: (tenantId: string, branchId?: string) =>
    request<CashSession[]>(`/cash/sessions?tenantId=${tenantId}${branchId ? `&branchId=${branchId}` : ""}`),
  getCurrentCashSession: (tenantId: string, branchId: string, userId?: string) =>
    request<CashSummary>(`/cash/current?tenantId=${tenantId}&branchId=${branchId}${userId ? `&userId=${userId}` : ""}`),
  openCashSession: (payload: unknown) =>
    request<CashSummary>("/cash/open", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  addCashMovement: (payload: unknown) =>
    request<CashSummary>("/cash/movements", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  closeCashSession: (id: string, payload: unknown) =>
    request<CashSummary>(`/cash/sessions/${id}/close`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getInvoices: (tenantId: string, branchId?: string, status?: number) =>
    request<InvoiceSummary[]>(
      `/invoices?tenantId=${tenantId}${branchId ? `&branchId=${branchId}` : ""}${status ? `&status=${status}` : ""}`
    ),
  getInvoice: (id: string) => request<InvoiceDetail>(`/invoices/${id}`),
  getCreditNotes: (invoiceId: string) =>
    request<import("../types/api").CreditNote[]>(`/invoices/${invoiceId}/credit-notes`),
  createCreditNote: (invoiceId: string, payload: unknown) =>
    request<import("../types/api").CreditNote>(`/invoices/${invoiceId}/credit-notes`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  markInvoiceLocalOnly: (id: string) =>
    request<InvoiceDetail>(`/invoices/${id}/local-only`, { method: "POST" }),
  getFiscalPending: (tenantId: string) =>
    request<FiscalPendingDocument[]>(`/fiscal/pending?tenantId=${tenantId}`),
  submitFiscalInvoice: (invoiceId: string) =>
    request<FiscalPendingDocument>(`/fiscal/${invoiceId}/submit`, { method: "POST" }),
  checkout: (payload: unknown) =>
    request<CheckoutReceipt>("/pos/checkout", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getSuspendedSales: (tenantId: string, branchId: string) =>
    request<PosDocumentSummary[]>(`/pos/suspended?tenantId=${tenantId}&branchId=${branchId}`),
  getQuotes: (tenantId: string, branchId: string) =>
    request<PosDocumentSummary[]>(`/pos/quotes?tenantId=${tenantId}&branchId=${branchId}`),
  getSuspendedSale: (id: string) => request<PosDocumentDetail>(`/pos/suspended/${id}`),
  getQuote: (id: string) => request<PosDocumentDetail>(`/pos/quotes/${id}`),
  saveSuspendedSale: (payload: unknown) =>
    request<PosDocumentDetail>("/pos/suspended", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  saveQuote: (payload: unknown) =>
    request<PosDocumentDetail>("/pos/quotes", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  voidSuspendedSale: (id: string) => request<{ message: string }>(`/pos/suspended/${id}`, { method: "DELETE" }),
  voidQuote: (id: string) => request<{ message: string }>(`/pos/quotes/${id}`, { method: "DELETE" }),
  registerReturn: (payload: unknown) =>
    request<ReturnReceipt>("/pos/returns", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getCustomers: (tenantId: string, q = "", page = 1, pageSize = 50) =>
    request<import("../types/api").PagedResult<import("../types/api").CustomerSummary>>(
      `/customers?tenantId=${tenantId}&q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`
    ),
  getReceivables: (tenantId: string, customerId?: string, openOnly = true) =>
    request<import("../types/api").ReceivableSummary[]>(
      `/receivables?tenantId=${tenantId}&openOnly=${openOnly}${customerId ? `&customerId=${customerId}` : ""}`
    ),
  getCustomerStatement: (customerId: string) =>
    request<import("../types/api").CustomerStatement>(`/customers/${customerId}/statement`),
  downloadCustomerImportTemplate: () =>
    requestBlob("/customers/import-template"),
  importCustomers: (file: File) =>
    uploadFile<import("../types/api").BulkImportResult>("/customers/import?updateExisting=true", file),
  recordCustomerPayment: (customerId: string, payload: unknown) =>
    request<import("../types/api").CustomerStatement>(`/customers/${customerId}/payments`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  createCustomer: (payload: unknown) =>
    request<import("../types/api").CustomerSummary>("/customers", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateCustomer: (id: string, payload: unknown) =>
    request<import("../types/api").CustomerSummary>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteCustomer: (id: string) =>
    request<{ message: string }>(`/customers/${id}`, { method: "DELETE" }),
  getAdminProducts: (tenantId: string, q = "", page = 1, pageSize = 50) =>
    request<import("../types/api").PagedResult<ProductSummary>>(
      `/admin/products?tenantId=${tenantId}&q=${encodeURIComponent(q)}&includeInactive=false&page=${page}&pageSize=${pageSize}`
    ),
  getCategories: (tenantId: string) =>
    request<import("../types/api").CategorySummary[]>(`/admin/categories?tenantId=${tenantId}`),
  getProductLookups: (tenantId: string) =>
    request<import("../types/api").ProductLookups>(`/admin/products/lookups?tenantId=${tenantId}`),
  downloadProductImportTemplate: () =>
    requestBlob("/admin/products/import-template"),
  importProducts: (file: File) =>
    uploadFile<import("../types/api").BulkImportResult>("/admin/products/import?updateExisting=true", file),
  createCategory: (payload: unknown) =>
    request<import("../types/api").CategorySummary>("/admin/categories", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateCategory: (id: string, payload: unknown) =>
    request<import("../types/api").CategorySummary>(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteCategory: (id: string) =>
    request<{ message: string }>(`/admin/categories/${id}`, { method: "DELETE" }),
  createProduct: (payload: unknown) =>
    request<ProductSummary>("/admin/products", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateProduct: (id: string, payload: unknown) =>
    request<ProductSummary>(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteProduct: (id: string) =>
    request<{ message: string }>(`/admin/products/${id}`, { method: "DELETE" }),
  uploadProductImage: async (id: string, file: File): Promise<{ imageUrl: string }> => {
    const url  = `${API_BASE_URL}/admin/products/${id}/image`;
    const form = new FormData();
    form.append("file", file);

    const doUpload = (token: string | null) =>
      fetch(url, {
        method:  "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body:    form
      });

    let response = await doUpload(localStorage.getItem(TOKEN_KEY));

    if (response.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      const newToken = await doTokenRefresh();
      response = await doUpload(newToken);
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `HTTP ${response.status}`);
    }
    return response.json() as Promise<{ imageUrl: string }>;
  },
  getInventoryStock: (tenantId: string, branchId?: string) =>
    request<import("../types/api").InventoryStockItem[]>(
      `/admin/inventory/stock?tenantId=${tenantId}${branchId ? `&branchId=${branchId}` : ""}`
    ),
  getInventoryAlerts: (tenantId: string, branchId?: string) =>
    request<import("../types/api").InventoryStockItem[]>(
      `/admin/inventory/alerts?tenantId=${tenantId}${branchId ? `&branchId=${branchId}` : ""}`
    ),
  getInventoryMovements: (tenantId: string, productId?: string, branchId?: string) =>
    request<import("../types/api").InventoryMovementSummary[]>(
      `/admin/inventory/movements?tenantId=${tenantId}${productId ? `&productId=${productId}` : ""}${branchId ? `&branchId=${branchId}` : ""}`
    ),
  getKardex: (tenantId: string, productId: string, branchId?: string) =>
    request<import("../types/api").KardexEntry[]>(
      `/admin/inventory/kardex?tenantId=${tenantId}&productId=${productId}${branchId ? `&branchId=${branchId}` : ""}`
    ),
  registerInventoryEntry: (payload: unknown) =>
    request<import("../types/api").InventoryMovementSummary>("/admin/inventory/entries", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  registerInventoryExit: (payload: unknown) =>
    request<import("../types/api").InventoryMovementSummary>("/admin/inventory/exits", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  registerInventoryAdjustment: (payload: unknown) =>
    request<import("../types/api").InventoryMovementSummary>("/admin/inventory/adjustments", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  registerInventoryTransfer: (payload: unknown) =>
    request<import("../types/api").InventoryMovementSummary[]>("/admin/inventory/transfers", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getSuppliers: (tenantId: string, q = "") =>
    request<import("../types/api").SupplierSummary[]>(`/suppliers?tenantId=${tenantId}&q=${encodeURIComponent(q)}&includeInactive=false`),
  createSupplier: (payload: unknown) =>
    request<import("../types/api").SupplierSummary>("/suppliers", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateSupplier: (id: string, payload: unknown) =>
    request<import("../types/api").SupplierSummary>(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteSupplier: (id: string) =>
    request<{ message: string }>(`/suppliers/${id}`, { method: "DELETE" }),
  getPayables: (tenantId: string, supplierId?: string, openOnly = true) =>
    request<import("../types/api").PayableSummary[]>(
      `/payables?tenantId=${tenantId}&openOnly=${openOnly}${supplierId ? `&supplierId=${supplierId}` : ""}`
    ),
  getSupplierStatement: (supplierId: string) =>
    request<import("../types/api").SupplierStatement>(`/suppliers/${supplierId}/statement`),
  recordSupplierPayment: (supplierId: string, payload: unknown) =>
    request<import("../types/api").SupplierStatement>(`/suppliers/${supplierId}/payments`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getPurchases: (tenantId: string, branchId?: string, supplierId?: string) =>
    request<import("../types/api").PurchaseSummary[]>(
      `/purchases?tenantId=${tenantId}${branchId ? `&branchId=${branchId}` : ""}${supplierId ? `&supplierId=${supplierId}` : ""}`
    ),
  getPurchase: (id: string) =>
    request<import("../types/api").PurchaseDetail>(`/purchases/${id}`),
  getPurchaseOrderDocument: (id: string) =>
    request<import("../types/api").PurchaseOrderDocument>(`/purchases/${id}/order-document`),
  createPurchase: (payload: unknown) =>
    request<import("../types/api").PurchaseDetail>("/purchases", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updatePurchase: (id: string, payload: unknown) =>
    request<import("../types/api").PurchaseDetail>(`/purchases/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  issuePurchase: (id: string, payload: unknown) =>
    request<import("../types/api").PurchaseSummary>(`/purchases/${id}/issue`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  receivePurchase: (id: string) =>
    request<import("../types/api").PurchaseSummary>(`/purchases/${id}/receive`, { method: "POST" }),
  cancelPurchase: (id: string) =>
    request<{ message: string }>(`/purchases/${id}/cancel`, { method: "POST" }),
  getPurchaseReturns: (tenantId: string, purchaseId?: string, supplierId?: string, status?: number) =>
    request<import("../types/api").PurchaseReturnSummary[]>(
      `/purchase-returns?tenantId=${tenantId}${purchaseId ? `&purchaseId=${purchaseId}` : ""}${supplierId ? `&supplierId=${supplierId}` : ""}${status ? `&status=${status}` : ""}`
    ),
  getPurchaseReturn: (id: string) =>
    request<import("../types/api").PurchaseReturnDetail>(`/purchase-returns/${id}`),
  createPurchaseReturn: (payload: unknown) =>
    request<import("../types/api").PurchaseReturnDetail>("/purchase-returns", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updatePurchaseReturn: (id: string, payload: unknown) =>
    request<import("../types/api").PurchaseReturnDetail>(`/purchase-returns/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  confirmPurchaseReturn: (id: string) =>
    request<import("../types/api").PurchaseReturnDetail>(`/purchase-returns/${id}/confirm`, { method: "POST" }),
  cancelPurchaseReturn: (id: string) =>
    request<{ message: string }>(`/purchase-returns/${id}/cancel`, { method: "POST" }),
  getExpenseCategories: (tenantId: string) =>
    request<import("../types/api").ExpenseCategorySummary[]>(`/expense-categories?tenantId=${tenantId}&includeInactive=false`),
  createExpenseCategory: (payload: unknown) =>
    request<import("../types/api").ExpenseCategorySummary>("/expense-categories", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateExpenseCategory: (id: string, payload: unknown) =>
    request<import("../types/api").ExpenseCategorySummary>(`/expense-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteExpenseCategory: (id: string) =>
    request<{ message: string }>(`/expense-categories/${id}`, { method: "DELETE" }),
  getExpenses: (tenantId: string, branchId?: string) =>
    request<import("../types/api").ExpenseSummary[]>(`/expenses?tenantId=${tenantId}${branchId ? `&branchId=${branchId}` : ""}`),
  getExpense: (id: string) =>
    request<import("../types/api").ExpenseSummary>(`/expenses/${id}`),
  createExpense: (payload: unknown) =>
    request<import("../types/api").ExpenseSummary>("/expenses", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateExpense: (id: string, payload: unknown) =>
    request<import("../types/api").ExpenseSummary>(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  approveExpense: (id: string) =>
    request<import("../types/api").ExpenseSummary>(`/expenses/${id}/approve`, { method: "POST" }),
  payExpense: (id: string, payload: unknown) =>
    request<import("../types/api").ExpenseSummary>(`/expenses/${id}/pay`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  cancelExpense: (id: string) =>
    request<{ message: string }>(`/expenses/${id}/cancel`, { method: "POST" }),
  getAccounts: (tenantId: string) => request<import("../types/api").AccountSummary[]>(`/accounting/accounts?tenantId=${tenantId}`),
  createAccount: (payload: unknown) =>
    request<import("../types/api").AccountSummary>("/accounting/accounts", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateAccount: (id: string, payload: unknown) =>
    request<import("../types/api").AccountSummary>(`/accounting/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteAccount: (id: string) =>
    request<{ message: string }>(`/accounting/accounts/${id}`, { method: "DELETE" }),
  getBankAccounts: (tenantId: string) => request<import("../types/api").BankAccountSummary[]>(`/accounting/bank-accounts?tenantId=${tenantId}`),
  createBankAccount: (payload: unknown) =>
    request<import("../types/api").BankAccountSummary>("/accounting/bank-accounts", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateBankAccount: (id: string, payload: unknown) =>
    request<import("../types/api").BankAccountSummary>(`/accounting/bank-accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  getBankTransactions: (tenantId: string, bankAccountId?: string) =>
    request<import("../types/api").BankTransactionSummary[]>(
      `/accounting/bank-transactions?tenantId=${tenantId}${bankAccountId ? `&bankAccountId=${bankAccountId}` : ""}`
    ),
  importBankTransaction: (payload: unknown) =>
    request<import("../types/api").BankTransactionSummary>("/accounting/bank-transactions", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  reconcileBankTransaction: (id: string, payload: unknown) =>
    request<import("../types/api").BankTransactionSummary>(`/accounting/bank-transactions/${id}/reconcile`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  getJournalEntries: (tenantId: string) => request<import("../types/api").JournalEntrySummary[]>(`/accounting/journal-entries?tenantId=${tenantId}`),
  getJournalEntry: (id: string) =>
    request<import("../types/api").JournalEntryDetail>(`/accounting/journal-entries/${id}`),
  createJournalEntry: (payload: unknown) =>
    request<import("../types/api").JournalEntryDetail>("/accounting/journal-entries", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateJournalEntry: (id: string, payload: unknown) =>
    request<import("../types/api").JournalEntryDetail>(`/accounting/journal-entries/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  postJournalEntry: (id: string) =>
    request<import("../types/api").JournalEntryDetail>(`/accounting/journal-entries/${id}/post`, { method: "POST" }),
  voidJournalEntry: (id: string) =>
    request<{ message: string }>(`/accounting/journal-entries/${id}/void`, { method: "POST" }),
  getTrialBalance: (tenantId: string) => request<import("../types/api").TrialBalanceSummary>(`/accounting/trial-balance?tenantId=${tenantId}`),
  getGeneralLedger: (accountId: string) => request<import("../types/api").GeneralLedger>(`/accounting/ledger/${accountId}`),
  getEmployees: (tenantId: string, q = "") =>
    request<import("../types/api").EmployeeSummary[]>(`/hr/employees?tenantId=${tenantId}&q=${encodeURIComponent(q)}`),
  createEmployee: (payload: unknown) =>
    request<import("../types/api").EmployeeSummary>("/hr/employees", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateEmployee: (id: string, payload: unknown) =>
    request<import("../types/api").EmployeeSummary>(`/hr/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  terminateEmployee: (id: string) =>
    request<{ message: string }>(`/hr/employees/${id}`, { method: "DELETE" }),
  getPayrollPeriods: (tenantId: string) => request<import("../types/api").PayrollPeriodSummary[]>(`/hr/payroll-periods?tenantId=${tenantId}`),
  getPayrollPeriod: (id: string) =>
    request<import("../types/api").PayrollPeriodDetail>(`/hr/payroll-periods/${id}`),
  createPayrollPeriod: (payload: unknown) =>
    request<import("../types/api").PayrollPeriodDetail>("/hr/payroll-periods", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updatePayrollPeriod: (id: string, payload: unknown) =>
    request<import("../types/api").PayrollPeriodDetail>(`/hr/payroll-periods/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  cancelPayrollPeriod: (id: string) =>
    request<{ message: string }>(`/hr/payroll-periods/${id}/cancel`, { method: "POST" }),
  calculatePayrollPeriod: (id: string, payload: unknown) =>
    request<import("../types/api").PayrollPeriodDetail>(`/hr/payroll-periods/${id}/calculate`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  postPayrollPeriod: (id: string) =>
    request<import("../types/api").PayrollPeriodDetail>(`/hr/payroll-periods/${id}/post`, { method: "POST" }),
  payPayrollPeriod: (id: string) =>
    request<import("../types/api").PayrollPeriodDetail>(`/hr/payroll-periods/${id}/pay`, { method: "POST" }),
  getCrmLeads: (tenantId: string, q = "") =>
    request<import("../types/api").CrmLeadSummary[]>(`/crm/leads?tenantId=${tenantId}&q=${encodeURIComponent(q)}`),
  createCrmLead: (payload: unknown) =>
    request<import("../types/api").CrmLeadSummary>("/crm/leads", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateCrmLead: (id: string, payload: unknown) =>
    request<import("../types/api").CrmLeadSummary>(`/crm/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  convertCrmLead: (id: string, payload: unknown) =>
    request<{ lead: import("../types/api").CrmLeadSummary; customerId: string; opportunity?: import("../types/api").CrmOpportunitySummary }>(`/crm/leads/${id}/convert`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getCrmOpportunities: (tenantId: string) =>
    request<import("../types/api").CrmOpportunitySummary[]>(`/crm/opportunities?tenantId=${tenantId}`),
  createCrmOpportunity: (payload: unknown) =>
    request<import("../types/api").CrmOpportunitySummary>("/crm/opportunities", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateCrmOpportunity: (id: string, payload: unknown) =>
    request<import("../types/api").CrmOpportunitySummary>(`/crm/opportunities/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  getCrmActivities: (tenantId: string) => request<import("../types/api").CrmActivitySummary[]>(`/crm/activities?tenantId=${tenantId}`),
  createCrmActivity: (payload: unknown) =>
    request<import("../types/api").CrmActivitySummary>("/crm/activities", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateCrmActivity: (id: string, payload: unknown) =>
    request<import("../types/api").CrmActivitySummary>(`/crm/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  completeCrmActivity: (id: string) =>
    request<import("../types/api").CrmActivitySummary>(`/crm/activities/${id}/complete`, { method: "POST" }),
  cancelCrmActivity: (id: string) =>
    request<import("../types/api").CrmActivitySummary>(`/crm/activities/${id}/cancel`, { method: "POST" }),
  getSaleHistory: (tenantId: string, branchId?: string, q?: string, fromUtc?: string, toUtc?: string, page = 1, pageSize = 50) =>
    request<import("../types/api").PagedResult<import("../types/api").SaleHistorySummary>>(
      `/pos/history?tenantId=${tenantId}${branchId ? `&branchId=${branchId}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}${fromUtc ? `&fromUtc=${fromUtc}` : ""}${toUtc ? `&toUtc=${toUtc}` : ""}&page=${page}&pageSize=${pageSize}`
    ),
  getSaleHistoryDetail: (id: string) =>
    request<import("../types/api").SaleHistoryDetail>(`/pos/history/${id}`)
};
