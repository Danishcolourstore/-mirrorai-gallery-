interface DeliveryStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { label: string; emoji: string; className: string }> = {
  draft: { label: 'Draft', emoji: '📝', className: 'bg-muted text-muted-foreground' },
  editing: { label: 'Editing', emoji: '✂️', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  ready: { label: 'Ready', emoji: '✅', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  delivered: { label: 'Delivered', emoji: '📦', className: 'bg-primary/10 text-primary' },
};

export function DeliveryStatusBadge({ status, size = 'sm' }: DeliveryStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const sizeClass = size === 'md' ? 'text-[12px] px-2.5 py-1' : 'text-[10px] px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.className} ${sizeClass}`}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}

export const DELIVERY_STATUSES = ['draft', 'editing', 'ready', 'delivered'] as const;
