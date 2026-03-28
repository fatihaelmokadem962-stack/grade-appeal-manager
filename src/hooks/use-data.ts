import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useComplaints(filters?: { studentId?: string; teacherId?: string }) {
  return useQuery({
    queryKey: ["complaints", filters],
    queryFn: async () => {
      let query = supabase
        .from("complaints")
        .select("*, subject:subjects(*), student:profiles!complaints_student_id_fkey(*), teacher:profiles!complaints_teacher_id_fkey(*)")
        .order("created_at", { ascending: false });

      if (filters?.studentId) query = query.eq("student_id", filters.studentId);
      if (filters?.teacherId) query = query.eq("teacher_id", filters.teacherId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*, teacher:profiles!subjects_teacher_id_fkey(*)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useProfiles(role?: string) {
  return useQuery({
    queryKey: ["profiles", role],
    queryFn: async () => {
      // Fetch profiles and roles separately since there's no direct FK for PostgREST join
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("last_name"),
        supabase.from("user_roles").select("*"),
      ]);
      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      const rolesByUserId: Record<string, string[]> = {};
      for (const r of rolesRes.data) {
        if (!rolesByUserId[r.user_id]) rolesByUserId[r.user_id] = [];
        rolesByUserId[r.user_id].push(r.role);
      }

      const enriched = profilesRes.data.map((p: any) => ({
        ...p,
        user_roles: (rolesByUserId[p.user_id] || []).map(r => ({ role: r })),
      }));

      if (role) {
        return enriched.filter((p: any) => p.user_roles.some((r: any) => r.role === role));
      }
      return enriched;
    },
  });
}

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
