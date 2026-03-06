import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-card border border-border/50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 mt-1">{label}</p>
    </div>
  );
}
