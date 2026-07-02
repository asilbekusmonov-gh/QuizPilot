"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Loader2, Shuffle } from "lucide-react";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

export default function FlashcardStudyPage() {
  const params = useParams();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState("");
  
  // The full deck of flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  
  // The queue of cards yet to be mastered
  const [queue, setQueue] = useState<Flashcard[]>([]);
  
  const [currentIndex, setCurrentIndex] = useState(0); // Index in the queue
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Stats
  const [masteredCount, setMasteredCount] = useState(0);

  // Confetti dimensions
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const fetchQuiz = async () => {
      try {
        const res = await apiFetch(`http://127.0.0.1:8000/api/v1/quizzes/${id}/`);
        if (res.ok) {
          const data = await res.json();
          const cards = data.flashcards || [];
          setQuizTitle(data.title || "Flashcards");
          setFlashcards(cards);
          setQueue(cards);
        }
      } catch (error) {
        console.error("Failed to fetch flashcards:", error);
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
      <div className="flex flex-col min-h-screen bg-[#fcf9f2] items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fcf9f2] items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">No Flashcards Found</h2>
        <p className="text-zinc-500 mb-6">This quiz doesn&apos;t have any flashcards yet.</p>
        <Link href={`/library?tab=2`} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors">
          Go Back
        </Link>
      </div>
    );
  }

  // All cards mastered!
  if (queue.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="flex flex-col min-h-screen bg-[#fcf9f2] items-center justify-center p-6 text-center overflow-hidden"
      >
        <Confetti 
          width={windowSize.width} 
          height={windowSize.height} 
          recycle={false} 
          numberOfPieces={500} 
          gravity={0.15}
        />
        <motion.div 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-xl"
        >
          <span className="text-5xl">🎉</span>
        </motion.div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">You mastered everything!</h2>
        <p className="text-zinc-500 mb-8 font-medium">You have successfully mastered all {flashcards.length} flashcards.</p>
        <div className="flex gap-4 z-10">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setQueue(flashcards);
              setMasteredCount(0);
              setCurrentIndex(0);
              setIsFlipped(false);
            }} 
            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-6 py-3 rounded-xl font-bold transition-colors"
          >
            Study Again
          </motion.button>
          <Link href={`/library?tab=2`}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
            >
              Done
            </motion.button>
          </Link>
        </div>
      </motion.div>
    );
  }

  const currentCard = queue[currentIndex];
  const progressPercent = (masteredCount / flashcards.length) * 100;

  const handleLearning = () => {
    vibrate([50, 50, 50]); // Double tap haptic for "still learning"
    setIsFlipped(false);
    setTimeout(() => {
      if (queue.length > 1) {
        setCurrentIndex((currentIndex + 1) % queue.length);
      }
    }, 150);
  };

  const handleMastered = () => {
    vibrate(50); // Single crisp tap for "mastered"
    setIsFlipped(false);
    setTimeout(() => {
      const newQueue = [...queue];
      newQueue.splice(currentIndex, 1);
      setQueue(newQueue);
      setMasteredCount(prev => prev + 1);
      
      if (newQueue.length > 0) {
        setCurrentIndex(currentIndex % newQueue.length);
      }
    }, 150);
  };

  const handleShuffle = () => {
    vibrate([20, 20]);
    const shuffled = [...queue].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const toggleFlip = () => {
    vibrate(10);
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf9f2] relative overflow-hidden font-outfit">
      
      {/* Header */}
      <header className="p-4 relative z-10 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <Link href={`/library?tab=2`} className="text-blue-500 hover:text-blue-600 font-bold flex items-center transition-colors">
            <ChevronLeft size={24} />
          </Link>
          
          <h1 className="font-bold text-zinc-900 text-lg flex-1 text-center truncate px-4">{quizTitle}</h1>
          
          <div className="text-sm font-bold text-zinc-500">
            {masteredCount + currentIndex + 1}/{flashcards.length}
          </div>
        </div>
        
        {/* Progress bar container */}
        <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden flex relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="h-full bg-[#58CC02] rounded-full absolute left-0 top-0"
          />
        </div>

        {/* Counters */}
        <div className="flex justify-between items-center mt-3 px-2">
          <div className="text-[#58CC02] font-bold text-sm">
            <motion.span key={masteredCount} initial={{ scale: 1.5, color: "#fff" }} animate={{ scale: 1, color: "#58CC02" }} transition={{ duration: 0.3 }}>
              {masteredCount}
            </motion.span> mastered
          </div>
          <button onClick={handleShuffle} className="text-zinc-600 hover:text-zinc-900 active:scale-90 transition-transform">
             <Shuffle size={18} />
          </button>
          <div className="text-orange-500 font-bold text-sm">
            <motion.span key={queue.length} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
              {queue.length}
            </motion.span> learning
          </div>
        </div>
      </header>

      {/* Main Flashcard Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 perspective-1000 max-w-md mx-auto w-full pb-32">
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentCard.id}
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -50, rotateY: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full aspect-[4/3] sm:aspect-[4/3] relative cursor-pointer group"
            onClick={toggleFlip}
            style={{ perspective: '1000px' }}
          >
            <div 
              className={`w-full h-full transition-transform duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              
              {/* Front of Card */}
              <div 
                className="absolute inset-0 bg-white border border-zinc-100 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center backface-hidden shadow-sm"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <h2 className="text-xl sm:text-3xl font-bold text-zinc-800 leading-relaxed tracking-tight">
                  {currentCard.front}
                </h2>
              </div>

              {/* Back of Card */}
              <div 
                className="absolute inset-0 bg-white border-2 border-[#58CC02]/20 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center backface-hidden [transform:rotateY(180deg)] shadow-sm"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="absolute top-4 left-4 bg-[#58CC02]/10 text-[#58CC02] text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                  Answer
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-700 leading-relaxed mt-4 overflow-y-auto max-h-[80%] custom-scrollbar pr-2">
                  {currentCard.back}
                </h2>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#fcf9f2] via-[#fcf9f2] to-transparent z-20">
        <div className="max-w-md mx-auto w-full flex gap-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLearning}
            className="flex-1 bg-orange-500 hover:bg-orange-400 active:shadow-none shadow-[0_4px_0_#c2410c] text-white font-extrabold text-lg tracking-wide py-4 rounded-2xl transition-colors border-2 border-transparent"
          >
            LEARNING
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMastered}
            className="flex-1 bg-[#58CC02] hover:bg-[#46A302] active:shadow-none shadow-[0_4px_0_#46A302] text-white font-extrabold text-lg tracking-wide py-4 rounded-2xl transition-colors border-2 border-transparent"
          >
            MASTERED
          </motion.button>
        </div>
      </div>

    </div>
  );
}
