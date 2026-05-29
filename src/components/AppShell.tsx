import {
  BarChart3,
  Building2,
  Calculator,
  ChevronDown,
  ChevronRight,
  Contact,
  LogOut,
  PackageSearch,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  UserRoundCog,
  Users
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

type PermissionRequirement = string | string[];
type NavChild = { id: AppView; label: string; permission?: PermissionRequirement };
type NavGroup = {
  id: string;
  label: string;
  icon: typeof Users;
  direct?: boolean;
  permission?: PermissionRequirement;
  children?: NavChild[];
};

export type AppView =
  | "operations" | "operations-history" | "operations-cash" | "operations-fiscal"
  | "customers-new" | "customers-accounts"
  | "inventory-categories" | "inventory-products" | "inventory-stock"
  | "purchases-suppliers" | "purchases-orders" | "purchases-returns" | "purchases-expenses"
  | "finance-accounts" | "finance-journal" | "finance-banking"
  | "hr-employees" | "hr-payroll"
  | "crm-leads" | "crm-pipeline"
  | "security-companies" | "security-subscriptions" | "security-branches" | "security-users" | "security-roles" | "security-settings" | "security-email" | "security-audit"
  | "reports";

export const viewPermissions: Partial<Record<AppView, PermissionRequirement>> = {
  operations: "operations.pos",
  "operations-history": "operations.history",
  "operations-cash": "operations.cash",
  "operations-fiscal": "operations.fiscal",
  "customers-new": "customers.create",
  "customers-accounts": "customers.receivables",
  "inventory-categories": "inventory.categories",
  "inventory-products": "inventory.products",
  "inventory-stock": "inventory.stock",
  "purchases-suppliers": "purchases.suppliers",
  "purchases-orders": "purchases.orders",
  "purchases-returns": "purchases.returns",
  "purchases-expenses": "purchases.expenses",
  "finance-accounts": "finance.accounts",
  "finance-journal": "finance.journal",
  "finance-banking": "finance.banking",
  "hr-employees": "hr.employees",
  "hr-payroll": "hr.payroll",
  "crm-leads": "crm.leads",
  "crm-pipeline": "crm.pipeline",
  "security-companies": "platform.companies",
  "security-subscriptions": "platform.subscriptions",
  "security-branches": "security.branches",
  "security-users": "security.users",
  "security-roles": "security.roles",
  "security-settings": "security.settings",
  "security-email": "security.email",
  "security-audit": "security.audit",
  reports: "reports.view"
};

export function canAccessView(view: AppView, permissions: string[]) {
  const requirement = viewPermissions[view];
  if (!requirement) return true;
  const required = Array.isArray(requirement) ? requirement : [requirement];
  return required.some((permission) => permissions.includes(permission));
}

function canAccessRequirement(requirement: PermissionRequirement | undefined, permissions: string[]) {
  if (!requirement) return true;
  const required = Array.isArray(requirement) ? requirement : [requirement];
  return required.some((permission) => permissions.includes(permission));
}

function firstView(group: NavGroup): AppView {
  return group.direct ? group.id as AppView : group.children?.[0]?.id ?? "operations";
}

export function getFirstAllowedView(permissions: string[]): AppView {
  for (const group of navGroups) {
    const visibleChildren = group.children?.filter((child) => canAccessView(child.id, permissions)) ?? [];
    if (group.direct && canAccessView(group.id as AppView, permissions)) return group.id as AppView;
    if (visibleChildren.length > 0) return visibleChildren[0].id;
  }

  return "operations";
}

const navGroups: NavGroup[] = [
  {
    id: "operations",
    label: "Operacion",
    icon: ShoppingCart,
    children: [
      { id: "operations",         label: "Punto de venta",        permission: "operations.pos" },
      { id: "operations-history", label: "Historial de facturas", permission: "operations.history" },
      { id: "operations-cash",    label: "Caja",                  permission: "operations.cash" },
      { id: "operations-fiscal",  label: "Fiscal",                permission: "operations.fiscal" }
    ]
  },
  {
    id: "customers",
    label: "Clientes",
    icon: Users,
    children: [
      { id: "customers-new",      label: "Nuevo cliente",      permission: "customers.create" },
      { id: "customers-accounts", label: "Cuentas por cobrar", permission: "customers.receivables" }
    ]
  },
  {
    id: "inventory",
    label: "Inventario",
    icon: PackageSearch,
    children: [
      { id: "inventory-categories", label: "Categorias",      permission: "inventory.categories" },
      { id: "inventory-products",   label: "Productos",       permission: "inventory.products" },
      { id: "inventory-stock",      label: "Stock y alertas", permission: "inventory.stock" }
    ]
  },
  {
    id: "purchases",
    label: "Compras",
    icon: ShoppingBag,
    children: [
      { id: "purchases-suppliers", label: "Suplidores",        permission: "purchases.suppliers" },
      { id: "purchases-orders",    label: "Ordenes de compra", permission: "purchases.orders" },
      { id: "purchases-returns",   label: "Devoluciones",      permission: "purchases.returns" },
      { id: "purchases-expenses",  label: "Gastos",            permission: "purchases.expenses" }
    ]
  },
  {
    id: "finance",
    label: "Finanzas",
    icon: Calculator,
    children: [
      { id: "finance-accounts", label: "Plan de cuentas",    permission: "finance.accounts" },
      { id: "finance-journal",  label: "Asientos / Balance", permission: "finance.journal" },
      { id: "finance-banking",  label: "Bancos",             permission: "finance.banking" }
    ]
  },
  {
    id: "hr",
    label: "RRHH",
    icon: UserRoundCog,
    children: [
      { id: "hr-employees", label: "Empleados", permission: "hr.employees" },
      { id: "hr-payroll",   label: "Nomina",    permission: "hr.payroll" }
    ]
  },
  {
    id: "crm",
    label: "CRM",
    icon: Contact,
    children: [
      { id: "crm-leads",    label: "Leads",    permission: "crm.leads" },
      { id: "crm-pipeline", label: "Pipeline", permission: "crm.pipeline" }
    ]
  },
  {
    id: "security",
    label: "Seguridad",
    icon: ShieldCheck,
    children: [
      { id: "security-companies", label: "Companias", permission: "platform.companies" },
      { id: "security-subscriptions", label: "Licencias SaaS", permission: "platform.subscriptions" },
      { id: "security-branches",  label: "Sucursales", permission: "security.branches" },
      { id: "security-users",     label: "Usuarios",  permission: "security.users" },
      { id: "security-roles",     label: "Roles",     permission: "security.roles" },
      { id: "security-settings",  label: "Configuracion", permission: "security.settings" },
      { id: "security-email",     label: "Correo SMTP", permission: "security.email" },
      { id: "security-audit",     label: "Auditoria", permission: "security.audit" }
    ]
  },
  { id: "reports", label: "Reportes", icon: BarChart3, direct: true, permission: "reports.view" }
];

function groupOf(view: AppView): string {
  const dash = view.indexOf("-");
  return dash === -1 ? view : view.slice(0, dash);
}

export function AppShell({
  children,
  onLogout,
  activeView,
  onViewChange,
  permissions
}: {
  children: ReactNode;
  onLogout: () => void;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  permissions: string[];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set([groupOf(activeView)])
  );
  const visibleGroups = navGroups
    .map((group) => {
      const visibleChildren = group.children?.filter((child) => canAccessRequirement(child.permission, permissions));
      if (group.direct) {
        return canAccessRequirement(group.permission, permissions) ? group : null;
      }

      if ((visibleChildren?.length ?? 0) === 0) {
        return null;
      }

      return { ...group, children: visibleChildren };
    })
    .filter((group): group is NavGroup => Boolean(group));
  const directGroups = visibleGroups.filter((group) => group.direct);
  const nestedGroups = visibleGroups.filter((group) => !group.direct);

  function toggle(groupId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) { next.delete(groupId); } else { next.add(groupId); }
      return next;
    });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">RP</div>
          <div>
            <strong>RAME POS</strong>
            <span>ERP + punto de venta</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Modulos del sistema">
          <span className="nav-section-label">Principal</span>

          {nestedGroups.map((group, index) => {
            const Icon = group.icon;
            const isOpen = expanded.has(group.id);
            const isGroupActive = groupOf(activeView) === group.id;
            return (
              <div key={group.id}>
                {index === 1 && <span className="nav-section-label">Administracion</span>}
              <div className="nav-group">
                <button
                  className={isGroupActive ? "nav-item nav-group-header nav-group-active" : "nav-item nav-group-header"}
                  onClick={() => toggle(group.id)}
                  aria-expanded={isOpen}
                >
                  <Icon size={17} />
                  <span>{group.label}</span>
                  {isOpen
                    ? <ChevronDown size={13} className="nav-chevron" />
                    : <ChevronRight size={13} className="nav-chevron" />}
                </button>

                {isOpen && group.children && (
                  <div className="nav-sub-list" role="group" aria-label={group.label}>
                    {group.children.map((child) => (
                      <button
                        key={child.id}
                        className={activeView === child.id ? "nav-sub-item nav-sub-item-active" : "nav-sub-item"}
                        onClick={() => onViewChange(child.id)}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </div>
            );
          })}

          {directGroups.map((group) => {
            const Icon = group.icon;
            const targetView = firstView(group);
            return (
              <button
                key={group.id}
                className={activeView === targetView ? "nav-item nav-item-active" : "nav-item"}
                onClick={() => onViewChange(targetView)}
              >
                <Icon size={17} />
                <span>{group.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="tenant-card">
          <Building2 size={17} />
          <div>
            <strong>Multiempresa</strong>
            <span>ERP web administrativo</span>
          </div>
        </div>

        <button className="nav-item sidebar-logout" title="Cerrar sesion" onClick={onLogout}>
          <LogOut size={17} />
          <span>Cerrar sesion</span>
        </button>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
