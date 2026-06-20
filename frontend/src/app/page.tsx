"use client";

import Link from "next/link";
import { HelpCircle, Star, FileText, MessageSquare, Layers, Presentation, Gamepad2 } from "lucide-react";

export default function CreatePage() {

  return (
    <div className="pt-10 pb-36 animate-in relative min-h-screen bg-zinc-950">
      
      {/* Background Soft Glows (Apple style) */}
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-500/10 blur-[120px] rounded-full z-0 pointer-events-none" />

      {/* Header section */}
      <header className="flex justify-between items-center mb-8 px-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-zinc-800">
            <img src="https://ui-avatars.com/api/?name=Asilbek+Usmonov&background=27272a&color=fff" alt="User Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Welcome back</p>
            <h1 className="text-xl font-bold text-zinc-100 font-outfit tracking-tight">Asilbek</h1>
          </div>
        </div>
        <div className="px-4 py-2 bg-zinc-900/80 backdrop-blur-md rounded-full shadow-lg flex items-center gap-2 text-sm font-bold interactive cursor-pointer hover:bg-zinc-800 transition-colors">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span>1 Credit</span>
        </div>
      </header>

      {/* Apple style large intro typography */}
      <div className="px-4 mb-6 relative z-10">
        <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight font-outfit leading-tight">
          What are we <br/> learning today?
        </h2>
      </div>

      {/* BENTO BOX GRID */}
      <div className="grid grid-cols-2 gap-4 px-4 relative z-10">
        
        {/* HERO: Upload PDF (Spans 2 columns) */}
        <Link 
          href="/create/upload"
          className="col-span-2 bento-card bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-6 relative overflow-hidden group flex flex-col justify-between min-h-[160px]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] transform -rotate-3 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
              <FileText size={28} className="text-indigo-600 drop-shadow-sm" />
            </div>
          </div>
          <div className="relative z-10 mt-6">
            <h3 className="text-2xl font-bold text-white tracking-tight mb-1">Turn PDFs to quizzes</h3>
            <p className="text-indigo-200 text-sm font-medium">Upload, generate, and share instantly.</p>
          </div>
        </Link>

        {/* Prompt to Quiz */}
        <Link 
          href="/create/prompt"
          className="col-span-1 bento-card bg-zinc-900 rounded-[1.8rem] p-5 relative overflow-hidden group flex flex-col justify-between min-h-[160px]"
        >
          <div className="relative z-10 text-right flex justify-end">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] transform -rotate-6 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
              <MessageSquare size={24} className="text-white drop-shadow-md" />
            </div>
          </div>
          <div className="relative z-10 mt-4">
            <h3 className="text-lg font-bold text-zinc-100 leading-tight mb-1">Any Topic</h3>
            <p className="text-zinc-500 text-[11px] font-medium leading-relaxed">AI writes questions from just a prompt.</p>
          </div>
        </Link>

        {/* Flashcards */}
        <Link 
          href="/create/upload"
          className="col-span-1 bento-card bg-zinc-900 rounded-[1.8rem] p-5 relative overflow-hidden group flex flex-col justify-between min-h-[160px]"
        >
          <div className="relative z-10 text-right flex justify-end">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)] transform rotate-6 group-hover:-rotate-3 group-hover:scale-110 transition-all duration-300">
              <Layers size={24} className="text-white drop-shadow-md" />
            </div>
          </div>
          <div className="relative z-10 mt-4">
            <h3 className="text-lg font-bold text-zinc-100 leading-tight mb-1">Flashcards</h3>
            <p className="text-zinc-500 text-[11px] font-medium leading-relaxed">Flip-card sets straight from docs.</p>
          </div>
        </Link>

        {/* AI Presentation */}
        <Link 
          href="/premium"
          className="col-span-1 bento-card bg-zinc-900 rounded-[1.8rem] p-5 relative overflow-hidden group flex flex-col justify-between min-h-[160px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
          <div className="relative z-10 text-right flex justify-end">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)] transform -rotate-3 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
              <Presentation size={24} className="text-white drop-shadow-md" />
            </div>
          </div>
          <div className="relative z-10 mt-4">
            <h3 className="text-lg font-bold text-zinc-100 leading-tight mb-1">AI Slides</h3>
            <p className="text-purple-400/80 text-[11px] font-bold tracking-wider uppercase">Premium</p>
          </div>
        </Link>

        {/* Group Quiz */}
        <Link 
          href="/create/group"
          className="col-span-1 bento-card bg-zinc-900 rounded-[1.8rem] p-5 relative overflow-hidden group flex flex-col justify-between min-h-[160px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
          <div className="relative z-10 text-right flex justify-end">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] transform rotate-3 group-hover:-rotate-6 group-hover:scale-110 transition-all duration-300">
              <Gamepad2 size={24} className="text-white drop-shadow-md" />
            </div>
          </div>
          <div className="relative z-10 mt-4">
            <h3 className="text-lg font-bold text-zinc-100 leading-tight mb-1">Live Games</h3>
            <p className="text-zinc-500 text-[11px] font-medium leading-relaxed">Play multiplayer rounds.</p>
          </div>
        </Link>

      </div>

      {/* How it works Button */}
      <div className="mt-10 text-center relative z-10">
        <Link href="/how-it-works" className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900/80 backdrop-blur-md rounded-full shadow-lg text-zinc-400 text-sm font-bold hover:text-zinc-200 hover:bg-zinc-800 transition-all active:scale-95">
          <HelpCircle size={16} /> How QuizPilot Works
        </Link>
      </div>

    </div>
  );
}
