import { NextResponse, type NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { loadAccountData } from "@/lib/account/server";

export async function GET(request: NextRequest) {
  const { supabase, finish } = createRouteClient(request);
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return finish(NextResponse.json({ error: "กรุณาเข้าสู่ระบบอีกครั้ง" }, { status: 401 }));
    return finish(NextResponse.json(await loadAccountData(supabase, user.id, user.user_metadata.profile_setup_pending === true)));
  } catch {
    return finish(NextResponse.json({ error: "โหลดข้อมูลบัญชีไม่สำเร็จ กรุณาลองใหม่" }, { status: 503 }));
  }
}
