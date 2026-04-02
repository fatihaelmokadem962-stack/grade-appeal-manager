import { useState } from "react";
import { useSubjects, useProfiles } from "@/hooks/use-data";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function ManageSubjects() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: subjects = [], isLoading } = useSubjects();
  const { data: teachers = [] } = useProfiles("teacher");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", teacherId: "" });
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditing(null); setForm({ name: "", teacherId: "" }); setDialogOpen(true); };
  const openEdit = (s: any) => { setEditing(s); setForm({ name: s.name, teacherId: s.teacher_id }); setDialogOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("subjects").update({
        name: form.name,
        teacher_id: form.teacherId,
      }).eq("id", editing.id);
      if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
      else toast({ title: "Matière modifiée" });
    } else {
      const { error } = await supabase.from("subjects").insert({
        name: form.name,
        teacher_id: form.teacherId,
      });
      if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
      else toast({ title: "Matière ajoutée" });
    }
    await queryClient.invalidateQueries({ queryKey: ["subjects"] });
    setDialogOpen(false);
    setSaving(false);
  };

  const handleDelete = async (s: any) => {
    const { error } = await supabase.from("subjects").delete().eq("id", s.id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Matière supprimée" });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Gestion des matières</h1>
          <p className="text-muted-foreground mt-1">{subjects.length} matières</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matière</TableHead>
                <TableHead>Enseignant</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.teacher?.first_name} {s.teacher?.last_name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(s)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Modifier la matière" : "Ajouter une matière"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nom de la matière</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Enseignant</Label>
              <Select value={form.teacherId} onValueChange={v => setForm({ ...form, teacherId: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionnez un enseignant" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t: any) => <SelectItem key={t.user_id} value={t.user_id}>{t.first_name} {t.last_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
