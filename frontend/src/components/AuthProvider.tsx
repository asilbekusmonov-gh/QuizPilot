"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Process standard token in URL
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("token");
      window.history.replaceState({}, "", currentUrl.toString());
    }

    // 2. Telegram Mini App Auth
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData) {
      tg.expand(); // Expand to full height
      
      const localUserStr = localStorage.getItem("user");
      let localUserId = null;
      try {
        if (localUserStr) {
           const localUser = JSON.parse(localUserStr);
           localUserId = localUser.username; 
        }
      } catch(e) {}

      const currentTgId = tg.initDataUnsafe?.user?.id;
      
      // If we are logged in as the WRONG user, clear and reload immediately
      if (currentTgId && localUserId && localUserId !== `tg_${currentTgId}`) {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh");
          localStorage.removeItem("user");
          window.location.reload();
          return; // Stop execution
      }

      // If we are already logged in as the RIGHT user, we don't necessarily need to re-authenticate,
      // but if we do, we shouldn't reload the page again.
      const needsLogin = !localUserId;

      if (needsLogin) {
          // Attempt login via Telegram
          apiFetch("http://127.0.0.1:8000/api/v1/auth/telegram/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData: tg.initData })
          })
          .then(res => {
              if (!res.ok) console.error("Auth failed:", res.status);
              return res.json();
          })
          .then(data => {
            if (data.access) {
              localStorage.setItem("token", data.access);
              localStorage.setItem("refresh", data.refresh);
              localStorage.setItem("user", JSON.stringify(data.user));
              window.location.reload(); // Reload once to draw the newly logged-in UI
            }
          })
          .catch(err => console.error("TMA Auth Error:", err));
      }
    }
  }, [searchParams]);

  return <>{children}</>;
}
