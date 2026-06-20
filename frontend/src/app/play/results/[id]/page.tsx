"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Home, RotateCcw, CheckCircle2, XCircle, Target } from "lucide-react";

export default function ResultsPage() {
  const params = useParams();
  const id = params.id;

  // Dummy data
  const score = 85;
  const correct = 25;
  const incorrect = 5;
  const total = 30;

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
        <p className="text-zinc-400 font-medium">Physics 101 Midterm Review</p>
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
          href={`/play/quiz/${id}`}
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
