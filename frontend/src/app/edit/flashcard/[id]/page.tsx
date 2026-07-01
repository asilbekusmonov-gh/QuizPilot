"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Edit3, Trash2, Loader2, Save } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function EditFlashcardPage() {
  const params = useParams();
  const id = params.id;

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Track which flashcard is currently in edit mode
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  // Draft state for the flashcard being edited
  const [draftCard, setDraftCard] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchQuiz = async () => {
    try {
      const res = await apiFetch(`http://127.0.0.1:8000/api/v1/quizzes/${id}/`);
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
      }
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const handleEditClick = (card: any) => {
    setEditingCardId(card.id);
    setDraftCard(JSON.parse(JSON.stringify(card)));
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setDraftCard(null);
  };

  const handleDelete = async (cardId: number) => {
    try {
      const res = await apiFetch(`http://127.0.0.1:8000/api/v1/flashcards/${cardId}/`, {
        method: "DELETE"
      });
      if (res.ok) {
        setQuiz((prev: any) => ({
          ...prev,
          flashcards: prev.flashcards.filter((c: any) => c.id !== cardId)
        }));
        if (editingCardId === cardId) {
          handleCancelEdit();
        }
        setConfirmDeleteId(null);
      } else {
        alert("Failed to delete flashcard.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting flashcard.");
    }
  };

  const handleSave = async () => {
    if (!draftCard) return;
    setIsSaving(true);
    
    try {
      const res = await apiFetch(`http://127.0.0.1:8000/api/v1/flashcards/${draftCard.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: draftCard.front, back: draftCard.back })
      });
      
      if (!res.ok) throw new Error("Failed to update flashcard");

      await fetchQuiz();
      handleCancelEdit();
      
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fcf9f2] items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fcf9f2] items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-zinc-800 mb-2">Quiz Not Found</h2>
        <Link href="/library?tab=2" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf9f2] font-outfit text-zinc-900 pb-20">
      
      <header className="flex items-center justify-between p-4 bg-white border-b border-zinc-200 sticky top-0 z-10">
        <Link href="/library?tab=2" className="text-blue-500 hover:text-blue-600 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="font-bold text-[17px]">Edit Flashcards</div>
        <div className="w-6 h-6" />
      </header>

      <main className="flex-1 flex flex-col items-center p-4 max-w-3xl mx-auto w-full pt-6 gap-6">
        
        {quiz.flashcards?.map((card: any, index: number) => {
          const isEditing = editingCardId === card.id;
          const displayCard = isEditing ? draftCard : card;
          
          return (
            <div key={card.id} className="w-full bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
              
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#eef4ff] text-[#75a6f9] px-3 py-1 rounded-full text-xs font-bold">
                  Card {index + 1}
                </div>
                
                <div className="flex items-center gap-4">
                  {isEditing ? (
                    <button onClick={handleCancelEdit} className="text-[#75a6f9] hover:text-[#5b95f7] flex items-center gap-1 text-sm font-bold transition-colors">
                      <Edit3 size={14} /> Cancel
                    </button>
                  ) : (
                    <button onClick={() => handleEditClick(card)} className="text-[#75a6f9] hover:text-[#5b95f7] flex items-center gap-1 text-sm font-bold transition-colors">
                      <Edit3 size={14} /> Edit
                    </button>
                  )}
                  
                  {confirmDeleteId === card.id ? (
                    <div className="flex items-center gap-2 animate-in fade-in">
                      <span className="text-xs font-bold text-red-500">Delete?</span>
                      <button onClick={() => handleDelete(card.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm transition-colors">Yes</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-500 px-3 py-1 rounded-lg text-xs font-bold shadow-sm transition-colors">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(card.id)} className="text-red-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 mb-1 block uppercase tracking-wide">Front</label>
                    <textarea 
                      value={draftCard.front}
                      onChange={(e) => setDraftCard({...draftCard, front: e.target.value})}
                      className="w-full min-h-[80px] border-2 border-[#75a6f9] rounded-xl p-4 text-sm font-bold text-zinc-800 focus:outline-none resize-y"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-zinc-500 mb-1 block uppercase tracking-wide">Back</label>
                    <textarea 
                      value={draftCard.back}
                      onChange={(e) => setDraftCard({...draftCard, back: e.target.value})}
                      className="w-full min-h-[80px] border-2 border-[#58cc02] rounded-xl p-4 text-sm font-bold text-zinc-800 focus:outline-none resize-y"
                    />
                  </div>

                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full mt-2 bg-[#58cc02] hover:bg-[#46a302] disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-[0_4px_0_#46a302] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 animate-in fade-in duration-300">
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <span className="text-xs font-bold text-zinc-400 mb-1 block uppercase">Front</span>
                    <h3 className="font-bold text-[15px] text-zinc-800">{card.front}</h3>
                  </div>
                  <div className="p-3 bg-[#f2fbf0] rounded-xl border border-[#e6f4d8]">
                    <span className="text-xs font-bold text-[#46a302]/70 mb-1 block uppercase">Back</span>
                    <h3 className="font-bold text-[15px] text-[#46a302]">{card.back}</h3>
                  </div>
                </div>
              )}

            </div>
          );
        })}
        
        {quiz.flashcards?.length === 0 && (
          <div className="text-zinc-500 text-center py-10 font-bold bg-white rounded-3xl border border-zinc-200 w-full">
            No flashcards found.
          </div>
        )}
        
      </main>
    </div>
  );
}
