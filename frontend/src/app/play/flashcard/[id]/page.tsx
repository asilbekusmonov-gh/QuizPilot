"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Loader2, Shuffle } from "lucide-react";

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

  useEffect(() => {
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
      <div className="flex flex-col min-h-screen bg-[#fcf9f2] items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-5xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">You mastered everything!</h2>
        <p className="text-zinc-500 mb-8 font-medium">You have successfully mastered all {flashcards.length} flashcards.</p>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              setQueue(flashcards);
              setMasteredCount(0);
              setCurrentIndex(0);
              setIsFlipped(false);
            }} 
            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-6 py-3 rounded-xl font-bold transition-colors"
          >
            Study Again
          </button>
          <Link href={`/library?tab=2`} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors">
            Done
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = queue[currentIndex];
  const progressPercent = (masteredCount / flashcards.length) * 100;

  const handleLearning = () => {
    // If user clicks learning, the card goes to the back of the queue (or we just move to the next card in queue)
    setIsFlipped(false);
    setTimeout(() => {
      // Move to next card in the queue, wrapping around
      if (queue.length > 1) {
        setCurrentIndex((currentIndex + 1) % queue.length);
      }
    }, 150);
  };

  const handleMastered = () => {
    // Remove the current card from the queue
    setIsFlipped(false);
    setTimeout(() => {
      const newQueue = [...queue];
      newQueue.splice(currentIndex, 1);
      setQueue(newQueue);
      setMasteredCount(prev => prev + 1);
      
      // If there are still cards, adjust the current index if needed
      if (newQueue.length > 0) {
        setCurrentIndex(currentIndex % newQueue.length);
      }
    }, 150);
  };

  const handleShuffle = () => {
    const shuffled = [...queue].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf9f2] animate-in relative overflow-hidden font-outfit">
      
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
        <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-[#58CC02] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Counters */}
        <div className="flex justify-between items-center mt-3 px-2">
          <div className="text-[#58CC02] font-bold text-sm">
            {masteredCount} mastered
          </div>
          <button onClick={handleShuffle} className="text-zinc-600 hover:text-zinc-900">
             <Shuffle size={18} />
          </button>
          <div className="text-orange-500 font-bold text-sm">
            {queue.length} learning
          </div>
        </div>
      </header>

      {/* Main Flashcard Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 perspective-1000 max-w-md mx-auto w-full pb-32">
        
        {/* Flashcard Container */}
        <div 
          className="w-full aspect-[4/3] sm:aspect-[4/3] relative cursor-pointer group"
          onClick={toggleFlip}
          style={{ perspective: '1000px' }}
        >
          <div 
            className={`w-full h-full transition-transform duration-500 shadow-sm rounded-3xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            
            {/* Front of Card */}
            <div 
              className="absolute inset-0 bg-white border border-zinc-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center backface-hidden shadow-sm"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-800 leading-relaxed">
                {currentCard.front}
              </h2>
            </div>

            {/* Back of Card */}
            <div 
              className="absolute inset-0 bg-white border border-zinc-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center backface-hidden [transform:rotateY(180deg)] shadow-sm"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="absolute top-4 left-4 bg-[#58CC02] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider">
                BACK
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-700 leading-relaxed mt-4 overflow-y-auto max-h-[80%] custom-scrollbar pr-2">
                {currentCard.back}
              </h2>
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#fcf9f2] via-[#fcf9f2] to-transparent z-20">
        <div className="max-w-md mx-auto w-full flex gap-4">
          <button 
            onClick={handleLearning}
            className="flex-1 bg-orange-500 hover:bg-orange-400 active:translate-y-1 active:shadow-none shadow-[0_4px_0_#c2410c] text-white font-bold py-4 rounded-2xl transition-all"
          >
            learning
          </button>
          
          <button 
            onClick={handleMastered}
            className="flex-1 bg-[#58CC02] hover:bg-[#58CC02]/90 active:translate-y-1 active:shadow-none shadow-[0_4px_0_#46A302] text-white font-bold py-4 rounded-2xl transition-all"
          >
            mastered
          </button>
        </div>
      </div>

    </div>
  );
}
