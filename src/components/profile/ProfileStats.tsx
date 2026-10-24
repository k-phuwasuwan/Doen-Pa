interface ProfileStatsProps {
  placeCount: number;
  provinceCount: number;
  photoCount: number;
}

export function ProfileStats({ placeCount, provinceCount, photoCount }: ProfileStatsProps) {
  const figures = [
    { value: placeCount, label: "สถานที่" },
    { value: provinceCount, label: "จังหวัด" },
    { value: photoCount, label: "รูปภาพ" },
  ];

  return (
    <dl className="liquid-glass-capsule grid w-full grid-cols-3 divide-x divide-brand-800/10 rounded-2xl py-2.5 sm:w-fit" aria-label="สถิติโปรไฟล์">
      {figures.map((figure) => (
        <div key={figure.label} className="flex flex-col-reverse px-4 text-center sm:px-7">
          <dt className="text-xs text-brand-800/60">{figure.label}</dt>
          <dd className="font-num text-xl font-semibold text-brand-800">{figure.value}</dd>
        </div>
      ))}
    </dl>
  );
}
