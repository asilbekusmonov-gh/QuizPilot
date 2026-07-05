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
      
      // Check if the user ID from Telegram matches the one in localStorage
      // If it doesn't match, or if there's a new initData, we should probably clear the old session to prevent account mixing
      const localUserStr = localStorage.getItem("user");
      let localUserId = null;
      try {
        if (localUserStr) {
           const localUser = JSON.parse(localUserStr);
           // telegram IDs are stored in username like 'tg_123456'
           localUserId = localUser.username; 
        }
      } catch(e) {}

      const currentTgId = tg.initDataUnsafe?.user?.id;
      if (currentTgId && localUserId !== `tg_${currentTgId}`) {
          // The telegram account has changed! Clear the old cache immediately.
          localStorage.removeItem("token");
          localStorage.removeItem("refresh");
          localStorage.removeItem("user");
      }

      // Attempt login via Telegram
      apiFetch("http://127.0.0.1:8000/api/v1/auth/telegram/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData })
      })
      .then(res => {
          if (!res.ok) {
              console.error("Auth failed with status:", res.status);
          }
          return res.json();
      })
      .then(data => {
        if (data.access) {
          localStorage.setItem("token", data.access);
          localStorage.setItem("refresh", data.refresh);
          localStorage.setItem("user", JSON.stringify(data.user));
          
          // Force a reload if we just logged in as a new user to update the UI state
          if (currentTgId && localUserId !== `tg_${currentTgId}`) {
             window.location.reload();
          }
        }
      })
      .catch(err => console.error("TMA Auth Error:", err));
    }
  }, [searchParams]);

  return <>{children}</>;
}
