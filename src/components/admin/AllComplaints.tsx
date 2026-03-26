import { useComplaints } from "@/hooks/use-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { useState } from "react";

export default function AllComplaints() {
  const { data: complaints = [], isLoading } = useComplaints();
  const [search, setSearch] = useState("");

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const filtered = complaints.filter(c => {
    const student = (c as any).student;
    const subject = (c as any).subject;
    return `${student?.first_name} ${student?.last_name} ${subject?.name}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Toutes les réclamations</h1>
        <p className="text-muted-foreground mt-1">{complaints.length} réclamations au total</p>
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
                <TableHead>Étudiant</TableHead>
                <TableHead>Matière</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => {
                const student = (c as any).student;
                const subject = (c as any).subject;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{student?.first_name} {student?.last_name}</TableCell>
                    <TableCell>{subject?.name}</TableCell>
                    <TableCell>{c.grade}/20</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell><StatusBadge status={c.status as any} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
