import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, LogIn, UserPlus, Loader2, ArrowLeft } from "lucide-react";

type AuthView = "login" | "register" | "admin-login";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [cne, setCne] = useState("");
  const [filiere, setFiliere] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setRole("student");
    setCne("");
    setFiliere("");
    setDepartment("");
    setError("");
  };

  const switchView = (v: AuthView) => {
    resetForm();
    setView(v);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const err = await login(email, password);
    if (err) setError("Email ou mot de passe incorrect");
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Le prénom et le nom sont requis");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (role === "student" && !cne.trim()) {
      setError("Le CNE est requis pour les étudiants");
      return;
    }

    setIsLoading(true);
    const err = await register({
      email,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      cne: cne.trim() || undefined,
      filiere: filiere.trim() || undefined,
      department: department.trim() || undefined,
    });

    if (err) {
      setError(err);
    }
    setIsLoading(false);
  };

  const quickLogin = async (demoEmail: string) => {
    setIsLoading(true);
    const err = await login(demoEmail, "password123");
    if (err) setError("Erreur de connexion");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">ReclaNote</h1>
          <p className="text-muted-foreground mt-2">Gestion des réclamations des notes</p>
        </div>

        <Card className="glass-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              {(view === "register" || view === "admin-login") && (
                <Button variant="ghost" size="icon" onClick={() => switchView("login")} className="shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <h2 className="text-xl font-semibold text-center flex-1">
                {view === "login" ? "Connexion" : view === "admin-login" ? "Connexion Administrateur" : "Créer un compte"}
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            {(view === "login" || view === "admin-login") ? (
              <>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder={view === "admin-login" ? "admin@univ.ma" : "votre@email.ma"} value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    {view === "admin-login" ? "Connexion Admin" : "Se connecter"}
                  </Button>
                </form>

                {view === "login" && (
                  <>
                    <div className="mt-4 text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Pas encore de compte ?{" "}
                        <button onClick={() => switchView("register")} className="text-primary font-medium hover:underline">
                          S'inscrire
                        </button>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <button onClick={() => switchView("admin-login")} className="text-primary font-medium hover:underline">
                          Accès Administrateur
                        </button>
                      </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-xs text-muted-foreground text-center mb-3">Accès rapide (démo) — mot de passe: password123</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" onClick={() => quickLogin("ahmed@etu.ma")} className="text-xs" disabled={isLoading}>
                          Étudiant
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => quickLogin("prof.alami@univ.ma")} className="text-xs" disabled={isLoading}>
                          Enseignant
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => quickLogin("admin@univ.ma")} className="text-xs" disabled={isLoading}>
                          Admin
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rôle</Label>
                    <Select value={role} onValueChange={(v: "student" | "teacher") => setRole(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Étudiant</SelectItem>
                        <SelectItem value="teacher">Enseignant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input id="firstName" placeholder="Ahmed" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" placeholder="Benali" value={lastName} onChange={e => setLastName(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regEmail">Email</Label>
                    <Input id="regEmail" type="email" placeholder="votre@email.ma" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>

                  {role === "student" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="cne">CNE</Label>
                        <Input id="cne" placeholder="R130456789" value={cne} onChange={e => setCne(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="filiere">Filière</Label>
                        <Input id="filiere" placeholder="Informatique" value={filiere} onChange={e => setFiliere(e.target.value)} />
                      </div>
                    </div>
                  )}

                  {role === "teacher" && (
                    <div className="space-y-2">
                      <Label htmlFor="department">Département</Label>
                      <Input id="department" placeholder="Informatique" value={department} onChange={e => setDepartment(e.target.value)} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="regPassword">Mot de passe</Label>
                    <Input id="regPassword" type="password" placeholder="Au moins 6 caractères" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Créer mon compte
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Déjà un compte ?{" "}
                    <button onClick={() => switchView("login")} className="text-primary font-medium hover:underline">
                      Se connecter
                    </button>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
