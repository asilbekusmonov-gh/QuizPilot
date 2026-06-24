"use client";
import { apiFetch } from "@/lib/api";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, Search, PlusCircle, Play, Loader2, Users } from "lucide-react";

export default function GroupQuizPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [time, setTime] = useState(10);
  const [isPublic, setIsPublic] = useState(true);
  const [startingIn, setStartingIn] = useState('5m');
  const [teacherMode, setTeacherMode] = useState(false);
  const [description, setDescription] = useState("");
  
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [isLoadingLobbies, setIsLoadingLobbies] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { dict } = useLanguage();

  useEffect(() => {
    // Fetch user's quizzes for creation dropdown
    const fetchQuizzes = async () => {
      try {
        const res = await apiFetch("http://127.0.0.1:8000/api/v1/quizzes/");
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data);
          if (data.length > 0) setSelectedQuizId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    // Fetch active public lobbies when join tab is selected
    if (tab === 'join') {
      const fetchLobbies = async () => {
        setIsLoadingLobbies(true);
        try {
          const res = await apiFetch("http://127.0.0.1:8000/api/v1/lobbies/");
          if (res.ok) {
            const data = await res.json();
            setLobbies(data);
          }
        } catch (error) {
          console.error("Failed to fetch lobbies:", error);
        } finally {
          setIsLoadingLobbies(false);
        }
      };
      fetchLobbies();
    }
  }, [tab]);

  const handleCreateSession = async () => {
    if (!selectedQuizId) return;
    setIsCreating(true);
    try {
      const res = await apiFetch("http://127.0.0.1:8000/api/v1/lobbies/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz: selectedQuizId,
          is_public: isPublic,
          total_time: time,
          teacher_mode: teacherMode,
          // description is not in the model but startingIn could be mapped to status logic
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Redirect to a lobby wait room
        router.push(`/play/group/${data.id}`);
      }
    } catch (error) {
      console.error("Failed to create lobby:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="pt-8 pb-32 animate-in relative min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 interactive transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold font-outfit text-zinc-100">{dict.create_group.title}</h1>
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
          <PlusCircle size={16} /> {dict.create_group.create_session}
        </button>
        <button 
          onClick={() => setTab('join')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-bold rounded-xl transition-all interactive ${
            tab === 'join' ? "bg-indigo-600 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Search size={16} /> {dict.create_group.join_session}
        </button>
      </div>

      {/* Content based on Tab */}
      {tab === 'join' ? (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder={dict.create_group.search_lobbies}
              className="w-full glass-panel pl-11 pr-4 py-3.5 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          
          {isLoadingLobbies ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
            </div>
          ) : lobbies.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="font-bold text-zinc-100 mb-2">{dict.create_group.no_lobbies}</h3>
              <p className="text-xs text-zinc-500 font-medium mb-6">{dict.create_group.no_lobbies_desc}</p>
              <button 
                onClick={() => setTab('create')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] interactive transition-all text-sm w-full"
              >
                {dict.create_group.be_first}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {lobbies.map((lobby) => (
                <div key={lobby.id} className="glass-panel p-4 rounded-2xl flex justify-between items-center group interactive cursor-pointer hover:border-indigo-500/50 transition-all">
                  <div>
                    <h3 className="font-bold text-zinc-100 text-sm mb-1">{lobby.quiz_title}</h3>
                    <p className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                      <Users size={12} /> {lobby.participants?.length || 0} {dict.create_group.waiting} • {dict.create_group.host}: {lobby.host_username}
                    </p>
                  </div>
                  <Link href={`/play/group/${lobby.id}`} className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                    {dict.create_group.join}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Select Quiz */}
          <div className="glass-panel p-4 rounded-2xl">
            <label className="block text-xs font-bold text-zinc-100 mb-3 uppercase tracking-wider">{dict.create_group.select_quiz}</label>
            {quizzes.length === 0 ? (
              <div className="text-xs text-zinc-500 font-medium p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                {dict.create_group.no_quizzes} <Link href="/create/prompt" className="text-indigo-400 hover:underline">{dict.create_group.create_first}</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {quizzes.map((quiz) => (
                  <div 
                    key={quiz.id}
                    onClick={() => setSelectedQuizId(quiz.id)}
                    className={`rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-colors ${selectedQuizId === quiz.id ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-4 shrink-0 transition-colors ${selectedQuizId === quiz.id ? 'border-indigo-500 bg-zinc-900' : 'border-zinc-700 bg-zinc-800'}`}></div>
                    <div>
                      <div className={`font-bold text-sm ${selectedQuizId === quiz.id ? 'text-zinc-100' : 'text-zinc-300'}`}>{quiz.title}</div>
                      <div className="text-[10px] text-zinc-500 font-medium">{quiz.questions?.length || 0} {dict.create_group.questions}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total Time */}
          <div className="glass-panel p-4 rounded-2xl">
            <label className="block text-xs font-bold text-zinc-100 mb-3 uppercase tracking-wider">{dict.create_group.total_time}</label>
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
              <div className="font-bold text-sm text-zinc-100 mb-1">{dict.create_group.public_toggle}</div>
              <div className="text-[10px] text-zinc-500 font-medium leading-relaxed">{dict.create_group.public_desc}</div>
            </div>
            <div className={`w-12 h-6 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${isPublic ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${isPublic ? 'translate-x-6' : ''}`} />
            </div>
          </div>

          {/* Starting In */}
          <div className="glass-panel p-4 rounded-2xl">
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={dict.create_group.about_placeholder}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors mb-4"
            />
            <label className="block text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">{dict.create_group.starting_in}</label>
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
              <div className="font-bold text-sm text-zinc-100 mb-1">{dict.create_group.teacher_mode}</div>
              <div className="text-[10px] text-zinc-500 font-medium leading-relaxed">{dict.create_group.teacher_mode_desc}</div>
            </div>
            <div className={`w-12 h-6 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${teacherMode ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${teacherMode ? 'translate-x-6' : ''}`} />
            </div>
          </div>

          <button 
            onClick={handleCreateSession}
            disabled={!selectedQuizId || isCreating}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:hover:bg-green-500 text-green-950 py-4 rounded-xl font-bold text-[15px] shadow-[0_0_20px_rgba(34,197,94,0.2)] interactive flex justify-center items-center gap-2 transition-all mt-2"
          >
            {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />} 
            {isCreating ? dict.create_group.creating : dict.create_group.create_session}
          </button>
        </div>
      )}
    </div>
  );
}
