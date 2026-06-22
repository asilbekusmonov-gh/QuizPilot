import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import AuthProvider from "@/components/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "QuizPilot",
  description: "AI-powered Telegram Mini App for Quizzes and Flashcards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <LanguageProvider>
              <main className="container">
                {children}
              </main>
              <BottomNav />
            </LanguageProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
