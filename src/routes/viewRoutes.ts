import type { AppView } from "../components/AppShell";

/**
 * Mapeo canónico entre AppView y ruta URL.
 * Mantener sincronizado con navGroups en AppShell.tsx.
 */
export const VIEW_PATHS: Record<AppView, string> = {
  "operations":           "/pos",
  "operations-history":   "/pos/history",
  "operations-cash":      "/pos/cash",
  "operations-fiscal":    "/pos/fiscal",
  "customers-new":        "/customers/new",
  "customers-accounts":   "/customers/accounts",
  "inventory-categories": "/inventory/categories",
  "inventory-products":   "/inventory/products",
  "inventory-stock":      "/inventory/stock",
  "purchases-suppliers":  "/purchases/suppliers",
  "purchases-orders":     "/purchases/orders",
  "purchases-returns":    "/purchases/returns",
  "purchases-expenses":   "/purchases/expenses",
  "finance-accounts":     "/finance/accounts",
  "finance-journal":      "/finance/journal",
  "finance-banking":      "/finance/banking",
  "hr-employees":         "/hr/employees",
  "hr-payroll":           "/hr/payroll",
  "crm-leads":            "/crm/leads",
  "crm-pipeline":         "/crm/pipeline",
  "security-companies":   "/admin/companies",
  "security-subscriptions": "/admin/subscriptions",
  "security-branches":    "/admin/branches",
  "security-users":       "/admin/users",
  "security-roles":       "/admin/roles",
  "security-settings":    "/admin/settings",
  "security-email":       "/admin/email",
  "security-audit":       "/admin/audit",
  "reports":              "/reports",
};

const PATH_TO_VIEW = new Map<string, AppView>(
  (Object.entries(VIEW_PATHS) as [AppView, string][]).map(([view, path]) => [path, view])
);

/** Devuelve la AppView correspondiente al pathname actual, o null si no hay match. */
export function pathToView(pathname: string): AppView | null {
  return PATH_TO_VIEW.get(pathname) ?? null;
}

/** Devuelve la ruta URL para una AppView dada. */
export function viewToPath(view: AppView): string {
  return VIEW_PATHS[view] ?? "/pos";
}
