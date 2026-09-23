"use client";

import dynamic from "next/dynamic";

function MapSkeleton() {
  return (
    <div className="flex h-full w-full animate-pulse items-center justify-center bg-brand-100">
      <p className="text-brand-800/65 text-sm">กำลังโหลดแผนที่…</p>
    </div>
  );
}

const DynamicThailandMap = dynamic(() => import("./ThailandMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default DynamicThailandMap;
