import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: number;
}

export function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && (
          <p className={`text-xs mt-1 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
            {trend >= 0 ? "+" : ""}
            {trend}% from last period
          </p>
        )}
      </div>
    </div>
  );
}
