"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Maximize2, Minimize2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function SlideshowPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await apiFetch(`http://127.0.0.1:8000/api/v1/quizzes/${id}/`);
        if (res.ok) {
          const data = await res.json();
          // Sort slides by order just in case
          if (data.slides) {
            data.slides.sort((a: any, b: any) => a.order - b.order);
          }
          setQuiz(data);
        }
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleNext = useCallback(() => {
    if (quiz?.slides && currentSlideIndex < quiz.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  }, [currentSlideIndex, quiz]);

  const handlePrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  }, [currentSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0f0f11] items-center justify-center">
        <Loader2 className="animate-spin text-teal-500 w-10 h-10" />
      </div>
    );
  }

  if (!quiz || !quiz.slides || quiz.slides.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0f0f11] items-center justify-center p-6 text-center text-white">
        <h2 className="text-xl font-bold mb-2">No Slides Found</h2>
        <p className="text-zinc-400 mb-6">This presentation is empty.</p>
        <button onClick={() => router.back()} className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const currentSlide = quiz.slides[currentSlideIndex];
  const progressPercentage = ((currentSlideIndex + 1) / quiz.slides.length) * 100;

  // Simple Markdown-like renderer for bullet points
  const renderContent = (content: string) => {
    return content.split('\\n').map((line, i) => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
        return <li key={i} className="ml-6 list-disc mb-3 text-zinc-300 leading-relaxed text-lg sm:text-xl">{cleanLine.substring(2)}</li>;
      }
      if (cleanLine === '') return <br key={i} />;
      return <p key={i} className="mb-4 text-zinc-300 leading-relaxed text-lg sm:text-xl">{cleanLine}</p>;
    });
  };

  return (
    <div className={`flex flex-col min-h-screen bg-[#0a0a0b] text-white font-outfit overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      
      {/* Top Bar */}
      <div className={`flex items-center justify-between p-4 transition-opacity duration-300 ${isFullscreen ? 'opacity-0 hover:opacity-100 absolute top-0 left-0 right-0 z-20 bg-black/50 backdrop-blur-sm' : 'border-b border-zinc-800/50 relative z-10'}`}>
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-900/50 rounded-full transition-colors">
          <X size={20} />
        </button>
        <div className="font-semibold text-zinc-300 hidden sm:block">{quiz.title}</div>
        <button onClick={toggleFullscreen} className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-900/50 rounded-full transition-colors">
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {/* Main Slide Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-12 relative h-full">
        <div className="w-full max-w-5xl aspect-video bg-zinc-900/40 border border-zinc-800/80 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500">
          
          <div className="flex-1 p-8 sm:p-16 overflow-y-auto">
            <h1 className="text-3xl sm:text-5xl font-bold text-teal-400 mb-8 sm:mb-12 leading-tight">
              {currentSlide.title}
            </h1>
            <div className="prose prose-invert max-w-none">
              <ul>
                {renderContent(currentSlide.content)}
              </ul>
            </div>
          </div>
          
          <div className="absolute bottom-6 right-8 text-zinc-600 font-medium text-sm">
            {currentSlideIndex + 1} / {quiz.slides.length}
          </div>
        </div>

        {/* Floating Navigation Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-6">
          <button 
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-black/40 hover:bg-black/80 text-white rounded-full disabled:opacity-30 transition-all backdrop-blur-md border border-white/10"
          >
            <ChevronLeft size={32} />
          </button>
        </div>
        
        <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-6">
          <button 
            onClick={handleNext}
            disabled={currentSlideIndex === quiz.slides.length - 1}
            className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-black/40 hover:bg-black/80 text-white rounded-full disabled:opacity-30 transition-all backdrop-blur-md border border-white/10"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </main>

      {/* Progress Bar */}
      <div className="h-1.5 bg-zinc-900 w-full fixed bottom-0 left-0">
        <div 
          className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.8)] transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

    </div>
  );
}
