"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Play, Layers, Star, Share2, MoreVertical, CheckCircle2, Clock } from "lucide-react";

export default function QuizDetailsPage() {
  const params = useParams();
  const id = params.id;

  return (
    <div className="pt-8 pb-32 animate-in relative min-h-screen">
      {/* Header section with back button */}
      <div className="flex justify-between items-center px-4 mb-6 relative z-10">
        <Link href="/library" className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white interactive transition-colors shadow-lg">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-indigo-400 interactive transition-colors shadow-lg">
            <Share2 size={18} />
          </button>
          <button className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white interactive transition-colors shadow-lg">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Hero Content */}
      <div className="px-4 relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] mb-6 transform -rotate-3">
          <Star size={32} className="text-white drop-shadow-md" />
        </div>
        <h1 className="text-3xl font-bold font-outfit text-zinc-100 mb-2 leading-tight">Physics 101 Midterm Review</h1>
        <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-6">
          A comprehensive review of kinematics, forces, energy, and momentum for the upcoming midterm exam.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Questions</p>
              <p className="font-semibold text-zinc-200">30 Items</p>
            </div>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Best Score</p>
              <p className="font-semibold text-zinc-200">85%</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link 
            href={`/play/quiz/${id}`}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] interactive flex justify-center items-center gap-2 transition-all"
          >
            <Play size={20} className="fill-white" /> Start Quiz
          </Link>
          
          <Link 
            href={`/play/flashcard/${id}`}
            className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 py-4 rounded-2xl font-bold text-[15px] shadow-lg interactive flex justify-center items-center gap-2 transition-all"
          >
            <Layers size={18} /> Study Flashcards
          </Link>
        </div>
      </div>
    </div>
  );
}
