import { RouteLoadingSignal } from "@/components/navigation/RouteLoadingTransition";
import { HikerLoader } from "@/components/ui/HikerLoader";

export default function Loading() {
  return (
    <div className="contour-pattern fixed inset-0 z-30 flex items-center justify-center bg-canvas px-4">
      <RouteLoadingSignal />
      <HikerLoader />
    </div>
  );
}
