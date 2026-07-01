"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, Library, Settings, Crown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { dict } = useLanguage();

  const navItems = [
    { label: dict.nav.create, href: "/", icon: PlusCircle },
    { label: dict.nav.library, href: "/library", icon: Library },
    { label: dict.nav.settings, href: "/settings", icon: Settings },
    { label: dict.nav.premium, href: "/premium", icon: Crown },
  ];

  if (pathname.startsWith("/play/") || pathname.startsWith("/edit/")) {
    return null;
  }

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md glass-nav rounded-[2rem] px-2 py-3.5 z-50 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
      <ul className="flex justify-around items-center w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href} className="w-full relative">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center w-full py-1 interactive transition-all duration-300 ${
                  isActive ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon size={20} className={`mb-1 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-semibold tracking-wide">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-500 rounded-b-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
