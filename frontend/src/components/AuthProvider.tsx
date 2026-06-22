"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Save token to localStorage
      localStorage.setItem("token", token);
      
      // Clean up the URL by removing the token
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("token");
      
      // We use replaceState instead of router.replace to avoid triggering a Next.js re-render immediately
      window.history.replaceState({}, "", currentUrl.toString());
    }
  }, [searchParams]);

  return <>{children}</>;
}
