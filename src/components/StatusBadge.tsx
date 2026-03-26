import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "pending" | "accepted" | "rejected";
}

const config = {
  pending: { label: "En attente", className: "bg-warning/15 text-warning border-warning/30" },
  accepted: { label: "Acceptée", className: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Rejetée", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const c = config[status];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}
