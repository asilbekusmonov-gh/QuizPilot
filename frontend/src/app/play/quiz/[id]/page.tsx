"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { X, Check, ArrowRight, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Confetti from "react-confetti";

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
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const fetchQuiz = async () => {
      try {
        const res = await apiFetch(`http://127.0.0.1:8000/api/v1/quizzes/${id}/`);
        if (res.ok) {
          const data = await res.json();
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

  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

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
    vibrate(10);
    setSelectedOption(idx);
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    
    const isCorrect = selectedOption === currentQuestion.correctIdx;
    if (isCorrect) {
      vibrate(50);
      setCorrectCount(prev => prev + 1);
    } else {
      vibrate([50, 50]); // Error buzz
    }
  };

  const handleNext = async () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      const score = Math.round(((correctCount + (selectedOption === currentQuestion.correctIdx && !isAnswered ? 1 : 0)) / totalQuestions) * 100);
      setIsSubmitting(true);
      setShowConfetti(true);
      vibrate([100, 50, 100, 50, 200]); // Success vibration
      
      try {
        const res = await apiFetch("http://127.0.0.1:8000/api/v1/attempts/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quiz: id, score })
        });
        
        setTimeout(async () => {
          if (res.ok) {
            const data = await res.json();
            router.push(`/play/results/${data.id}`);
          } else {
            router.push(`/play/results/${id}?score=${score}&total=${totalQuestions}`);
          }
        }, 1500); // Give confetti time to fall
      } catch (e) {
        setTimeout(() => {
          router.push(`/play/results/${id}?score=${score}&total=${totalQuestions}`);
        }, 1500);
      }
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    show: { opacity: 1, x: 0, transition: { staggerChildren: 0.1, type: "spring", damping: 25 } },
    exit: { opacity: 0, x: -50 }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 relative overflow-hidden font-outfit">
      
      {showConfetti && (
        <Confetti 
          width={windowSize.width} 
          height={windowSize.height} 
          recycle={false} 
          numberOfPieces={500} 
          gravity={0.2}
          style={{ zIndex: 100 }}
        />
      )}

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-indigo-500/10 blur-[100px] rounded-full z-0 pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between p-4 relative z-10">
        <Link href={`/library/${id}`} className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white interactive transition-colors">
          <X size={20} />
        </Link>
        <div className="text-zinc-100 font-bold font-outfit flex items-center gap-2">
           <motion.span key={currentQuestionIdx} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-lg">
             {currentQuestionIdx + 1}
           </motion.span>
           <span className="text-zinc-500">/ {totalQuestions}</span>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          30s
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-zinc-900 relative z-10 rounded-full mx-4 max-w-[calc(100%-2rem)] overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", bounce: 0, duration: 0.6 }}
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 absolute left-0 top-0 rounded-full"
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 relative z-10 overflow-y-auto pb-24">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIdx}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex flex-col flex-1"
          >
            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-zinc-100 mb-6 leading-relaxed mt-4 tracking-tight">
              {currentQuestion.question}
            </motion.h2>
            
            {currentQuestion.image && (
              <motion.div variants={itemVariants} className="mb-8 w-full flex justify-center">
                <img src={currentQuestion.image} alt="Question" className="max-h-56 rounded-2xl border border-zinc-800 object-contain shadow-lg" />
              </motion.div>
            )}

            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option: string, idx: number) => {
                const isSelected = selectedOption === idx;
                const isCorrect = isAnswered && idx === currentQuestion.correctIdx;
                const isWrong = isAnswered && isSelected && idx !== currentQuestion.correctIdx;

                let buttonClass = "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700";
                
                // If answered, dim the unselected/wrong answers
                if (isAnswered && !isSelected && !isCorrect) {
                   buttonClass = "bg-zinc-900/50 border-zinc-800/50 text-zinc-500 opacity-50";
                }

                if (isSelected && !isAnswered) {
                  buttonClass = "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)] border-indigo-400";
                } else if (isCorrect) {
                  buttonClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                } else if (isWrong) {
                  buttonClass = "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
                }

                return (
                  <motion.button
                    key={idx}
                    variants={itemVariants}
                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    onClick={() => handleOptionClick(idx)}
                    disabled={isAnswered}
                    animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={isWrong ? { duration: 0.4 } : {}}
                    className={`w-full text-left p-5 rounded-2xl border-2 font-medium transition-colors flex justify-between items-center ${buttonClass}`}
                  >
                    <span className="text-[17px]">{option}</span>
                    {isCorrect && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={24} className="text-emerald-400" /></motion.div>}
                    {isWrong && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><X size={24} className="text-red-400" /></motion.div>}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Bar */}
      <div className="p-6 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 relative z-10 pb-8">
        {!isAnswered ? (
          <motion.button
            whileHover={selectedOption !== null ? { scale: 1.02 } : {}}
            whileTap={selectedOption !== null ? { scale: 0.97 } : {}}
            onClick={handleCheck}
            disabled={selectedOption === null}
            className={`w-full py-4 rounded-2xl font-extrabold tracking-wide text-lg shadow-lg flex justify-center items-center gap-2 transition-all border-2 border-transparent ${
              selectedOption !== null
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] active:shadow-none"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            CHECK ANSWER
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-extrabold tracking-wide text-lg flex justify-center items-center gap-2 transition-all border-2 border-transparent ${
               currentQuestionIdx < totalQuestions - 1 || isSubmitting
                ? "bg-zinc-100 hover:bg-white text-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                : "bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]"
            } disabled:opacity-50`}
          >
            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : (currentQuestionIdx < totalQuestions - 1 ? "NEXT QUESTION" : "FINISH QUIZ")} 
            {!isSubmitting && <ArrowRight size={20} />}
          </motion.button>
        )}
      </div>
    </div>
  );
}
