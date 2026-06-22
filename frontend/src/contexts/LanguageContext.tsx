"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Import dictionaries
import en from "@/dictionaries/en.json";
import ru from "@/dictionaries/ru.json";
import uz from "@/dictionaries/uz.json";

type LanguageCode = "EN" | "RU" | "UZ";
type Dictionary = typeof en;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  dict: Dictionary;
}

const dictionaries: Record<LanguageCode, Dictionary> = {
  EN: en,
  RU: ru,
  UZ: uz,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("EN");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved language from localStorage on mount
    const savedLang = localStorage.getItem("language") as LanguageCode;
    if (savedLang && dictionaries[savedLang]) {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dict: dictionaries[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
