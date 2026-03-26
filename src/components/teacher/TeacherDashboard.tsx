import { useAuth } from "@/lib/auth-context";
import { getComplaintsByTeacher, getSubjectById, getUserById } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const complaints = getComplaintsByTeacher(user.id);
  const pending = complaints.filter(c => c.status === "pending").length;
  const accepted = complaints.filter(c => c.status === "accepted").length;
  const rejected = complaints.filter(c => c.status === "rejected").length;

  const stats = [
    { label: "Total", value: complaints.length, icon: FileText, color: "text-primary" },
    { label: "En attente", value: pending, icon: Clock, color: "text-warning" },
    { label: "Acceptées", value: accepted, icon: CheckCircle2, color: "text-success" },
    { label: "Rejetées", value: rejected, icon: XCircle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Bonjour, Prof. {user.lastName} 👋</h1>
        <p className="text-muted-foreground mt-1">Voici un résumé des réclamations de vos matières</p>
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
    </div>
  );
}
