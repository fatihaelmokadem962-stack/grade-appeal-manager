import { useAuth } from "@/lib/auth-context";
import { useComplaints } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: complaints = [], isLoading } = useComplaints({ studentId: user?.id });

  if (!user) return null;

  const pending = complaints.filter(c => c.status === "pending").length;
  const accepted = complaints.filter(c => c.status === "accepted").length;
  const rejected = complaints.filter(c => c.status === "rejected").length;

  const stats = [
    { label: "Total", value: complaints.length, icon: FileText, color: "text-primary" },
    { label: "En attente", value: pending, icon: Clock, color: "text-warning" },
    { label: "Acceptées", value: accepted, icon: CheckCircle2, color: "text-success" },
    { label: "Rejetées", value: rejected, icon: XCircle, color: "text-destructive" },
  ];

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Bonjour, {user.firstName} 👋</h1>
        <p className="text-muted-foreground mt-1">Voici un résumé de vos réclamations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Réclamations récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Aucune réclamation pour le moment</p>
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{(c as any).subject?.name}</p>
                    <p className="text-xs text-muted-foreground">Prof. {(c as any).teacher?.last_name} · Note: {c.grade}/20</p>
                  </div>
                  <StatusBadge status={c.status as any} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
