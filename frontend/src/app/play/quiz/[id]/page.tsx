"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { X, Check, ArrowRight } from "lucide-react";

export default function QuizPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Dummy data
  const questions = [
    {
      question: "What is the formula for calculating kinetic energy?",
      options: ["KE = 1/2 mv^2", "KE = mgh", "KE = ma", "KE = 1/2 kx^2"],
      correctIdx: 0,
    },
    {
      question: "Which of these is a scalar quantity?",
      options: ["Velocity", "Force", "Speed", "Acceleration"],
      correctIdx: 2,
    },
  ];

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
  };

  const handleNext = () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      router.push(`/play/results/${id}`);
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
          {currentQuestion.options.map((option, idx) => {
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
            className="w-full bg-zinc-100 hover:bg-white text-zinc-900 py-4 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] interactive flex justify-center items-center gap-2 transition-all"
          >
            {currentQuestionIdx < totalQuestions - 1 ? "Next Question" : "Finish Quiz"} <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
