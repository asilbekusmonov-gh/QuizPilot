"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { X, Users, Copy, Play, Loader2, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function LobbyWaitingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [lobby, setLobby] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLobby = async () => {
      try {
        const res = await apiFetch(`http://127.0.0.1:8000/api/v1/lobbies/${id}/`);
        if (res.ok) {
          const data = await res.json();
          setLobby(data);
        }
      } catch (error) {
        console.error("Failed to fetch lobby:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLobby();
    
    // Simple polling to update participants every 3 seconds
    const interval = setInterval(fetchLobby, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    // Navigate to actual quiz play room or notify users
    router.push(`/play/quiz/${lobby?.quiz}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-zinc-100 mb-2">Lobby Not Found</h2>
        <p className="text-zinc-500 mb-6">This session may have ended or doesn't exist.</p>
        <Link href={`/create/group`} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-semibold transition-colors">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 animate-in relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-indigo-500/10 blur-[100px] rounded-full z-0 pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between p-4 relative z-10">
        <Link href="/create/group" className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white interactive transition-colors">
          <X size={20} />
        </Link>
        <div className="text-zinc-100 font-bold font-outfit text-sm">
          Waiting Room
        </div>
        <div className="w-10 h-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-6 relative z-10 pt-12">
        <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <Users size={32} />
        </div>
        
        <h1 className="text-3xl font-extrabold text-zinc-100 font-outfit mb-2 text-center">{lobby.quiz_title}</h1>
        <p className="text-zinc-400 font-medium text-sm mb-8 text-center flex items-center justify-center gap-2">
          Hosted by <span className="text-indigo-400 font-bold">@{lobby.host_username}</span>
        </p>

        {/* Invite Code / Link */}
        <div className="w-full max-w-sm glass-panel p-4 rounded-2xl flex items-center justify-between mb-12">
          <div className="truncate pr-4 font-mono text-zinc-300 text-sm">
            {typeof window !== "undefined" ? window.location.href : `Lobby ID: ${id}`}
          </div>
          <button 
            onClick={copyInviteLink}
            className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors shrink-0"
          >
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
          </button>
        </div>

        {/* Participants List */}
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-zinc-100 text-sm uppercase tracking-wider">Participants</h3>
            <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md">
              {lobby.participants?.length || 0} Joined
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {lobby.participants?.length === 0 ? (
              <div className="text-center p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-500">Waiting for players to join...</p>
              </div>
            ) : (
              lobby.participants?.map((p: any) => (
                <div key={p.id} className="glass-panel p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                     <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.username)}&background=27272a&color=fff`} alt={p.username} className="w-full h-full object-cover" />
                  </div>
                  <div className="font-bold text-zinc-100 text-sm">{p.username}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Bottom Action */}
      <div className="p-6 relative z-10 pb-12 w-full max-w-sm mx-auto">
        <button 
          onClick={handleStart}
          className="w-full bg-green-500 hover:bg-green-400 text-green-950 py-4 rounded-xl font-bold text-[15px] shadow-[0_0_20px_rgba(34,197,94,0.2)] interactive flex justify-center items-center gap-2 transition-all"
        >
          <Play size={18} fill="currentColor" /> Start Quiz
        </button>
      </div>
    </div>
  );
}
