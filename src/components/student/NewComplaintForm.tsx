import { useState } from "react";
import { mockSubjects, mockUsers, mockComplaints } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewComplaintForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjectId, setSubjectId] = useState("");
  const [grade, setGrade] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedSubject = mockSubjects.find(s => s.id === subjectId);
  const teacher = selectedSubject ? mockUsers.find(u => u.id === selectedSubject.teacherId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subjectId || !grade || !description.trim()) return;

    mockComplaints.push({
      id: `c${Date.now()}`,
      studentId: user.id,
      subjectId,
      teacherId: selectedSubject!.teacherId,
      grade: parseFloat(grade),
      description: description.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    toast({ title: "Réclamation envoyée", description: "Votre réclamation a été soumise avec succès." });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-xl font-display font-bold">Réclamation soumise !</h2>
        <p className="text-muted-foreground mt-2 text-center max-w-md">Votre réclamation a été envoyée à l'enseignant concerné. Vous serez notifié dès qu'elle sera traitée.</p>
        <Button className="mt-6" onClick={() => { setSubmitted(false); setSubjectId(""); setGrade(""); setDescription(""); }}>
          Nouvelle réclamation
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Nouvelle réclamation</h1>
        <p className="text-muted-foreground mt-1">Remplissez le formulaire pour soumettre votre réclamation</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Détails de la réclamation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Matière</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger><SelectValue placeholder="Sélectionnez une matière" /></SelectTrigger>
                <SelectContent>
                  {mockSubjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {teacher && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <span className="text-muted-foreground">Enseignant : </span>
                <span className="font-medium">{teacher.firstName} {teacher.lastName}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="grade">Note obtenue (/20)</Label>
              <Input id="grade" type="number" min="0" max="20" step="0.25" placeholder="Ex: 8.5" value={grade} onChange={e => setGrade(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description de la réclamation</Label>
              <Textarea id="desc" rows={5} placeholder="Décrivez précisément le motif de votre réclamation..." value={description} onChange={e => setDescription(e.target.value)} required />
            </div>

            <Button type="submit" className="w-full gap-2">
              <Send className="w-4 h-4" /> Soumettre la réclamation
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
