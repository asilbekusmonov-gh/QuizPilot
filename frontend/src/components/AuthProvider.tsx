"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

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
      
      // Attempt login via Telegram
      fetch("http://127.0.0.1:8000/api/v1/auth/telegram/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData })
      })
      .then(res => res.json())
      .then(data => {
        if (data.access) {
          localStorage.setItem("token", data.access);
          localStorage.setItem("refresh", data.refresh);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      })
      .catch(err => console.error("TMA Auth Error:", err));
    }
  }, [searchParams]);

  return <>{children}</>;
}
