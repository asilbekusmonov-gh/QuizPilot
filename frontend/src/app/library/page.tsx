"use client";

import { PlayCircle, Edit3, MoreVertical, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface Quiz {
  id: number;
  title: string;
  description: string;
  created_by_username: string;
  is_public: boolean;
  created_on: string;
  questions: any[];
}

export default function LibraryPage() {
  const { dict } = useLanguage();
  const d = dict.library;

  const tabs = [d.tabs.quizzes, d.tabs.flashcards, d.tabs.slides];
  const [activeTab, setActiveTab] = useState(0);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await apiFetch("http://127.0.0.1:8000/api/v1/quizzes/");
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data);
        }
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);
  
  return (
    <div className="pt-8 pb-32 animate-in relative min-h-screen">
      <h1 className="text-2xl font-bold mb-6 font-outfit text-zinc-100">{d.title}</h1>
      
      {/* Segmented Control */}
      <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800 mb-6 shadow-sm">
        {tabs.map((tab, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all interactive ${
              activeTab === idx 
                ? "bg-zinc-800 text-indigo-400 border border-zinc-700 shadow-md" 
                : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
          </div>
        ) : activeTab === 2 ? (
          <div className="text-zinc-500 text-center py-10 font-medium border border-zinc-800/50 rounded-2xl bg-zinc-900/20 p-6">
            {d.slides_coming_soon}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-zinc-500 text-center py-10 font-medium border border-zinc-800/50 rounded-2xl bg-zinc-900/20 p-6">
            {d.no_items}
          </div>
        ) : (
          quizzes.map((quiz) => (
            <Link href={activeTab === 1 ? `/play/flashcard/${quiz.id}` : `/library/${quiz.id}`} key={quiz.id}>
              <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3 interactive group cursor-pointer hover:border-indigo-500/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-[15px] mb-1 text-zinc-100">{quiz.title}</h3>
                    <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                      <PlayCircle size={12} /> {quiz.questions?.length || 0} {d.items} • {d.by} {quiz.created_by_username || d.unknown_user}
                    </p>
                  </div>
                  <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <button className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-yellow-500 hover:border-yellow-500/50 transition-colors interactive">
                    <Zap size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors interactive">
                    <Edit3 size={14} />
                  </button>
                  <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold rounded-full ml-auto">
                    {quiz.is_public ? d.public : d.private}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
