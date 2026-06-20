import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

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
        <main className="container">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
