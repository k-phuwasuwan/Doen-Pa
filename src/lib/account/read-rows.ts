import type { SupabaseClient } from "@supabase/supabase-js";

const PAGE_SIZE = 500;

/** Read the complete owner-scoped table, including projects with smaller row caps. */
export async function readAccountRows<T>(client: SupabaseClient, table: "travel_records" | "photos", columns: string, userId: string): Promise<T[]> {
  const rows: T[] = [];
  for (;;) {
    const { data, error, count } = await client.from(table)
      .select(columns, { count: "exact" })
      .eq("user_id", userId)
      .order("id")
      .range(rows.length, rows.length + PAGE_SIZE - 1);
    if (error || !data) throw new Error("โหลดข้อมูลบัญชีไม่สำเร็จ กรุณาลองใหม่");
    rows.push(...data as unknown as T[]);
    if (count !== null && rows.length >= count) return rows;
    if (data.length === 0) {
      if (count !== null) throw new Error("โหลดข้อมูลบัญชีไม่ครบ กรุณาลองใหม่");
      return rows;
    }
  }
}
