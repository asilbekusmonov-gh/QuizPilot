"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Edit3, Trash2, Image as ImageIcon, Loader2, CheckCircle2, Circle } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function EditQuizPage() {
  const params = useParams();
  const id = params.id;

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Track which question is currently in edit mode
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  
  // Draft state for the question being edited
  const [draftQuestion, setDraftQuestion] = useState<any>(null);
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

  const handleEditClick = (question: any) => {
    setEditingQuestionId(question.id);
    // Create a deep copy for the draft
    setDraftQuestion(JSON.parse(JSON.stringify(question)));
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setDraftQuestion(null);
  };

  const handleDelete = async (questionId: number) => {
    try {
      const res = await apiFetch(`http://127.0.0.1:8000/api/v1/questions/${questionId}/`, {
        method: "DELETE"
      });
      if (res.ok) {
        setQuiz((prev: any) => ({
          ...prev,
          questions: prev.questions.filter((q: any) => q.id !== questionId)
        }));
        if (editingQuestionId === questionId) {
          handleCancelEdit();
        }
        setConfirmDeleteId(null);
      } else {
        alert("Failed to delete question.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting question.");
    }
  };

  const handleSave = async () => {
    if (!draftQuestion) return;
    setIsSaving(true);
    
    try {
      // 1. Update question text
      const qRes = await apiFetch(`http://127.0.0.1:8000/api/v1/questions/${draftQuestion.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draftQuestion.text })
      });
      
      if (!qRes.ok) throw new Error("Failed to update question text");

      // 2. Update all options in parallel
      const optionPromises = draftQuestion.options.map((opt: any) => 
        apiFetch(`http://127.0.0.1:8000/api/v1/options/${opt.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: opt.text, is_correct: opt.is_correct })
        })
      );
      
      await Promise.all(optionPromises);
      
      // Refresh to get the latest state
      await fetchQuiz();
      handleCancelEdit();
      
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draftQuestion) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await apiFetch(`http://127.0.0.1:8000/api/v1/questions/${draftQuestion.id}/`, {
        method: "PATCH",
        body: formData // Let browser set Content-Type with boundary
      });
      if (res.ok) {
        const updatedQuestion = await res.json();
        setDraftQuestion((prev: any) => ({...prev, image: updatedQuestion.image}));
        await fetchQuiz(); // Refresh global state
      } else {
        alert("Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
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
        <Link href="/library" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf9f2] font-outfit text-zinc-900 pb-20">
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-zinc-200 sticky top-0 z-10">
        <Link href="/library" className="text-blue-500 hover:text-blue-600 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="font-bold text-[17px]">Edit Question</div>
        <div className="w-6 h-6" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-4 max-w-3xl mx-auto w-full pt-6 gap-6">
        
        {quiz.questions?.map((question: any, index: number) => {
          const isEditing = editingQuestionId === question.id;
          const displayQuestion = isEditing ? draftQuestion : question;
          
          return (
            <div key={question.id} className="w-full bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
              
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#eef4ff] text-[#75a6f9] px-3 py-1 rounded-full text-xs font-bold">
                  Q{index + 1}
                </div>
                
                <div className="flex items-center gap-4">
                  {isEditing ? (
                    <button onClick={handleCancelEdit} className="text-[#75a6f9] hover:text-[#5b95f7] flex items-center gap-1 text-sm font-bold transition-colors">
                      <Edit3 size={14} /> Cancel
                    </button>
                  ) : (
                    <button onClick={() => handleEditClick(question)} className="text-[#75a6f9] hover:text-[#5b95f7] flex items-center gap-1 text-sm font-bold transition-colors">
                      <Edit3 size={14} /> Edit Question
                    </button>
                  )}
                  
                  {confirmDeleteId === question.id ? (
                    <div className="flex items-center gap-2 animate-in fade-in">
                      <span className="text-xs font-bold text-red-500">Delete?</span>
                      <button onClick={() => handleDelete(question.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm transition-colors">Yes</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-500 px-3 py-1 rounded-lg text-xs font-bold shadow-sm transition-colors">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(question.id)} className="text-red-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Content */}
              {isEditing ? (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <textarea 
                    value={draftQuestion.text}
                    onChange={(e) => setDraftQuestion({...draftQuestion, text: e.target.value})}
                    className="w-full min-h-[100px] border-2 border-[#75a6f9] rounded-xl p-4 text-sm font-bold text-zinc-800 focus:outline-none resize-y"
                  />
                  
                  {/* Image Upload/Preview */}
                  <div>
                    {draftQuestion.image ? (
                      <div className="relative inline-block">
                        <img src={draftQuestion.image} alt="Question" className="max-h-40 rounded-xl border border-zinc-200" />
                        <label className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow border cursor-pointer hover:bg-zinc-50">
                          <Edit3 size={14} className="text-zinc-600" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                    ) : (
                      <label className="w-24 h-20 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:border-[#75a6f9] hover:text-[#75a6f9] transition-colors gap-1 cursor-pointer">
                        <ImageIcon size={20} />
                        <span className="text-[10px] font-bold">Add image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                  
                  {/* Options */}
                  <div className="flex flex-col gap-3">
                    {draftQuestion.options.map((opt: any, optIdx: number) => (
                      <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                        opt.is_correct ? "border-[#58cc02] bg-[#f2fbf0]" : "border-zinc-200"
                      }`}>
                        <button 
                          onClick={() => {
                            const newOptions = draftQuestion.options.map((o: any) => ({
                              ...o,
                              is_correct: o.id === opt.id
                            }));
                            setDraftQuestion({...draftQuestion, options: newOptions});
                          }}
                          className={`flex-shrink-0 ${opt.is_correct ? "text-[#58cc02]" : "text-zinc-300 hover:text-zinc-400"}`}
                        >
                          {opt.is_correct ? <CheckCircle2 size={24} fill="#58cc02" className="text-white" /> : <Circle size={24} />}
                        </button>
                        <input 
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOptions = [...draftQuestion.options];
                            newOptions[optIdx].text = e.target.value;
                            setDraftQuestion({...draftQuestion, options: newOptions});
                          }}
                          className="flex-1 bg-transparent border-none focus:outline-none text-sm font-bold text-zinc-700"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Save Button */}
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full mt-2 bg-[#58cc02] hover:bg-[#46a302] disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-[0_4px_0_#46a302] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                  <h3 className="font-bold text-[15px] text-zinc-800">{question.text}</h3>
                  {question.image && (
                    <img src={question.image} alt="Question" className="max-h-48 rounded-xl border border-zinc-200 self-start" />
                  )}
                  
                  <div className="flex flex-col gap-2">
                    {question.options?.map((opt: any, idx: number) => {
                      const labels = ["A)", "B)", "C)", "D)", "E)"];
                      return (
                        <div key={opt.id} className={`p-3 rounded-xl border flex items-center gap-3 ${
                          opt.is_correct ? "border-[#58cc02] bg-[#f2fbf0]" : "border-zinc-200 bg-white"
                        }`}>
                          <div className={`flex-shrink-0 ${opt.is_correct ? "text-[#58cc02]" : "text-zinc-400"}`}>
                            {opt.is_correct ? <CheckCircle2 size={18} fill="#58cc02" className="text-white" /> : <Circle size={18} />}
                          </div>
                          <span className={`text-sm ${opt.is_correct ? "font-bold text-[#46a302]" : "font-medium text-zinc-500"}`}>
                            {labels[idx]} {opt.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          );
        })}
        
        {quiz.questions?.length === 0 && (
          <div className="text-zinc-500 text-center py-10 font-bold">
            No questions found in this quiz.
          </div>
        )}
        
      </main>
    </div>
  );
}
