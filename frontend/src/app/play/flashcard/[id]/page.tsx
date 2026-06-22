"use client";
import { apiFetch } from "@/lib/api";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { X, ChevronLeft, ChevronRight, RotateCw, Loader2 } from "lucide-react";

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

export default function FlashcardStudyPage() {
  const params = useParams();
  const id = params.id;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await apiFetch(`http://127.0.0.1:8000/api/v1/quizzes/${id}/`);
        if (res.ok) {
          const data = await res.json();
          setFlashcards(data.flashcards || []);
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
      <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-zinc-100 mb-2">No Flashcards Found</h2>
        <p className="text-zinc-500 mb-6">This quiz doesn't have any flashcards yet.</p>
        <Link href={`/library/${id}`} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-semibold transition-colors">
          Go Back
        </Link>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 animate-in relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-96 bg-orange-500/10 blur-[120px] rounded-full z-0 pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between p-4 relative z-10">
        <Link href={`/library/${id}`} className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white interactive transition-colors">
          <X size={20} />
        </Link>
        <div className="text-zinc-100 font-bold font-outfit">
          {currentIndex + 1} <span className="text-zinc-500">/ {flashcards.length}</span>
        </div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </header>

      {/* Main Flashcard Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 perspective-1000">
        
        {/* Flashcard Container */}
        <div 
          className="w-full max-w-sm aspect-[3/4] relative cursor-pointer group"
          onClick={toggleFlip}
          style={{ perspective: '1000px' }}
        >
          <div 
            className={`w-full h-full transition-all duration-500 shadow-2xl rounded-3xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            
            {/* Front of Card */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <h2 className="text-2xl font-bold text-zinc-100 leading-relaxed font-outfit">
                {currentCard.front}
              </h2>
              <div className="absolute bottom-6 flex items-center gap-2 text-zinc-500 text-sm font-medium">
                <RotateCw size={14} /> Tap to flip
              </div>
            </div>

            {/* Back of Card */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 border-2 border-orange-400 rounded-3xl p-8 flex flex-col items-center justify-center text-center backface-hidden [transform:rotateY(180deg)]"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <h2 className="text-3xl font-bold text-white leading-relaxed font-outfit drop-shadow-md">
                {currentCard.back}
              </h2>
            </div>
          </div>
        </div>

      </main>

      {/* Controls */}
      <div className="p-6 relative z-10 pb-12 flex items-center justify-between gap-4 max-w-sm mx-auto w-full">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`w-14 h-14 rounded-full flex items-center justify-center interactive transition-colors ${
            currentIndex === 0 
              ? 'bg-zinc-900 border-zinc-800 text-zinc-700 cursor-not-allowed' 
              : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white border shadow-lg'
          }`}
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex gap-2">
           <div className={`w-2 h-2 rounded-full transition-colors ${!isFlipped ? 'bg-zinc-400' : 'bg-zinc-800'}`} />
           <div className={`w-2 h-2 rounded-full transition-colors ${isFlipped ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-zinc-800'}`} />
        </div>

        <button 
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className={`w-14 h-14 rounded-full flex items-center justify-center interactive transition-colors ${
            currentIndex === flashcards.length - 1 
              ? 'bg-zinc-900 border-zinc-800 text-zinc-700 cursor-not-allowed' 
              : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white border shadow-lg'
          }`}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
