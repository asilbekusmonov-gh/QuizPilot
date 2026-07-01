"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function JoinSessionPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    setError("");
    setIsJoining(true);
    
    try {
      const res = await apiFetch("http://127.0.0.1:8000/api/v1/lobbies/join/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ join_code: joinCode.trim() }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        router.push(`/play/group/${data.lobby_id}`);
      } else {
        setError(data.error || "Failed to join session. Please check the code.");
      }
    } catch (err) {
      console.error("Failed to join lobby:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf9f2] animate-in relative overflow-hidden font-outfit">
      {/* Header */}
      <header className="flex items-center justify-between p-4 relative z-10 w-full max-w-md mx-auto">
        <Link href="/create/group" className="text-blue-500 hover:text-blue-600 font-bold flex items-center transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="text-zinc-900 font-bold text-lg">
          Join Session
        </div>
        <div className="w-6 h-6" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-6 pt-12 relative z-10 max-w-md mx-auto w-full">
        <form onSubmit={handleJoin} className="w-full bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <label className="block text-sm font-bold text-zinc-800 mb-3">Enter join code</label>
          <input 
            type="text" 
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g. A B C 1 2 3"
            maxLength={6}
            className="w-full bg-white border-2 border-zinc-200 rounded-xl px-4 py-4 text-center text-2xl font-mono text-zinc-800 tracking-[0.5em] placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition-colors uppercase mb-6"
          />
          
          {error && (
            <p className="text-red-500 text-sm font-semibold mb-4 text-center">{error}</p>
          )}

          <button 
            type="submit"
            disabled={joinCode.length < 5 || isJoining}
            className="w-full bg-[#75a6f9] hover:bg-[#5b95f7] disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center"
          >
            {isJoining ? <Loader2 size={20} className="animate-spin" /> : "Join Session"}
          </button>
        </form>
      </main>
    </div>
  );
}
