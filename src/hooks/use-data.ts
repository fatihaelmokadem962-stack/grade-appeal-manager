import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCachedData, setCachedData } from "@/lib/offline-cache";

function createCachedQuery<T>(key: string[], queryFn: () => Promise<T>, enabled = true) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const data = await queryFn();
      setCachedData(key.join("_"), data);
      return data;
    },
    enabled,
    placeholderData: () => getCachedData<T>(key.join("_")) ?? undefined,
    retry: (failureCount, error) => {
      // Don't retry if offline
      if (!navigator.onLine) return false;
      return failureCount < 3;
    },
    staleTime: 30_000,
  });
}

export function useComplaints(filters?: { studentId?: string; teacherId?: string }) {
  const key = ["complaints", JSON.stringify(filters)];
  return createCachedQuery(key, async () => {
    let query = supabase
      .from("complaints")
      .select("*, subject:subjects(*), student:profiles!complaints_student_id_fkey(*), teacher:profiles!complaints_teacher_id_fkey(*)")
      .order("created_at", { ascending: false });

    if (filters?.studentId) query = query.eq("student_id", filters.studentId);
    if (filters?.teacherId) query = query.eq("teacher_id", filters.teacherId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  });
}

export function useSubjects() {
  return createCachedQuery(["subjects"], async () => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*, teacher:profiles!subjects_teacher_id_fkey(*)")
      .order("name");
    if (error) throw error;
    return data;
  });
}

export function useProfiles(role?: string) {
  const key = ["profiles", role ?? "all"];
  return createCachedQuery(key, async () => {
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
  });
}

export function useNotifications(userId?: string) {
  const key = ["notifications", userId ?? "none"];
  return createCachedQuery(key, async () => {
    if (!userId) return [];
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }, !!userId);
}
