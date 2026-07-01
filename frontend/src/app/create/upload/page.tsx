"use client";
import { apiFetch } from "@/lib/api";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, FileUp, Loader2, CheckCircle2, AlertTriangle, Hash, CheckSquare, Sparkles } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const genType = searchParams.get('type') || 'quiz';
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dict } = useLanguage();
  const d = dict.create_upload;

  const [step, setStep] = useState<"upload" | "analyzing" | "settings" | "generating" | "success">("upload");
  const [file, setFile] = useState<File | null>(null);
  
  // Settings state
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [quizName, setQuizName] = useState("");
  const [multipleAnswers, setMultipleAnswers] = useState(false);
  const [quizType, setQuizType] = useState<"single" | "multiple">("single");
  const [errorText, setErrorText] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File selection triggered!");
    const f = e.target.files?.[0];
    if (!f) {
      console.log("No file selected or dialog cancelled");
      return;
    }
    
    console.log("File selected:", f.name);
    setFile(f);
    const nameWithoutExt = f.name.replace(/\.[^/.]+$/, "");
    setQuizName(nameWithoutExt);
    setErrorText("");
    
    // Phase 1: Upload and Analyze
    console.log("Setting step to analyzing...");
    setStep("analyzing");
    
    const formData = new FormData();
    formData.append("file", f);
    
    try {
      const res = await apiFetch("http://127.0.0.1:8000/api/v1/documents/", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setDocumentId(data.document.id);
        setNumQuestions(data.detected_count || 10);
        setStep("settings");
      } else {
        const errData = await res.json();
        setErrorText("Error analyzing file: " + JSON.stringify(errData));
        setStep("upload");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setErrorText("Network error: Could not reach the server.");
      setStep("upload");
    }
  };

  const handleGenerate = async () => {
    if (!documentId) return;
    setStep("generating");
    setErrorText("");
    
    // Phase 2: Start Background Generation Task
    try {
      const res = await apiFetch(`http://127.0.0.1:8000/api/v1/documents/${documentId}/generate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          num_questions: numQuestions,
          quiz_name: quizName,
          type: genType
        }),
      });

      if (res.ok) {
        // Automatically move to the library page
        if (genType === 'flashcard' || genType === 'flashcards') {
          router.push("/library?tab=2");
        } else if (genType === 'slide' || genType === 'slides') {
          router.push("/library?tab=3");
        } else {
          router.push("/library");
        }
      } else {
        const errData = await res.json();
        setErrorText("Error: " + JSON.stringify(errData));
        setStep("settings");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      setErrorText("Network error: Could not reach the server.");
      setStep("settings");
    }
  };

  return (
    <div className="pt-8 pb-32 animate-in relative min-h-screen">
      {/* Header */}
      {(step === "upload" || step === "settings") && (
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => step === "settings" ? setStep("upload") : router.push("/")} className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 interactive transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold font-outfit text-zinc-100">{d.title}</h1>
          <div className="w-10" />
        </div>
      )}

      {errorText && step === "upload" && (
         <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-medium mb-4">
           {errorText}
         </div>
      )}

      {/* STEP: UPLOAD */}
      {step === "upload" && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) {
              console.log("File dropped natively!");
              // Manually create a fake event-like object to pass to handleFileChange
              handleFileChange({target: {files: [droppedFile]}} as never).then(() => {
                console.log("Fayl muvaffaqiyatli yuklandi!");
              });
             }
          }}
          className="glass-panel border-2 border-dashed border-zinc-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center mt-12 transition-colors group hover:border-indigo-500/50 hover:bg-zinc-800/50 cursor-pointer block"
        >
          <input 
            ref={fileInputRef}
            type="file" 
            onClick={(e) => { 
              e.stopPropagation();
              (e.target as HTMLInputElement).value = ''; 
              console.log("Input clicked, value cleared!"); 
            }}
            onChange={(e) => {
              console.log("onChange fired via ref!");
              handleFileChange(e).then(() => {
                console.log("Fayl muvaffaqiyatli yuklandi!");
              });
            }}
            className="sr-only" 
            accept=".pdf,.doc,.docx,.txt"
          />
          
          <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <FileUp size={40} strokeWidth={1.5} />
          </div>
          
          <h3 className="font-semibold text-lg text-zinc-100 mb-2">{d.select_file}</h3>
          <p className="text-sm text-zinc-500 mb-8 font-medium">{d.choose_device}</p>
          
          <div className="bg-indigo-600 group-hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all inline-block pointer-events-none">
            {d.choose_device}
          </div>
        </div>
      )}

      {/* STEP: ANALYZING */}
      {step === "analyzing" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in-95 fade-in duration-300">
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-4 border-indigo-500/20 flex items-center justify-center mb-6 relative">
             <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
             <FileUp className="text-indigo-400 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Analyzing PDF...</h2>
          <p className="text-sm text-zinc-500">Detecting questions with AI</p>
        </div>
      )}

      {/* STEP: SETTINGS */}
      {step === "settings" && (
        <div className="flex flex-col gap-4">
          
          {errorText && (
             <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-medium">
               {errorText}
             </div>
          )}

          {/* Detected Questions Box */}
          <div className="glass-panel rounded-2xl p-4 flex items-center gap-4 border border-green-500/30">
            <div className="text-4xl font-bold text-indigo-400 ml-2">{numQuestions}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-zinc-100">
                {genType === 'flashcard' 
                  ? `Found approximately ${numQuestions} flashcards` 
                  : (d.detected_title?.replace('{count}', numQuestions.toString()) || `Found ${numQuestions} questions`)}
              </h3>
              <p className="text-xs text-zinc-500">{d.detected_desc}</p>
            </div>
            <CheckCircle2 className="text-green-500 w-6 h-6 mr-2" />
          </div>

          {/* Custom Question Count */}
          <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Hash size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-100">{d.custom_count_title}</h3>
                <p className="text-xs text-zinc-500">{d.custom_count_desc}</p>
              </div>
            </div>
            <input 
              type="number" 
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value) || 1)}
              className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-center text-zinc-100 focus:outline-none focus:border-indigo-500"
              min={1}
              max={50}
            />
          </div>

          {/* Multiple Correct Answers */}
          <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                <CheckSquare size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-100">{d.multi_correct_title}</h3>
                <p className="text-xs text-zinc-500">{d.multi_correct_desc}</p>
              </div>
            </div>
            <button 
              onClick={() => setMultipleAnswers(!multipleAnswers)}
              className={`w-12 h-6 rounded-full transition-colors relative ${multipleAnswers ? 'bg-indigo-500' : 'bg-zinc-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${multipleAnswers ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Segmented Control */}
          {genType !== 'flashcard' && (
            <div className="flex bg-zinc-900/80 p-1 rounded-2xl border border-zinc-800 mt-2">
              <button 
                onClick={() => setQuizType("single")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all interactive ${
                  quizType === "single" 
                    ? "bg-indigo-500 text-white shadow-md" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {d.single_quiz_tab}
              </button>
              <button 
                onClick={() => setQuizType("multiple")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all interactive ${
                  quizType === "multiple" 
                    ? "bg-indigo-500 text-white shadow-md" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {d.multi_group_tab}
              </button>
            </div>
          )}

          {/* Info block */}
          {genType !== 'flashcard' && (
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
               <p className="text-xs text-zinc-400 font-semibold mb-1">{d.whats_the_difference}</p>
               <ul className="text-xs text-zinc-500 space-y-1">
                 <li>• <strong className="text-zinc-300">{d.single_quiz_tab}</strong> — {d.single_quiz_desc}</li>
                 <li>• <strong className="text-zinc-300">{d.multi_group_tab}</strong> — {d.multi_group_desc}</li>
               </ul>
            </div>
          )}

          {/* Quiz Name */}
          <div className="mt-2">
            <p className="text-sm font-semibold text-zinc-300 mb-2">{d.quiz_name_label}</p>
            <input 
              type="text" 
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* AI Warning */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-start gap-3 mt-4">
            <AlertTriangle className="text-orange-400 w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-400/80 leading-relaxed">
              {d.ai_warning}
            </p>
          </div>

          <button 
            onClick={handleGenerate}
            className="w-full bg-[#58CC02] hover:bg-[#58CC02]/90 text-white font-bold py-4 rounded-2xl mt-2 interactive shadow-[0_4px_0_#46A302] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            {genType === 'flashcard' ? "Generate Flashcards" : d.generate_btn}
          </button>
        </div>
      )}

      {/* STEP: GENERATING */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in-95 fade-in duration-300">
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-4 border-indigo-500/20 flex items-center justify-center mb-6 relative">
             <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
             <Sparkles className="text-indigo-400 w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">{d.generating_title}</h2>
          <p className="text-sm text-zinc-500">{d.generating_desc}</p>
        </div>
      )}
    </div>
  );
}
