import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOfflineQueue, removeFromQueue } from "@/lib/offline-cache";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return isOnline;
}

export function useOfflineSync() {
  const isOnline = useNetworkStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const syncQueue = useCallback(async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    let synced = 0;
    for (const mutation of queue) {
      try {
        if (mutation.type === "insert") {
          const { error } = await supabase.from(mutation.table as any).insert(mutation.data as any);
          if (error) throw error;
        } else if (mutation.type === "update" && mutation.filters) {
          let q = supabase.from(mutation.table as any).update(mutation.data as any);
          for (const [key, val] of Object.entries(mutation.filters)) {
            q = q.eq(key, val as any);
          }
          const { error } = await q;
          if (error) throw error;
        }
        removeFromQueue(mutation.id);
        synced++;
      } catch {
        // Keep in queue for next attempt
      }
    }

    if (synced > 0) {
      queryClient.invalidateQueries();
      toast({
        title: "Synchronisation terminée",
        description: `${synced} action(s) synchronisée(s) avec le serveur.`,
      });
    }
  }, [queryClient, toast]);

  useEffect(() => {
    if (isOnline) {
      syncQueue();
    }
  }, [isOnline, syncQueue]);

  return { isOnline, syncQueue };
}
