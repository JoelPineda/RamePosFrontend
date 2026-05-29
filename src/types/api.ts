// ─── Paginación ───────────────────────────────────────────────────────────────

export type PagedResult<T> = {
  items:      T[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
};

export type BulkImportRowError = {
  rowNumber: number;
  message: string;
};

export type BulkImportResult = {
  totalRows: number;
  created: number;
  updated: number;
  failed: number;
  errors: BulkImportRowError[];
};

export type Company = {
  id: string;
  tenantId: string;
  name: string;
  tradeName?: string;
  taxId?: string;
  fiscalAddress?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  currencyCode?: string;
  defaultTaxRate?: number;
  receiptHeader?: string;
  receiptFooter?: string;
  receiptPaperWidthMm?: number;
  enableFiscalReceipts?: boolean;
  consumerFinalNcfPrefix?: string;
  taxCreditNcfPrefix?: string;
  nextConsumerFinalNcf?: number;
  nextTaxCreditNcf?: number;
  invoiceLegalText?: string;
  subscriptionPlanName?: string;
  subscriptionStatus?: string;
  subscriptionBillingMode?: string;
  subscriptionExpiresAt?: string;
  enabledModules?: string[];
  monthlySubscriptionAmount?: number;
  perpetualLicenseAmount?: number;
  lastPaymentAt?: string;
  subscriptionNotes?: string;
  isActive?: boolean;
};

export type AdminUser = {
  id: string;
  tenantId: string;
  companyId: string;
  fullName: string;
  email: string;
  isActive: boolean;
  accessFailedCount?: number;
  lockoutEndAt?: string;
  lastLoginAt?: string;
  lastPasswordChangedAt?: string;
  roles: string[];
};

export type AdminRole = {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: string[];
};

export type PermissionSummary = {
  id: string;
  code: string;
  module: string;
  description: string;
};

export type AuditLogSummary = {
  id: string;
  tenantId?: string;
  companyId?: string;
  userId?: string;
  email?: string;
  action: string;
  method: string;
  path: string;
  statusCode: number;
  ipAddress?: string;
  userAgent?: string;
  succeeded: boolean;
  createdAt: string;
};

export type EmailStatus = {
  isConfigured: boolean;
  smtpHost: string;
  smtpPort: number;
  useSsl: boolean;
  fromAddress: string;
  fromName: string;
  frontendBaseUrl: string;
};

export type AppNotification = {
  id: string;
  tenantId: string;
  companyId: string;
  userId?: string;
  permissionCode?: string;
  kind: "info" | "success" | "warning" | "danger" | string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
};

export type NotificationResponse = {
  items: AppNotification[];
  unread: number;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  userId: string;
  tenantId: string;
  companyId: string;
  companyName: string;
  userName: string;
  roles: string[];
  permissions: string[];
};

export type Branch = {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  code?: string;
  address?: string;
  isMain: boolean;
  isActive?: boolean;
};

export type ProductSummary = {
  id: string;
  tenantId?: string;
  companyId?: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  barcode?: string;
  brand?: string;
  unit?: string;
  cost?: number;
  price: number;
  wholesalePrice?: number;
  taxRate: number;
  quantityOnHand: number;
  minimumStock: number;
  imageUrl?: string;
  isActive?: boolean;
  totalQuantityOnHand?: number;
};

export type CategorySummary = {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  description?: string;
  productCount: number;
};

export type ProductLookups = {
  categories: CategorySummary[];
  brands: string[];
  units: string[];
};

export type DashboardSnapshot = {
  todaySales: number;
  todayTransactions: number;
  stockUnits: number;
  lowStockProducts: number;
  lifetimeSales: number;
};

export type ExecutiveDashboard = {
  sales: SalesReport;
  products: ProductSalesReport;
  inventory: InventoryReport;
  margins: MarginReport;
  cash: CashMovementReport;
  customers: TopCustomersReport;
};

export type PredictiveAnalytics = {
  generatedAtUtc: string;
  observationDays: number;
  sales: SalesForecast;
  inventory: InventoryForecastItem[];
  insights: AnalyticsInsight[];
};

export type SalesForecast = {
  totalSales: number;
  previousPeriodSales: number;
  transactionCount: number;
  averageTicket: number;
  averageDailySales: number;
  trendPercent: number;
  projectedSales7Days: number;
  projectedSales30Days: number;
  trendLabel: string;
};

export type InventoryForecastItem = {
  productId: string;
  productName: string;
  branchId: string;
  branchName: string;
  quantityOnHand: number;
  minimumStock: number;
  averageDailyUnitsSold: number;
  estimatedDaysRemaining?: number | null;
  recommendedReorderQuantity: number;
  riskLevel: string;
};

export type AnalyticsInsight = {
  type: string;
  severity: string;
  title: string;
  detail: string;
  value?: number | null;
};

export type ReportRange = {
  fromUtc: string;
  toUtc: string;
};

export type SalesReport = {
  range?: ReportRange;
  totalSales: number;
  totalTax: number;
  totalDiscount: number;
  transactionCount: number;
  averageTicket: number;
  byDay?: DailySales[];
  byUser?: UserSales[];
  byPayment?: PaymentSales[];
};

export type DailySales = {
  date: string;
  totalSales: number;
  transactionCount: number;
};

export type UserSales = {
  userId: string;
  userName: string;
  totalSales: number;
  transactionCount: number;
};

export type PaymentSales = {
  method: number;
  total: number;
};

export type ProductSalesReport = {
  range?: ReportRange;
  totalQuantity: number;
  totalRevenue: number;
  items: ProductSalesItem[];
};

export type ProductSalesItem = {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  grossProfit: number;
  grossMargin: number;
};

export type InventoryReport = {
  branchId?: string;
  totalUnits: number;
  estimatedCostValue: number;
  lowStockProducts: number;
  items?: InventoryReportItem[];
};

export type InventoryReportItem = {
  productId: string;
  productName: string;
  barcode?: string;
  branchId: string;
  branchName: string;
  quantityOnHand: number;
  minimumStock: number;
  unitCost: number;
  estimatedCostValue: number;
  isLowStock: boolean;
};

export type MarginReport = {
  range?: ReportRange;
  revenue: number;
  estimatedCost: number;
  grossProfit: number;
  grossMargin: number;
  items?: ProductSalesItem[];
};

export type CashMovementReport = {
  range?: ReportRange;
  income: number;
  expenses: number;
  net: number;
  items?: CashMovementReportItem[];
};

export type CashMovementReportItem = {
  id: string;
  cashRegisterSessionId: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
};

export type CashSession = {
  id: string;
  tenantId: string;
  companyId: string;
  branchId: string;
  userId: string;
  openedAt: string;
  closedAt?: string;
  openingAmount: number;
  closingAmount?: number;
  expectedCash: number;
  difference: number;
  isOpen: boolean;
};

export type CashMovement = {
  id: string;
  cashRegisterSessionId: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
};

export type CashSummary = {
  session: CashSession;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  creditSales: number;
  manualIncome: number;
  expenses: number;
  expectedCash: number;
  movements: CashMovement[];
};

export type TopCustomersReport = {
  range?: ReportRange;
  customers: TopCustomer[];
};

export type TopCustomer = {
  customerId?: string;
  customerName: string;
  totalSales: number;
  transactionCount: number;
};

export type ExpenseReport = {
  range: ReportRange;
  draftTotal: number;
  approvedTotal: number;
  paidTotal: number;
  cancelledTotal: number;
  byCategory: ExpenseCategoryTotal[];
};

export type ExpenseCategoryTotal = {
  categoryId: string;
  categoryName: string;
  total: number;
  count: number;
};

export type PurchaseReport = {
  range: ReportRange;
  orderedTotal: number;
  receivedTotal: number;
  returnedTotal: number;
  netTotal: number;
  bySupplier: SupplierPurchaseTotal[];
};

export type SupplierPurchaseTotal = {
  supplierId: string;
  supplierName: string;
  purchaseTotal: number;
  returnTotal: number;
  netTotal: number;
  count: number;
};

export type AgingReport = {
  generatedAtUtc: string;
  accountType: string;
  current: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  over90: number;
  total: number;
  items: AgingReportItem[];
};

export type AgingReportItem = {
  id: string;
  entityId: string;
  entityName: string;
  documentNumber: string;
  issuedAt: string;
  dueAt: string;
  amount: number;
  paidAmount: number;
  balance: number;
  daysOverdue: number;
  bucket: string;
};

export type CheckoutReceipt = {
  saleId: string;
  saleNumber: string;
  invoiceNumber: string;
  documentType: number;
  localNcf?: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  changeDue: number;
  fiscalStatus: string;
};

export type CreditNote = {
  id: string;
  invoiceId: string;
  saleId: string;
  userId: string;
  number: string;
  localNcf?: string;
  originalNcf?: string;
  modificationCode: number;
  reason: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  fiscalStatus: number;
  fiscalTrackId?: string;
  issuedAt: string;
};

export type PosPaymentInput = {
  method: number;
  amount: number;
  reference?: string;
};

export type PosDocumentSummary = {
  id: string;
  number: string;
  branchId: string;
  customerId?: string;
  customerName?: string;
  grandTotal: number;
  lineCount: number;
  createdAt: string;
};

export type PosDocumentDetail = {
  id: string;
  number: string;
  tenantId: string;
  companyId: string;
  branchId: string;
  userId: string;
  customerId?: string;
  customerName?: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  lines: PosDocumentLine[];
  createdAt: string;
};

export type PosDocumentLine = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  lineTotal: number;
};

export type ReturnReceipt = {
  saleId: string;
  saleNumber: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: string;
};

export type InvoiceSummary = {
  id: string;
  saleId: string;
  internalNumber: string;
  documentType: number;
  localNcf?: string;
  issuedAt: string;
  fiscalStatus: number;
  fiscalTrackId?: string;
  saleNumber: string;
  grandTotal: number;
};

export type InvoiceDetail = {
  id: string;
  tenantId: string;
  companyId: string;
  saleId: string;
  internalNumber: string;
  documentType: number;
  localNcf?: string;
  issuedAt: string;
  fiscalStatus: number;
  fiscalTrackId?: string;
  company: {
    id: string;
    name: string;
    tradeName?: string;
    taxId?: string;
    fiscalAddress?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    currencyCode?: string;
    receiptHeader?: string;
    receiptFooter?: string;
    receiptPaperWidthMm?: number;
    invoiceLegalText?: string;
  };
  sale: {
    number: string;
    branchId: string;
    customerId?: string;
    customerName?: string;
    subtotal: number;
    taxTotal: number;
    discountTotal: number;
    grandTotal: number;
  };
  lines: SaleHistoryLine[];
  payments: SaleHistoryPayment[];
};

export type FiscalPendingDocument = {
  id: string;
  internalNumber: string;
  documentType: number;
  localNcf?: string;
  issuedAt: string;
  status: string;
};

export type SaleHistorySummary = {
  saleId: string;
  saleNumber: string;
  invoiceId?: string;
  localNcf?: string;
  customerId?: string;
  customerName?: string;
  userId: string;
  userName?: string;
  branchId: string;
  branchName?: string;
  status: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  lineCount: number;
  createdAt: string;
};

export type SaleHistoryDetail = {
  saleId: string;
  saleNumber: string;
  invoiceId?: string;
  localNcf?: string;
  customerId?: string;
  customerName?: string;
  userId: string;
  userName?: string;
  branchId: string;
  branchName?: string;
  status: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  lines: SaleHistoryLine[];
  payments: SaleHistoryPayment[];
  createdAt: string;
};

export type SaleHistoryLine = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  lineTotal: number;
};

export type SaleHistoryPayment = {
  method: number;
  amount: number;
  reference?: string;
};

export type CustomerSummary = {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  phone?: string;
  email?: string;
  taxId?: string;
  type: number;
  creditLimit: number;
  creditBalance: number;
  availableCredit: number;
};

export type ReceivableSummary = {
  id: string;
  tenantId: string;
  companyId: string;
  customerId: string;
  customerName: string;
  saleId: string;
  documentNumber: string;
  issuedAt: string;
  dueAt: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: number;
  isOverdue: boolean;
};

export type CustomerPaymentSummary = {
  id: string;
  customerId: string;
  customerReceivableId?: string;
  method: number;
  amount: number;
  reference?: string;
  notes?: string;
  createdAt: string;
};

export type CustomerStatement = {
  customerId: string;
  customerName: string;
  creditLimit: number;
  creditBalance: number;
  availableCredit: number;
  receivables: ReceivableSummary[];
  payments: CustomerPaymentSummary[];
};

export type SupplierSummary = {
  id: string;
  tenantId?: string;
  companyId?: string;
  name: string;
  taxId?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  paymentTermsDays?: number;
  creditLimit?: number;
  balance: number;
  isActive: boolean;
};

export type PayableSummary = {
  id: string;
  tenantId: string;
  companyId: string;
  supplierId: string;
  supplierName: string;
  purchaseId: string;
  documentNumber: string;
  issuedAt: string;
  dueAt: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: number;
  isOverdue: boolean;
};

export type SupplierPaymentSummary = {
  id: string;
  supplierId: string;
  supplierPayableId?: string;
  method: number;
  amount: number;
  reference?: string;
  notes?: string;
  createdAt: string;
};

export type SupplierStatement = {
  supplierId: string;
  supplierName: string;
  creditLimit: number;
  balance: number;
  availableCredit: number;
  payables: PayableSummary[];
  payments: SupplierPaymentSummary[];
};

export type InventoryStockItem = {
  productId: string;
  productName: string;
  barcode?: string;
  categoryId: string;
  categoryName?: string;
  branchId: string;
  branchName: string;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStock: number;
  isLowStock: boolean;
};

export type InventoryMovementSummary = {
  id: string;
  tenantId: string;
  companyId: string;
  branchId: string;
  branchName?: string;
  productId: string;
  productName?: string;
  type: number;
  quantity: number;
  unitCost: number;
  reference?: string;
  notes?: string;
  createdAt: string;
};

export type KardexEntry = {
  movementId: string;
  createdAt: string;
  branchId: string;
  branchName?: string;
  type: number;
  quantity: number;
  unitCost: number;
  balance: number;
  reference?: string;
  notes?: string;
};

export type PurchaseSummary = {
  id: string;
  tenantId?: string;
  companyId?: string;
  branchId?: string;
  supplierId?: string;
  number: string;
  supplierName?: string;
  status: number;
  orderedAt?: string;
  expectedAt?: string;
  approvedAt?: string;
  receivedAt?: string;
  cancelledAt?: string;
  subtotal?: number;
  taxTotal?: number;
  discountTotal?: number;
  grandTotal: number;
  supplierReference?: string;
  notes?: string;
  createdAt?: string;
};

export type PurchaseLine = {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  taxRate: number;
  discount: number;
  lineTotal: number;
};

export type PurchaseDetail = {
  purchase: PurchaseSummary;
  lines: PurchaseLine[];
};

export type PurchaseOrderDocument = {
  purchase: PurchaseSummary;
  supplierName: string;
  supplierTaxId?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  branchName: string;
  branchCode?: string;
  notes?: string;
  lines: PurchaseLine[];
};

export type PurchaseReturnSummary = {
  id: string;
  tenantId: string;
  companyId: string;
  purchaseId: string;
  branchId: string;
  supplierId: string;
  supplierName?: string;
  userId: string;
  number: string;
  status: number;
  createdAtUtc: string;
  confirmedAt?: string;
  cancelledAt?: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  reason?: string;
  supplierCreditNote?: string;
};

export type PurchaseReturnLine = {
  purchaseLineId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  taxRate: number;
  discount: number;
  lineTotal: number;
};

export type PurchaseReturnDetail = {
  return: PurchaseReturnSummary;
  lines: PurchaseReturnLine[];
};

export type ExpenseCategorySummary = {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
};

export type ExpenseSummary = {
  id: string;
  tenantId?: string;
  companyId?: string;
  branchId?: string;
  userId?: string;
  expenseCategoryId?: string;
  categoryName: string;
  cashRegisterSessionId?: string;
  cashMovementId?: string;
  number: string;
  description: string;
  vendorName?: string;
  documentNumber?: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: number;
  expenseDate: string;
  dueAt?: string;
  paymentMethod?: number;
  reference?: string;
  notes?: string;
  approvedAt?: string;
  paidAt?: string;
  cancelledAt?: string;
};

export type AccountSummary = {
  id: string;
  tenantId?: string;
  companyId?: string;
  code: string;
  name: string;
  type: number;
  parentAccountId?: string;
  isCashAccount: boolean;
  isActive: boolean;
};

export type BankAccountSummary = {
  id: string;
  tenantId: string;
  companyId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  currency: string;
  accountingAccountId?: string;
  accountingAccountName?: string;
  openingBalance: number;
  openingBalanceDate: string;
  currentBalance: number;
  importedTransactions: number;
  reconciledTransactions: number;
  isActive: boolean;
};

export type BankTransactionSummary = {
  id: string;
  tenantId: string;
  companyId: string;
  bankAccountId: string;
  bankAccountName: string;
  transactionDate: string;
  postedAt?: string;
  description: string;
  reference?: string;
  amount: number;
  balanceAfter?: number;
  status: number;
  matchedJournalEntryId?: string;
  notes?: string;
};

export type JournalEntrySummary = {
  id: string;
  tenantId?: string;
  companyId?: string;
  number: string;
  entryDate: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  status: number;
  totalDebit: number;
  totalCredit: number;
  postedAt?: string;
  voidedAt?: string;
};

export type JournalEntryLine = {
  accountId: string;
  accountCode: string;
  accountName: string;
  description?: string;
  debit: number;
  credit: number;
};

export type JournalEntryDetail = {
  entry: JournalEntrySummary;
  lines: JournalEntryLine[];
};

export type TrialBalanceLine = {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: number;
  debit: number;
  credit: number;
  balance: number;
};

export type TrialBalanceSummary = {
  fromUtc: string;
  toUtc: string;
  totalDebit: number;
  totalCredit: number;
  difference: number;
  lines: TrialBalanceLine[];
};

export type GeneralLedgerLine = {
  journalEntryId: string;
  number: string;
  entryDate: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  debit: number;
  credit: number;
  runningBalance: number;
};

export type GeneralLedger = {
  accountId: string;
  accountCode: string;
  accountName: string;
  fromUtc: string;
  toUtc: string;
  debit: number;
  credit: number;
  balance: number;
  lines: GeneralLedgerLine[];
};

export type EmployeeSummary = {
  id: string;
  tenantId?: string;
  companyId?: string;
  branchId?: string;
  code: string;
  fullName: string;
  documentId?: string;
  phone?: string;
  email?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  terminationDate?: string;
  baseSalary: number;
  paymentMethod?: number;
  bankAccount?: string;
  status: number;
};

export type PayrollPeriodSummary = {
  id: string;
  tenantId?: string;
  companyId?: string;
  number: string;
  name: string;
  fromDate?: string;
  toDate?: string;
  payDate?: string;
  status: number;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  calculatedAt?: string;
  postedAt?: string;
  paidAt?: string;
};

export type PayrollLine = {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  baseSalary: number;
  daysWorked: number;
  regularPay: number;
  overtimePay: number;
  bonus: number;
  deductions: number;
  netPay: number;
  notes?: string;
};

export type PayrollPeriodDetail = {
  period: PayrollPeriodSummary;
  lines: PayrollLine[];
};

export type CrmLeadSummary = {
  id: string;
  tenantId?: string;
  companyId?: string;
  assignedUserId?: string;
  customerId?: string;
  companyName?: string;
  contactName: string;
  phone?: string;
  email?: string;
  source?: string;
  status: number;
  estimatedValue: number;
  notes?: string;
  nextFollowUpAt?: string;
  convertedAt?: string;
};

export type CrmOpportunitySummary = {
  id: string;
  tenantId?: string;
  companyId?: string;
  leadId?: string;
  customerId?: string;
  assignedUserId?: string;
  name: string;
  stage: number;
  estimatedValue: number;
  expectedCloseDate?: string;
  closedAt?: string;
  notes?: string;
};

export type CrmActivitySummary = {
  id: string;
  tenantId?: string;
  companyId?: string;
  leadId?: string;
  opportunityId?: string;
  customerId?: string;
  assignedUserId?: string;
  subject: string;
  type: number;
  status: number;
  description?: string;
  dueAt?: string;
  completedAt?: string;
};
