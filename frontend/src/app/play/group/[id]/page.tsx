"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Copy, Play, Loader2, Users, LogOut, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function GroupQuizPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [lobby, setLobby] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);

  // Live Quiz State
  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const fetchLobby = async () => {
      try {
        const res = await apiFetch(`http://127.0.0.1:8000/api/v1/lobbies/${id}/`);
        if (res.ok) {
          const data = await res.json();
          setLobby(data);
          
          // Check if current user is host by checking the username, or checking if we can start it
          // For simplicity, we assume if we are host, we can see the start button.
          // Wait, the API doesn't tell us if we are host directly without checking our user ID.
          // Let's assume we can fetch `/api/v1/users/me/` or just rely on API error if not host.
          // For UI purposes, we'll try to fetch me to verify host.
          const meRes = await apiFetch("http://127.0.0.1:8000/api/v1/users/me/");
          if (meRes.ok) {
            const meData = await meRes.json();
            setIsHost(meData.username === data.host_username);
          }

          if (data.status === 'playing' && !quizData) {
            // Fetch quiz questions
            const quizRes = await apiFetch(`http://127.0.0.1:8000/api/v1/quizzes/${data.quiz}/`);
            if (quizRes.ok) {
              const qData = await quizRes.json();
              setQuizData(qData);
              setTimeLeft(data.total_time * 60); // Assuming total_time is in minutes
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch lobby:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLobby();
    
    // Poll every 2 seconds
    const interval = setInterval(fetchLobby, 2000);
    return () => clearInterval(interval);
  }, [id, quizData]);

  // Timer countdown
  useEffect(() => {
    if (lobby?.status === 'playing' && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [lobby?.status, timeLeft]);

  const copyInviteCode = () => {
    if (lobby?.join_code) {
      navigator.clipboard.writeText(lobby.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = async () => {
    try {
      await apiFetch(`http://127.0.0.1:8000/api/v1/lobbies/${id}/start/`, {
        method: "POST"
      });
      // The polling will pick up the status change
    } catch (err) {
      console.error("Failed to start:", err);
      alert("Failed to start the quiz.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fcf9f2] items-center justify-center">
        <Loader2 className="animate-spin text-[#75a6f9] w-8 h-8" />
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fcf9f2] items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-zinc-800 mb-2">Lobby Not Found</h2>
        <p className="text-zinc-500 mb-6">This session may have ended or doesn&apos;t exist.</p>
        <Link href={`/create/group`} className="bg-[#75a6f9] hover:bg-[#5b95f7] text-white px-6 py-2 rounded-xl font-semibold transition-colors">
          Go Back
        </Link>
      </div>
    );
  }

  // format time for mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Live Quiz UI
  if (lobby.status === 'playing' && quizData) {
    const questions = quizData.questions || [];
    const currentQ = questions[currentQuestionIndex];
    
    if (!currentQ) {
      return (
        <div className="flex flex-col min-h-screen bg-[#fcf9f2] items-center justify-center p-6">
          <h2 className="text-2xl font-bold text-zinc-800 mb-2">Quiz Finished!</h2>
          <p className="text-zinc-500 mb-6">Waiting for others to finish...</p>
          <Link href="/library" className="bg-[#75a6f9] hover:bg-[#5b95f7] text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm">
            Exit Session
          </Link>
        </div>
      );
    }

    const labels = ["A", "B", "C", "D", "E"];

    return (
      <div className="flex flex-col min-h-screen bg-[#fcf9f2] animate-in font-outfit text-zinc-900">
        <header className="flex flex-col p-4 w-full max-w-4xl mx-auto pt-6">
          <div className="text-center font-bold text-lg mb-4">{quizData.title}</div>
          
          <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
            <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-200 rounded-full transition-all" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span>{currentQuestionIndex + 1}/{questions.length}</span>
            <span className="flex items-center gap-1"><Loader2 size={12} className={timeLeft <= 30 ? "animate-spin text-red-500" : ""} /> {formatTime(timeLeft)}</span>
            <LogOut size={16} className="cursor-pointer hover:text-red-500" onClick={() => router.push('/library')} />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center p-4 max-w-4xl mx-auto w-full">
          <div className="w-full bg-white border border-zinc-200 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="inline-block bg-[#eef4ff] text-[#75a6f9] px-3 py-1 rounded-full text-xs font-bold mb-4">
              Question {currentQuestionIndex + 1}
            </div>
            <h2 className="text-xl font-bold mb-4">{currentQ.text}</h2>
            {currentQ.image && (
              <div className="w-full flex justify-center mb-2">
                <img src={currentQ.image} alt="Question" className="max-h-56 rounded-xl border border-zinc-200 object-contain shadow-sm" />
              </div>
            )}
          </div>

          <div className="w-full flex flex-col gap-3">
            {currentQ.options?.map((opt: any, idx: number) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSelectedOption(opt.id);
                  // Auto advance for MVP
                  setTimeout(() => {
                    setSelectedOption(null);
                    setCurrentQuestionIndex(prev => prev + 1);
                  }, 500);
                }}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  selectedOption === opt.id 
                    ? "border-[#75a6f9] bg-[#eef4ff]" 
                    : "border-zinc-200 bg-white hover:border-[#75a6f9]/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  selectedOption === opt.id ? "bg-[#75a6f9] text-white" : "bg-[#75a6f9] text-white"
                }`}>
                  {labels[idx]}
                </div>
                <span className="font-semibold text-[15px]">{opt.text}</span>
              </button>
            ))}
          </div>
        </main>
        
        <footer className="p-4 flex flex-col items-center text-zinc-400 font-bold text-xs gap-2 pb-8">
          <div className="flex items-center gap-2"><Users size={14}/> {lobby.participants?.length || 0} playing</div>
          <button className="text-red-400 hover:text-red-500 transition-colors" onClick={() => router.push('/library')}>End Session</button>
        </footer>
      </div>
    );
  }

  // Waiting Room UI
  return (
    <div className="flex flex-col min-h-screen bg-[#fcf9f2] animate-in font-outfit text-zinc-900">
      
      <header className="flex items-center justify-between p-4 relative z-10 max-w-3xl mx-auto w-full pt-6">
        <Link href="/create/group" className="text-[#75a6f9] hover:text-[#5b95f7] transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="font-bold text-lg">Waiting Room</div>
        <div className="w-6" />
      </header>

      <main className="flex-1 flex flex-col items-center p-4 max-w-2xl mx-auto w-full pt-8">
        <div className="text-center font-bold text-sm text-zinc-500 mb-1">{lobby.quiz_title}</div>
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-400 mb-8">
          Starting in <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px]">LOBBY</span>
        </div>

        {/* Join Code Card */}
        <div className="w-full bg-white border border-zinc-200 rounded-2xl p-6 text-center shadow-sm mb-4">
          <div className="text-xs font-bold text-zinc-400 tracking-widest uppercase mb-2">Join Code</div>
          <div className="text-5xl sm:text-6xl font-bold text-[#75a6f9] tracking-widest font-mono flex items-center justify-center gap-4">
            {lobby.join_code} 
            <button onClick={copyInviteCode} className="text-zinc-400 hover:text-zinc-600 transition-colors bg-zinc-100 p-2 rounded-lg">
              {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
            </button>
          </div>
          <div className="text-xs font-bold text-zinc-400 mt-4 cursor-pointer hover:text-zinc-600" onClick={copyInviteCode}>
            Tap to copy
          </div>
        </div>

        {/* Share Button */}
        <button 
          onClick={copyInviteCode}
          className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-4 rounded-xl shadow-[0_4px_0_#1d4ed8] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 mb-6"
        >
          <Users size={18} /> Share Code
        </button>

        {/* Participants List */}
        <div className="w-full bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center gap-2 text-sm font-bold text-[#3b82f6] mb-4">
            <Users size={16} /> {lobby.participants?.length || 0} players joined
          </div>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">
            {lobby.participants?.length === 0 ? (
              <div className="text-center text-sm font-medium text-zinc-400 py-4">Waiting for players...</div>
            ) : (
              lobby.participants?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-200 text-orange-600 flex items-center justify-center font-bold text-sm">
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm">{p.username}</span>
                  </div>
                  {p.username === lobby.host_username && (
                    <span className="text-yellow-500">👑</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isHost ? (
          <div className="w-full flex flex-col gap-3 pb-10">
            <button 
              onClick={handleStart}
              className="w-full bg-[#58cc02] hover:bg-[#46a302] text-white font-bold py-4 rounded-xl shadow-[0_4px_0_#46a302] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" /> Start Quiz
            </button>
            <button className="w-full bg-white hover:bg-zinc-50 text-zinc-600 font-bold py-4 rounded-xl border border-zinc-200 shadow-sm transition-all" onClick={() => router.push('/create/group')}>
              Cancel Lobby
            </button>
          </div>
        ) : (
          <div className="w-full bg-zinc-100 text-zinc-500 font-bold py-4 rounded-xl text-center flex items-center justify-center gap-2 pb-10">
            <Loader2 size={18} className="animate-spin" /> Waiting for host to start...
          </div>
        )}

      </main>
    </div>
  );
}
