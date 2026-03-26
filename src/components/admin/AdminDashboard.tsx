import { mockComplaints, mockSubjects, mockUsers, getSubjectById, getUserById } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle2, XCircle, Users, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const total = mockComplaints.length;
  const pending = mockComplaints.filter(c => c.status === "pending").length;
  const accepted = mockComplaints.filter(c => c.status === "accepted").length;
  const rejected = mockComplaints.filter(c => c.status === "rejected").length;
  const students = mockUsers.filter(u => u.role === "student").length;
  const teachers = mockUsers.filter(u => u.role === "teacher").length;

  const stats = [
    { label: "Réclamations", value: total, icon: FileText, color: "text-primary" },
    { label: "En attente", value: pending, icon: Clock, color: "text-warning" },
    { label: "Acceptées", value: accepted, icon: CheckCircle2, color: "text-success" },
    { label: "Rejetées", value: rejected, icon: XCircle, color: "text-destructive" },
    { label: "Étudiants", value: students, icon: Users, color: "text-primary" },
    { label: "Enseignants", value: teachers, icon: BookOpen, color: "text-accent" },
  ];

  const pieData = [
    { name: "En attente", value: pending, color: "hsl(38, 92%, 50%)" },
    { name: "Acceptées", value: accepted, color: "hsl(160, 45%, 40%)" },
    { name: "Rejetées", value: rejected, color: "hsl(0, 72%, 51%)" },
  ];

  // Complaints by subject
  const subjectMap: Record<string, number> = {};
  mockComplaints.forEach(c => {
    const name = getSubjectById(c.subjectId)?.name || "Inconnu";
    subjectMap[name] = (subjectMap[name] || 0) + 1;
  });
  const barData = Object.entries(subjectMap).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble du système de réclamations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Réclamations par matière</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(220, 60%, 25%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Statut des réclamations</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
