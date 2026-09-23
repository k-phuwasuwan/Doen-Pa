"use client";

import dynamic from "next/dynamic";

function MapSkeleton() {
  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl bg-beige-100/30 animate-pulse flex items-center justify-center">
      <p className="text-brand-800/65 text-sm">กำลังโหลดแผนที่…</p>
    </div>
  );
}

const DynamicThailandMap = dynamic(() => import("./ThailandMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default DynamicThailandMap;

