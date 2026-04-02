import { useNetworkStatus } from "@/hooks/use-network-status";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      Mode hors ligne — Les données affichées proviennent du cache local
    </div>
  );
}
