import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useComplaints } from "@/hooks/use-data";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function TeacherComplaints() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: complaints = [], isLoading } = useComplaints({ teacherId: user?.id });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  const [comment, setComment] = useState("");
  const [processing, setProcessing] = useState(false);

  if (!user) return null;
  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const handleProcess = async () => {
    if (!selectedId || !action || !comment.trim()) return;
    setProcessing(true);
    const { error } = await supabase.from("complaints").update({
      status: action === "accept" ? "accepted" : "rejected",
      teacher_comment: comment.trim(),
    }).eq("id", selectedId);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: action === "accept" ? "Réclamation acceptée" : "Réclamation rejetée" });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    }
    setSelectedId(null);
    setAction(null);
    setComment("");
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Réclamations</h1>
        <p className="text-muted-foreground mt-1">Gérez les réclamations de vos étudiants</p>
      </div>

      {complaints.length === 0 ? (
        <Card className="glass-card"><CardContent className="py-12 text-center text-muted-foreground">Aucune réclamation</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {complaints.map(c => {
            const student = (c as any).student;
            const subject = (c as any).subject;
            return (
              <Card key={c.id} className="glass-card animate-fade-in">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{student?.first_name} {student?.last_name}</CardTitle>
                    <StatusBadge status={c.status as any} />
                  </div>
                  <p className="text-xs text-muted-foreground">{subject?.name} · Note: {c.grade}/20 · {new Date(c.created_at).toLocaleDateString("fr-FR")}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{c.description}</p>
                  {c.teacher_comment && (
                    <div className="p-3 rounded-lg bg-muted/50 text-sm">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Votre réponse</p>
                      <p>{c.teacher_comment}</p>
                    </div>
                  )}
                  {c.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground" onClick={() => { setSelectedId(c.id); setAction("accept"); }}>
                        <CheckCircle2 className="w-4 h-4" /> Accepter
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { setSelectedId(c.id); setAction("reject"); }}>
                        <XCircle className="w-4 h-4" /> Rejeter
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedId && !!action} onOpenChange={() => { setSelectedId(null); setAction(null); setComment(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "accept" ? "Accepter la réclamation" : "Rejeter la réclamation"}</DialogTitle>
          </DialogHeader>
          <Textarea placeholder={action === "accept" ? "Commentaire (ex: note corrigée)..." : "Motif du rejet..."} value={comment} onChange={e => setComment(e.target.value)} rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedId(null); setAction(null); setComment(""); }}>Annuler</Button>
            <Button onClick={handleProcess} disabled={!comment.trim() || processing} className={action === "accept" ? "bg-success hover:bg-success/90 text-success-foreground" : ""}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
