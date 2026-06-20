const statusColors: Record<string, string> = {
  active: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30",
  offline: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30",
  planned: "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30",
  staged: "bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30",
  failed: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30",
  inventory: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
  decommissioning: "bg-[#6B7280]/15 text-[#6B7280] border-[#6B7280]/30",
  reserved: "bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30",
  available: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30",
  deprecated: "bg-[#6B7280]/15 text-[#6B7280] border-[#6B7280]/30",
  container: "bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30",
  provisioning: "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30",
  retired: "bg-[#6B7280]/15 text-[#6B7280] border-[#6B7280]/30",
  dhcp: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
  slaac: "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30",
  closed: "bg-[#6B7280]/15 text-[#6B7280] border-[#6B7280]/30",
  disabled: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const colorClass = statusColors[status?.toLowerCase()] || "bg-surface-tertiary text-text-secondary border-border";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status?.toLowerCase() === "active" ? "bg-[#10B981]" : status?.toLowerCase() === "offline" ? "bg-[#EF4444]" : "bg-current"}`} />
      {status}
    </span>
  );
}
