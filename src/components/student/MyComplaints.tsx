import { useAuth } from "@/lib/auth-context";
import { useComplaints } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { MessageSquare, Loader2 } from "lucide-react";

export default function MyComplaints() {
  const { user } = useAuth();
  const { data: complaints = [], isLoading } = useComplaints({ studentId: user?.id });

  if (!user) return null;

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Mes réclamations</h1>
        <p className="text-muted-foreground mt-1">Historique et suivi de vos réclamations</p>
      </div>

      {complaints.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Vous n'avez aucune réclamation</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map(c => (
            <Card key={c.id} className="glass-card animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">{(c as any).subject?.name}</CardTitle>
                  <StatusBadge status={c.status as any} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Prof. {(c as any).teacher?.last_name} · Note: {c.grade}/20 · {new Date(c.created_at).toLocaleDateString("fr-FR")}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{c.description}</p>
                {c.teacher_comment && (
                  <div className="flex gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Réponse de l'enseignant</p>
                      <p className="text-sm">{c.teacher_comment}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
