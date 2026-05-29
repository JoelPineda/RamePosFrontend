import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: string;
  tone: "green" | "blue" | "amber" | "red";
  icon: LucideIcon;
};

export function KpiCard({ label, value, tone, icon: Icon }: KpiCardProps) {
  return (
    <section className={`kpi-card kpi-${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="kpi-icon-wrap">
        <Icon size={22} />
      </div>
    </section>
  );
}
