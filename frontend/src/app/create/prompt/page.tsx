"use client";
import { apiFetch } from "@/lib/api";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles, AlertCircle, Loader2 } from "lucide-react";

export default function PromptPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState(10);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await apiFetch("http://127.0.0.1:8000/api/v1/generations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
        },
        body: JSON.stringify({ prompt, num_questions: questions }),
      });
      if (res.ok) {
        // Ideally the API would return a generated quiz ID, then we redirect to it
        // const data = await res.json();
        // router.push(`/library/${data.quiz_id}`);
        router.push("/library");
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pt-8 pb-32 animate-in relative min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 interactive transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold font-outfit text-zinc-100">Prompt to Quiz</h1>
        <div className="w-10" />
      </div>

      <div className="flex flex-col gap-6">
        {/* Topic Input */}
        <div>
          <label className="block text-sm font-bold text-zinc-100 mb-3 px-1">
            What topic would you like to create a quiz about?
          </label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full glass-panel rounded-2xl p-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none h-32"
            placeholder="E.g., 'World War II', 'Python programming', 'Photosynthesis'..."
          />
          <p className="text-[10px] text-zinc-500 px-2 mt-2 font-medium">Generate quiz from any topic.</p>
        </div>

        {/* Number of Questions */}
        <div>
          <label className="block text-sm font-bold text-zinc-100 mb-3 px-1">
            Number of Questions
          </label>
          <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 shadow-sm">
            {[10, 20, 30].map((num) => (
              <button 
                key={num}
                onClick={() => setQuestions(num)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all interactive ${
                  questions === num 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3">
          <AlertCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-500/80 font-medium leading-relaxed">
            AI can make mistakes. Verify important facts before sharing or studying.<br/>
            You can always edit your quizzes.
          </p>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:hover:bg-green-500 text-green-950 py-4 rounded-xl font-bold text-[15px] shadow-[0_0_20px_rgba(34,197,94,0.2)] interactive flex justify-center items-center gap-2 transition-all mt-4"
        >
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} 
          {isGenerating ? "Generating..." : "Generate Quiz"}
        </button>
      </div>
    </div>
  );
}
