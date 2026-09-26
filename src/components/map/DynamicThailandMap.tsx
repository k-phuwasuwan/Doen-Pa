"use client";

import dynamic from "next/dynamic";
import { HikerLoader } from "@/components/ui/HikerLoader";

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-brand-100">
      <HikerLoader compact label="กำลังโหลดแผนที่…" />
    </div>
  );
}

const DynamicThailandMap = dynamic(() => import("./ThailandMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default DynamicThailandMap;
