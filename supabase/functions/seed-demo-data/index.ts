import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Check if data already seeded
    const { data: existing } = await supabase.from("profiles").select("id").limit(1);
    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ message: "Data already seeded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const password = "password123";

    // Create users via admin API
    const users = [
      { email: "ahmed@etu.ma", first_name: "Ahmed", last_name: "Benali", role: "student", cne: "R130456789", filiere: "Informatique" },
      { email: "sara@etu.ma", first_name: "Sara", last_name: "El Amrani", role: "student", cne: "R130456790", filiere: "Mathématiques" },
      { email: "youssef@etu.ma", first_name: "Youssef", last_name: "Moussaoui", role: "student", cne: "R130456791", filiere: "Informatique" },
      { email: "prof.alami@univ.ma", first_name: "Mohamed", last_name: "Alami", role: "teacher", department: "Informatique" },
      { email: "prof.fassi@univ.ma", first_name: "Fatima", last_name: "Fassi", role: "teacher", department: "Mathématiques" },
      { email: "admin@univ.ma", first_name: "Admin", last_name: "Système", role: "admin" },
    ];

    const userIds: Record<string, string> = {};

    for (const u of users) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password,
        email_confirm: true,
        user_metadata: { first_name: u.first_name, last_name: u.last_name, role: u.role },
      });
      if (error) throw new Error(`Failed to create user ${u.email}: ${error.message}`);
      userIds[u.email] = data.user.id;

      // Update profile with extra fields
      if (u.cne || u.filiere || u.department) {
        await supabase.from("profiles").update({
          cne: u.cne || null,
          filiere: u.filiere || null,
          department: u.department || null,
        }).eq("user_id", data.user.id);
      }
    }

    // Create subjects
    const subjects = [
      { name: "Programmation Java", teacher_email: "prof.alami@univ.ma" },
      { name: "Bases de Données", teacher_email: "prof.alami@univ.ma" },
      { name: "Analyse Numérique", teacher_email: "prof.fassi@univ.ma" },
      { name: "Algèbre Linéaire", teacher_email: "prof.fassi@univ.ma" },
    ];

    const subjectIds: Record<string, string> = {};
    for (const s of subjects) {
      const { data, error } = await supabase.from("subjects").insert({
        name: s.name,
        teacher_id: userIds[s.teacher_email],
      }).select("id").single();
      if (error) throw new Error(`Failed to create subject ${s.name}: ${error.message}`);
      subjectIds[s.name] = data.id;
    }

    // Create complaints
    const complaints = [
      {
        student_email: "ahmed@etu.ma",
        subject: "Programmation Java",
        teacher_email: "prof.alami@univ.ma",
        grade: 8,
        description: "Je pense qu'il y a une erreur dans la correction de l'exercice 3. J'ai bien implémenté le pattern Singleton.",
        status: "pending",
      },
      {
        student_email: "ahmed@etu.ma",
        subject: "Analyse Numérique",
        teacher_email: "prof.fassi@univ.ma",
        grade: 11,
        description: "Ma copie contient la méthode de Newton correctement appliquée mais n'a pas été comptabilisée.",
        status: "accepted",
        teacher_comment: "Effectivement, la question 4 n'avait pas été corrigée. Note corrigée à 14.",
      },
      {
        student_email: "sara@etu.ma",
        subject: "Algèbre Linéaire",
        teacher_email: "prof.fassi@univ.ma",
        grade: 6,
        description: "J'ai répondu à toutes les questions de l'examen mais ma note ne reflète pas mes réponses.",
        status: "rejected",
        teacher_comment: "Après vérification, la correction est conforme au barème. Les réponses aux questions 2 et 5 étaient incomplètes.",
      },
      {
        student_email: "youssef@etu.ma",
        subject: "Bases de Données",
        teacher_email: "prof.alami@univ.ma",
        grade: 9,
        description: "Le résultat de ma requête SQL était correct mais a été compté comme faux.",
        status: "pending",
      },
    ];

    for (const c of complaints) {
      const { error } = await supabase.from("complaints").insert({
        student_id: userIds[c.student_email],
        subject_id: subjectIds[c.subject],
        teacher_id: userIds[c.teacher_email],
        grade: c.grade,
        description: c.description,
        status: c.status,
        teacher_comment: c.teacher_comment || null,
      });
      if (error) throw new Error(`Failed to create complaint: ${error.message}`);
    }

    return new Response(JSON.stringify({ 
      message: "Demo data seeded successfully",
      credentials: users.map(u => ({ email: u.email, password, role: u.role }))
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
