import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getComplaintsByTeacher, getSubjectById, getUserById, Complaint } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import { CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TeacherComplaints() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  const [comment, setComment] = useState("");

  if (!user) return null;

  const complaints = getComplaintsByTeacher(user.id);

  const handleProcess = () => {
    if (!selected || !action || !comment.trim()) return;
    selected.status = action === "accept" ? "accepted" : "rejected";
    selected.teacherComment = comment.trim();
    selected.updatedAt = new Date().toISOString();
    toast({ title: action === "accept" ? "Réclamation acceptée" : "Réclamation rejetée" });
    setSelected(null);
    setAction(null);
    setComment("");
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
            const subject = getSubjectById(c.subjectId);
            const student = getUserById(c.studentId);
            return (
              <Card key={c.id} className="glass-card animate-fade-in">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{student?.firstName} {student?.lastName}</CardTitle>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{subject?.name} · Note: {c.grade}/20 · {new Date(c.createdAt).toLocaleDateString("fr-FR")}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{c.description}</p>
                  {c.teacherComment && (
                    <div className="p-3 rounded-lg bg-muted/50 text-sm">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Votre réponse</p>
                      <p>{c.teacherComment}</p>
                    </div>
                  )}
                  {c.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground" onClick={() => { setSelected(c); setAction("accept"); }}>
                        <CheckCircle2 className="w-4 h-4" /> Accepter
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { setSelected(c); setAction("reject"); }}>
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

      <Dialog open={!!selected && !!action} onOpenChange={() => { setSelected(null); setAction(null); setComment(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "accept" ? "Accepter la réclamation" : "Rejeter la réclamation"}</DialogTitle>
          </DialogHeader>
          <Textarea placeholder={action === "accept" ? "Commentaire (ex: note corrigée)..." : "Motif du rejet..."} value={comment} onChange={e => setComment(e.target.value)} rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelected(null); setAction(null); setComment(""); }}>Annuler</Button>
            <Button onClick={handleProcess} disabled={!comment.trim()} className={action === "accept" ? "bg-success hover:bg-success/90 text-success-foreground" : ""}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
