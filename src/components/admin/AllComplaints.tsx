import { mockComplaints, getSubjectById, getUserById } from "@/lib/mock-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { useState } from "react";

export default function AllComplaints() {
  const [search, setSearch] = useState("");

  const filtered = mockComplaints.filter(c => {
    const student = getUserById(c.studentId);
    const subject = getSubjectById(c.subjectId);
    return `${student?.firstName} ${student?.lastName} ${subject?.name}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Toutes les réclamations</h1>
        <p className="text-muted-foreground mt-1">{mockComplaints.length} réclamations au total</p>
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
                const student = getUserById(c.studentId);
                const subject = getSubjectById(c.subjectId);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{student?.firstName} {student?.lastName}</TableCell>
                    <TableCell>{subject?.name}</TableCell>
                    <TableCell>{c.grade}/20</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
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
