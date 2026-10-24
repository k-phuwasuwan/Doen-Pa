export function formatDate(date: Date): string {
  const months = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear() + 543; // Convert to Thai year

  return `${day} ${month} ${year}`;
}

/** Splits a visit date into the two lines printed inside a passport stamp. */
export function formatStampDate(date: Date): { dayMonth: string; year: string } {
  const [day, month, year] = formatDate(date).split(" ");
  return { dayMonth: `${day} ${month}`, year };
}
