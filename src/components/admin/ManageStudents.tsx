import { useState } from "react";
import { useProfiles } from "@/hooks/use-data";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function ManageStudents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: students = [], isLoading } = useProfiles("student");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", cne: "", filiere: "", password: "" });
  const [saving, setSaving] = useState(false);

  const filtered = students.filter((s: any) =>
    `${s.first_name} ${s.last_name} ${s.cne} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm({ firstName: "", lastName: "", email: "", cne: "", filiere: "", password: "password123" }); setDialogOpen(true); };
  const openEdit = (s: any) => { setEditing(s); setForm({ firstName: s.first_name, lastName: s.last_name, email: s.email, cne: s.cne || "", filiere: s.filiere || "", password: "" }); setDialogOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("profiles").update({
        first_name: form.firstName,
        last_name: form.lastName,
        cne: form.cne || null,
        filiere: form.filiere || null,
      }).eq("user_id", editing.user_id);
      if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
      else toast({ title: "Étudiant modifié" });
    } else {
      // Create via edge function would be needed for creating auth users
      // For now we use the supabase admin - but from client we can only sign up
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password || "password123",
        options: { data: { first_name: form.firstName, last_name: form.lastName, role: "student" } }
      });
      if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
      else {
        // Update profile with cne/filiere after creation
        toast({ title: "Étudiant ajouté" });
      }
    }
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
    setDialogOpen(false);
    setSaving(false);
  };

  const handleDelete = async (s: any) => {
    const { error } = await supabase.from("profiles").delete().eq("user_id", s.user_id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Étudiant supprimé", description: `${s.first_name} ${s.last_name}` });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Gestion des étudiants</h1>
          <p className="text-muted-foreground mt-1">{students.length} étudiants inscrits</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CNE</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Filière</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.cne}</TableCell>
                  <TableCell className="font-medium">{s.first_name} {s.last_name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  <TableCell>{s.filiere}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Modifier l'étudiant" : "Ajouter un étudiant"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Prénom</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Nom</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
            </div>
            {!editing && <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>CNE</Label><Input value={form.cne} onChange={e => setForm({ ...form, cne: e.target.value })} /></div>
              <div className="space-y-2"><Label>Filière</Label><Input value={form.filiere} onChange={e => setForm({ ...form, filiere: e.target.value })} /></div>
            </div>
            {!editing && <div className="space-y-2"><Label>Mot de passe</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="password123" /></div>}
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
