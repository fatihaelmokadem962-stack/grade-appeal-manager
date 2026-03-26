import { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/hooks/use-data";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap, LogOut, Bell, Menu, X,
  LayoutDashboard, FileText, Users, BookOpen, UserCog, BarChart3
} from "lucide-react";
import { useState } from "react";

interface AppLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AppLayout({ children, activeTab, onTabChange }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: notifications = [] } = useNotifications(user?.id);

  if (!user) return null;

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    }
  };

  const navItems = user.role === "student"
    ? [
        { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
        { id: "new-complaint", label: "Nouvelle réclamation", icon: FileText },
        { id: "my-complaints", label: "Mes réclamations", icon: BookOpen },
      ]
    : user.role === "teacher"
    ? [
        { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
        { id: "complaints", label: "Réclamations", icon: FileText },
      ]
    : [
        { id: "dashboard", label: "Tableau de bord", icon: BarChart3 },
        { id: "students", label: "Étudiants", icon: Users },
        { id: "teachers", label: "Enseignants", icon: UserCog },
        { id: "subjects", label: "Matières", icon: BookOpen },
        { id: "all-complaints", label: "Réclamations", icon: FileText },
      ];

  const roleLabel = user.role === "student" ? "Étudiant" : user.role === "teacher" ? "Enseignant" : "Administrateur";

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
            <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm">ReclaNote</h2>
              <p className="text-xs text-sidebar-foreground/60">{roleLabel}</p>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
              <LogOut className="w-4 h-4" /> Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-6 h-14 flex items-center justify-between">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={markAllRead}>
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
                  {unread}
                </Badge>
              )}
            </Button>
          </div>
        </header>
        <main className="p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
