"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createAccountStore, ACCOUNT_CHANGED_KEY } from "@/lib/account/browser";
import type { AccountData } from "@/domain/account-data";
import type { User } from "@/types";
import { AUTH_CHANGED_KEY } from "@/lib/auth/browser";

interface AuthContextValue {
  user: User | null;
  profile: ReturnType<typeof createAccountStore>["profile"];
  records: ReturnType<typeof createAccountStore>["records"];
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ initialData, children }: { initialData: AccountData | null; children: ReactNode }) {
  const initialUser = initialData?.user ?? null;
  const router = useRouter();
  const [identity, setIdentity] = useState(initialUser?.id ?? null);
  const [syncError, setSyncError] = useState(false);
  const store = useMemo(() => createAccountStore(initialData), [initialData]);
  const value = useMemo(() => ({ user: initialUser, profile: store.profile, records: store.records }), [initialUser, store]);
  const [dataError, setDataError] = useState(false);
  useEffect(() => {
    if (!initialData) return;
    let active = true;
    const refresh = () => { void store.refresh().then(() => { if (active) setDataError(false); }, () => { if (active) setDataError(true); }); };
    const onStorage = (event: StorageEvent) => { if (event.key === ACCOUNT_CHANGED_KEY) refresh(); };
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => { active = false; window.removeEventListener("storage", onStorage); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", onVisible); };
  }, [initialData, store]);
  const serverIdentity = initialUser?.id ?? null;

  useEffect(() => {
    const supabase = createClient();
    let disposed = false;
    let version = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextIdentity = session?.user.id ?? null;
      const currentVersion = ++version;
      if (nextIdentity !== serverIdentity) {
        // Hide the previous account immediately, including in other tabs.
        setIdentity(nextIdentity);
        // Run outside the Auth callback's lock. Reconcile an old/deleted account
        // cookie rather than repeatedly refreshing a server-confirmed guest.
        setTimeout(async () => {
          if (disposed || currentVersion !== version) return;
          if (nextIdentity) {
            const { data, error } = await supabase.auth.getUser();
            if (disposed || currentVersion !== version) return;
            if (error && error.status !== 401 && error.status !== 403 && error.name !== "AuthSessionMissingError") {
              setSyncError(true);
              return;
            }
            if (!data.user) {
              await supabase.auth.signOut({ scope: "local" });
              if (serverIdentity === null) setIdentity(null);
            }
          }
          if (!disposed) router.refresh();
        }, 0);
      }
    });
    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_CHANGED_KEY) {
        setIdentity("refreshing");
        // Cookies have already changed; use a fresh document for all account data.
        window.location.reload();
      }
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) { setIdentity("refreshing"); window.location.reload(); }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      disposed = true;
      subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router, serverIdentity]);

  return <AuthContext.Provider value={value}>
    {identity === serverIdentity ? <>{dataError && <div role="alert" className="relative z-50 p-4 text-center text-brand-800">อัปเดตข้อมูลไม่สำเร็จ ข้อมูลที่แสดงอาจยังไม่ล่าสุด <button type="button" onClick={() => window.location.reload()} className="min-h-11 px-3 underline">ลองอีกครั้ง</button></div>}{children}</> : <div className="p-8 text-center text-brand-800">
      <p role="status">{syncError ? "ตรวจสอบบัญชีไม่สำเร็จ กรุณาลองใหม่" : "กำลังตรวจสอบบัญชี…"}</p>
      {syncError && <button type="button" onClick={() => window.location.reload()} className="glass-button mt-4 min-h-12 rounded-xl px-5 focus-visible:outline-2 focus-visible:outline-brand-600">ลองอีกครั้ง</button>}
    </div>}
  </AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthProvider is required");
  return auth;
}
