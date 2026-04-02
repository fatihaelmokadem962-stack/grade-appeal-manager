import { useOfflineSync } from "@/hooks/use-network-status";

export function OfflineSyncProvider() {
  useOfflineSync();
  return null;
}
