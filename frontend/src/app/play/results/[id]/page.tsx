"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Home, RotateCcw, CheckCircle2, XCircle, Target, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [attemptData, setAttemptData] = useState<any>(null);

  // Parse fallback values from URL just in case API fails
  const fallbackScore = parseInt(searchParams.get("score") || "0");
  const fallbackTotal = parseInt(searchParams.get("total") || "10");

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await apiFetch(`http://127.0.0.1:8000/api/v1/attempts/${id}/`);
        if (res.ok) {
          const data = await res.json();
          setAttemptData(data);
        }
      } catch (error) {
        console.error("Failed to fetch attempt:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
      </div>
    );
  }

  const score = attemptData ? attemptData.score : fallbackScore;
  const quizTitle = attemptData ? attemptData.quiz_title : "Quiz Completed";
  const quizId = attemptData ? attemptData.quiz : id; // If fallback, id is quiz_id
  
  // Try to estimate total questions. Since attemptData only has score, we can use a fixed assumption or fallbackTotal
  // Note: For a more accurate result, the attempt serializer should return correct/total counts
  const total = fallbackTotal;
  const correct = Math.round((score / 100) * total);
  const incorrect = total - correct;

  // SVG Circle calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 animate-in relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-emerald-500/10 blur-[150px] rounded-full z-0 pointer-events-none" />

      {/* Header */}
      <header className="p-6 text-center relative z-10 pt-16">
        <h1 className="text-3xl font-extrabold text-zinc-100 font-outfit mb-2">Quiz Completed!</h1>
        <p className="text-zinc-400 font-medium">{quizTitle}</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 relative z-10">
        
        {/* Large Score Circle */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-10 mt-4">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-zinc-800"
            />
            {/* Progress Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-emerald-400 transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold text-white font-outfit drop-shadow-md">{score}%</span>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-1">Score</span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="w-full grid grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-lg">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={20} className="text-emerald-400" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-100 font-outfit">{correct}</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Correct</div>
            </div>
          </div>
          
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-lg">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <XCircle size={20} className="text-red-400" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-100 font-outfit">{incorrect}</div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Incorrect</div>
            </div>
          </div>
        </div>

        {/* Total Badge */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 px-6 py-3 rounded-full flex items-center gap-3 shadow-inner">
          <Target size={16} className="text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-300">Total Questions: <span className="text-white">{total}</span></span>
        </div>

      </main>

      {/* Bottom Actions */}
      <div className="p-6 relative z-10 pb-12 flex flex-col gap-3">
        <Link 
          href={`/play/quiz/${quizId}`}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-emerald-950 py-4 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] interactive flex justify-center items-center gap-2 transition-all"
        >
          <RotateCcw size={20} /> Play Again
        </Link>
        
        <Link 
          href="/"
          className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 py-4 rounded-2xl font-bold text-[15px] shadow-lg interactive flex justify-center items-center gap-2 transition-all"
        >
          <Home size={18} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
