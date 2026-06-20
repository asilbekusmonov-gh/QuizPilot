"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, PlusCircle, Play } from "lucide-react";

export default function GroupQuizPage() {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [time, setTime] = useState(10);
  const [isPublic, setIsPublic] = useState(true);
  const [startingIn, setStartingIn] = useState('5m');
  const [teacherMode, setTeacherMode] = useState(false);
  
  return (
    <div className="pt-8 pb-32 animate-in relative min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 interactive transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold font-outfit text-zinc-100">Group Quiz</h1>
        <div className="w-10" />
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800 mb-8 shadow-sm">
        <button 
          onClick={() => setTab('create')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-bold rounded-xl transition-all interactive ${
            tab === 'create' ? "bg-indigo-600 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <PlusCircle size={16} /> Create Session
        </button>
        <button 
          onClick={() => setTab('join')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-bold rounded-xl transition-all interactive ${
            tab === 'join' ? "bg-indigo-600 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Search size={16} /> Join Session
        </button>
      </div>

      {/* Content based on Tab */}
      {tab === 'join' ? (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search lobbies..." 
              className="w-full glass-panel pl-11 pr-4 py-3.5 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          
          <div className="text-center py-12">
            <h3 className="font-bold text-zinc-100 mb-2">No lobbies yet</h3>
            <p className="text-xs text-zinc-500 font-medium mb-6">Create a public lobby and all users in the app will be able to see and join it here.</p>
            <button 
              onClick={() => setTab('create')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] interactive transition-all text-sm w-full"
            >
              Be the first! Create a public lobby
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Select Quiz */}
          <div className="glass-panel p-4 rounded-2xl">
            <label className="block text-xs font-bold text-zinc-100 mb-3 uppercase tracking-wider">Select Quiz</label>
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-4 border-indigo-500 bg-zinc-900 shrink-0"></div>
              <div>
                <div className="font-bold text-sm text-zinc-100">yangi test</div>
                <div className="text-[10px] text-zinc-500 font-medium">30 questions</div>
              </div>
            </div>
          </div>

          {/* Total Time */}
          <div className="glass-panel p-4 rounded-2xl">
            <label className="block text-xs font-bold text-zinc-100 mb-3 uppercase tracking-wider">Total Time (minutes)</label>
            <div className="flex gap-2">
              {[5, 10, 15, 30].map((t) => (
                <button 
                  key={t}
                  onClick={() => setTime(t)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all interactive ${time === t ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/50' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Public Toggle */}
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between interactive cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
            <div className="pr-4">
              <div className="font-bold text-sm text-zinc-100 mb-1">Public</div>
              <div className="text-[10px] text-zinc-500 font-medium leading-relaxed">Anyone can discover and join this lobby. Starts automatically after the countdown.</div>
            </div>
            <div className={`w-12 h-6 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${isPublic ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${isPublic ? 'translate-x-6' : ''}`} />
            </div>
          </div>

          {/* Starting In */}
          <div className="glass-panel p-4 rounded-2xl">
            <input 
              type="text" 
              placeholder="What's this quiz about?"
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors mb-4"
            />
            <label className="block text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">Starting In</label>
            <div className="flex gap-2">
              {['2m', '5m', '10m', '15m'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setStartingIn(t)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all interactive ${startingIn === t ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/50' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Teacher Mode Toggle */}
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between interactive cursor-pointer" onClick={() => setTeacherMode(!teacherMode)}>
            <div className="pr-4">
              <div className="font-bold text-sm text-zinc-100 mb-1">Teacher Mode</div>
              <div className="text-[10px] text-zinc-500 font-medium leading-relaxed">Spectate and view detailed results instead of playing</div>
            </div>
            <div className={`w-12 h-6 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${teacherMode ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${teacherMode ? 'translate-x-6' : ''}`} />
            </div>
          </div>

          <button className="w-full bg-green-500 hover:bg-green-400 text-green-950 py-4 rounded-xl font-bold text-[15px] shadow-[0_0_20px_rgba(34,197,94,0.2)] interactive flex justify-center items-center gap-2 transition-all mt-2">
            <Play size={16} fill="currentColor" /> Create Session
          </button>
        </div>
      )}
    </div>
  );
}
