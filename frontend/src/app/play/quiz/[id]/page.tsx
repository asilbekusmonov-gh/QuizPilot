"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Check, ArrowRight, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function QuizPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await apiFetch(`http://127.0.0.1:8000/api/v1/quizzes/${id}/`);
        if (res.ok) {
          const data = await res.json();
          // Transform options to identify correct index
          const formattedQuestions = data.questions.map((q: any) => {
            const correctIdx = q.options.findIndex((o: any) => o.is_correct);
            return {
              ...q,
              question: q.text,
              options: q.options.map((o: any) => o.text),
              correctIdx: correctIdx >= 0 ? correctIdx : 0
            };
          });
          setQuestions(formattedQuestions);
        }
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-zinc-100 mb-2">No Questions Found</h2>
        <p className="text-zinc-500 mb-6">This quiz doesn't have any standard questions.</p>
        <Link href={`/library/${id}`} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-semibold transition-colors">
          Go Back
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIdx + 1) / totalQuestions) * 100;

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctIdx) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Calculate final score percentage
      const score = Math.round(((correctCount + (selectedOption === currentQuestion.correctIdx && !isAnswered ? 1 : 0)) / totalQuestions) * 100);
      setIsSubmitting(true);
      try {
        const res = await apiFetch("http://127.0.0.1:8000/api/v1/attempts/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quiz: id, score })
        });
        if (res.ok) {
          const data = await res.json();
          router.push(`/play/results/${data.id}`);
        } else {
          router.push(`/play/results/${id}?score=${score}&total=${totalQuestions}`);
        }
      } catch (e) {
        router.push(`/play/results/${id}?score=${score}&total=${totalQuestions}`);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 animate-in relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-indigo-500/10 blur-[100px] rounded-full z-0 pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between p-4 relative z-10">
        <Link href={`/library/${id}`} className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white interactive transition-colors">
          <X size={20} />
        </Link>
        <div className="text-zinc-100 font-bold font-outfit">
          {currentQuestionIdx + 1} <span className="text-zinc-500">/ {totalQuestions}</span>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          30s
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-zinc-900 relative z-10">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 relative z-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-8 leading-relaxed font-outfit mt-4">
          {currentQuestion.question}
        </h2>

        <div className="flex flex-col gap-3">
          {currentQuestion.options.map((option: string, idx: number) => {
            const isSelected = selectedOption === idx;
            const isCorrect = isAnswered && idx === currentQuestion.correctIdx;
            const isWrong = isAnswered && isSelected && idx !== currentQuestion.correctIdx;

            let buttonClass = "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700";
            if (isSelected && !isAnswered) {
              buttonClass = "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)] scale-[1.02]";
            } else if (isCorrect) {
              buttonClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
            } else if (isWrong) {
              buttonClass = "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-2xl border-2 font-medium transition-all duration-300 interactive flex justify-between items-center ${buttonClass}`}
              >
                <span>{option}</span>
                {isCorrect && <Check size={20} className="text-emerald-400" />}
                {isWrong && <X size={20} className="text-red-400" />}
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom Bar */}
      <div className="p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 relative z-10 pb-8">
        {!isAnswered ? (
          <button
            onClick={handleCheck}
            disabled={selectedOption === null}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg interactive flex justify-center items-center gap-2 transition-all ${
              selectedOption !== null
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="w-full bg-zinc-100 hover:bg-white text-zinc-900 py-4 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] interactive flex justify-center items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin text-zinc-900" /> : (currentQuestionIdx < totalQuestions - 1 ? "Next Question" : "Finish Quiz")} 
            {!isSubmitting && <ArrowRight size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}
