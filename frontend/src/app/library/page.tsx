"use client";

import { PlayCircle, Edit3, MoreVertical, Zap, Loader2, Bookmark, Download, Globe, CheckSquare, Search, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface Quiz {
  id: number;
  title: string;
  description: string;
  created_by_username: string;
  is_public: boolean;
  created_on: string;
  questions: any[];
}

interface PublicQuiz {
  id: number;
  title: string; // This is the category
  quiz: number;
  quiz_details: Quiz;
}

export const CATEGORIES = [
  "All", "DTM", "Mathematics", "Algebra", "Geometry", "Trigonometry", "Physics", "Chemistry", 
  "Astronomy", "Biology", "Zoology", "Botany", "Anatomy", "Ecology", "Geography", 
  "History of Uzbekistan", "World History", "Law", "Economics", "Philosophy", "Sociology", 
  "Political Science", "Uzbek Language", "Uzbek Literature", "Russian Language", 
  "English Language", "German Language", "French Language", "Arabic Language", 
  "Korean Language", "Chinese Language", "Computer Science", "Programming", "Robotics", 
  "Design", "Music", "Fine Arts", "Physical Education", "Psychology", "Medicine", 
  "Engineering", "Architecture", "Religious Studies"
];

export default function LibraryPage() {
  const { dict } = useLanguage();
  const searchParams = useSearchParams();
  const d = dict.library || {};

  const tabs = [
    { label: d.tabs?.quizzes || "Quizzes", icon: "?" },
    { label: "Public", icon: "🌐", id: 'public' },
    { label: d.tabs?.flashcards || "Flashcards", icon: "📁" },
    { label: d.tabs?.slides || "Slides", icon: "🎞" }
  ];
  
  const initialTab = parseInt(searchParams.get('tab') || '0', 10);
  const [activeTab, setActiveTab] = useState(initialTab);
  
  useEffect(() => {
    const tab = parseInt(searchParams.get('tab') || '0', 10);
    setActiveTab(tab);
  }, [searchParams]);

  const [publicTab, setPublicTab] = useState<'Feed' | 'Mine'>('Feed');
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [publicQuizzes, setPublicQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [publicLoading, setPublicLoading] = useState(false);

  // Publish Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishCategory, setPublishCategory] = useState("DTM");
  const [selectedToPublish, setSelectedToPublish] = useState<number[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await apiFetch("http://127.0.0.1:8000/api/v1/quizzes/");
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data);
        }
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const fetchPublic = async () => {
    setPublicLoading(true);
    try {
      const url = new URL("http://127.0.0.1:8000/api/v1/public/");
      if (publicTab === 'Mine') {
        url.searchParams.append("mine", "true");
      } else {
        if (selectedCategory !== "All") {
          url.searchParams.append("category", selectedCategory);
        }
      }
      
      const res = await apiFetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setPublicQuizzes(data);
      }
    } catch (error) {
      console.error("Failed to fetch public quizzes:", error);
    } finally {
      setPublicLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 1) {
      fetchPublic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, publicTab, selectedCategory]);

  const handlePublish = async () => {
    if (selectedToPublish.length === 0) return;
    setIsPublishing(true);
    
    try {
      // Create an array of payloads to create multiple Public entries
      const payload = selectedToPublish.map(quizId => ({
        title: publishCategory,
        quiz: quizId
      }));
      
      const res = await apiFetch("http://127.0.0.1:8000/api/v1/public/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsPublishModalOpen(false);
        setSelectedToPublish([]);
        if (publicTab === 'Mine') {
          fetchPublic();
        } else {
          setPublicTab('Mine'); // switch to mine to see them
        }
      }
    } catch (err) {
      console.error("Publish failed:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleSelectToPublish = (id: number) => {
    setSelectedToPublish(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="pt-8 pb-32 animate-in relative min-h-screen">
      <h1 className="text-2xl font-bold mb-6 font-outfit text-zinc-100">{d.title || "Library"}</h1>
      
      {/* Main Tabs - Styled like pills in the screenshot */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 bg-white/5 p-2 rounded-2xl border border-zinc-800 shadow-sm mx-auto w-fit">
        {tabs.map((tab, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all interactive ${
              activeTab === idx 
                ? tab.id === 'public' 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                  : "bg-white text-zinc-900 shadow-md"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            }`}
          >
            <span className="opacity-70 text-xs">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Public Sub Navigation */}
      {activeTab === 1 && (
        <div className="flex items-center justify-center max-w-sm mx-auto mb-6">
           <div className="flex w-full bg-zinc-900/80 p-1 rounded-2xl border border-zinc-800">
            <button 
              onClick={() => setPublicTab('Feed')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${publicTab === 'Feed' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400'}`}
            >
              {d.feed || "Feed"}
            </button>
            <button 
              onClick={() => setPublicTab('Mine')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${publicTab === 'Mine' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400'}`}
            >
              {d.mine || "Mine"}
            </button>
           </div>
        </div>
      )}

      {/* Public Feed Content */}
      {activeTab === 1 && publicTab === 'Feed' && (
        <div className="animate-in fade-in duration-300">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text"
              placeholder="Search"
              className="w-full bg-white/5 border border-zinc-800 rounded-full py-3 pl-11 pr-4 text-zinc-200 focus:outline-none focus:border-blue-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                  selectedCategory === cat 
                    ? "bg-blue-600 text-white border-blue-500" 
                    : "bg-white/5 text-zinc-300 border-zinc-800 hover:bg-white/10"
                }`}
              >
                {cat === 'DTM' && selectedCategory === cat && <span className="mr-1">🔥</span>}
                {cat}
              </button>
            ))}
          </div>
          
          <div className="text-blue-500 text-xs font-bold mb-4 cursor-pointer hover:underline">See less ^</div>

          {publicLoading ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>
          ) : publicQuizzes.length === 0 ? (
             <div className="text-center text-zinc-500 py-10 border border-zinc-800 rounded-2xl bg-zinc-900/30">
               {d.no_items || "No items found."}
             </div>
          ) : (
            <div className="flex flex-col gap-4">
              {publicQuizzes.map(item => (
                <div key={item.id} className="bg-white/5 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-200 font-bold">
                        {item.quiz_details.created_by_username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-100 flex items-center gap-1">
                          @{item.quiz_details.created_by_username}
                          <span className="text-blue-400 ml-1 text-xs">🎓</span>
                        </div>
                        <div className="text-xs text-zinc-500">{item.title}</div>
                      </div>
                    </div>
                    <MoreVertical size={16} className="text-zinc-500" />
                  </div>
                  
                  <h3 className="font-bold text-zinc-100 mb-2">{item.quiz_details.title}</h3>
                  
                  <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium mb-4">
                    <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded flex items-center gap-1">
                       ★ Featured
                    </span>
                    <span>{item.quiz_details.questions?.length || 0} questions</span>
                    <span><Bookmark size={12} className="inline mr-1" /> 0 saves</span>
                    <span>👍 0</span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors">
                      <Bookmark size={16} /> Save
                    </button>
                    <button className="flex-1 bg-orange-500 hover:bg-orange-400 text-white py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors">
                      <Download size={16} /> DOCX
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Public Mine Content */}
      {activeTab === 1 && publicTab === 'Mine' && (
        <div className="animate-in fade-in duration-300">
           {publicLoading ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>
           ) : publicQuizzes.length === 0 ? (
             <div className="text-center py-16 flex flex-col items-center">
               <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                 <Globe size={32} />
               </div>
               <h3 className="text-zinc-400 font-bold mb-4">{d.no_published || "You haven't published any quizzes yet."}</h3>
               <button 
                 onClick={() => setIsPublishModalOpen(true)}
                 className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
               >
                 <PlusCircle size={16} /> Publish a Quiz
               </button>
             </div>
           ) : (
             <div className="flex flex-col gap-4">
               <div className="flex justify-end mb-2">
                 <button 
                   onClick={() => setIsPublishModalOpen(true)}
                   className="text-blue-500 text-sm font-bold flex items-center gap-1"
                 >
                   <PlusCircle size={16} /> Publish More
                 </button>
               </div>
               {publicQuizzes.map(item => (
                 <div key={item.id} className="bg-white/5 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center">
                   <div>
                     <h3 className="font-bold text-zinc-100">{item.quiz_details.title}</h3>
                     <p className="text-xs text-zinc-500">{item.title} • {item.quiz_details.questions?.length || 0} questions</p>
                   </div>
                   <div className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-bold">
                     Published
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}

      {/* Original Content List for Quizzes */}
      {activeTab === 0 && (
        <div className="flex flex-col gap-3 animate-in fade-in">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
            </div>
          ) : quizzes.filter(q => (q.questions?.length || 0) > 0).length === 0 ? (
            <div className="text-zinc-500 text-center py-10 font-medium border border-zinc-800/50 rounded-2xl bg-zinc-900/20 p-6">
              {d.no_items || "No items found."}
            </div>
          ) : (
            quizzes.filter(q => (q.questions?.length || 0) > 0).map((quiz) => (
              <Link href={`/play/quiz/${quiz.id}`} key={quiz.id}>
                <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3 interactive group cursor-pointer hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-[15px] mb-1 text-zinc-100">{quiz.title}</h3>
                      <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                        <PlayCircle size={12} /> {quiz.questions?.length || 0} {d.items || "items"} • {d.by || "by"} {quiz.created_by_username || d.unknown_user || "Unknown"}
                      </p>
                    </div>
                    <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-yellow-500 hover:border-yellow-500/50 transition-colors interactive">
                      <Zap size={14} />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors interactive">
                      <Edit3 size={14} />
                    </button>
                    <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold rounded-full ml-auto">
                      {quiz.is_public ? (d.public || "PUBLIC") : (d.private || "PRIVATE")}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Flashcards List */}
      {activeTab === 2 && (
        <div className="flex flex-col gap-3 animate-in fade-in">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
            </div>
          ) : quizzes.filter(q => q.flashcards && q.flashcards.length > 0).length === 0 ? (
            <div className="text-zinc-500 text-center py-10 font-medium border border-zinc-800/50 rounded-2xl bg-zinc-900/20 p-6">
              {d.no_items || "No flashcards found."}
            </div>
          ) : (
            quizzes.filter(q => q.flashcards && q.flashcards.length > 0).map((quiz) => (
              <Link href={`/play/flashcard/${quiz.id}`} key={quiz.id}>
                <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3 interactive group cursor-pointer hover:border-orange-500/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-[15px] mb-1 text-zinc-100">{quiz.title}</h3>
                      <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                        <PlayCircle size={12} /> {quiz.flashcards?.length || 0} cards • {d.by || "by"} {quiz.created_by_username || d.unknown_user || "Unknown"}
                      </p>
                    </div>
                    <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-yellow-500 hover:border-yellow-500/50 transition-colors interactive">
                      <Zap size={14} />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-orange-400 hover:border-orange-500/50 transition-colors interactive">
                      <Edit3 size={14} />
                    </button>
                    <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold rounded-full ml-auto">
                      {quiz.is_public ? (d.public || "PUBLIC") : (d.private || "PRIVATE")}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Slides placeholder */}
      {activeTab === 3 && (
        <div className="text-zinc-500 text-center py-10 font-medium border border-zinc-800/50 rounded-2xl bg-zinc-900/20 p-6 animate-in fade-in">
          {d.slides_coming_soon || "Feature coming soon! 🚀"}
        </div>
      )}

      {/* Publish Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end sm:justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md mx-auto overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95">
             <div className="p-6">
                <div className="text-center mb-6 relative">
                   <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{d.make_public || "MAKE PUBLIC"}</div>
                   <h2 className="text-lg font-bold text-zinc-100">{d.publish_modal_title || "Publish your quizzes"}</h2>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-bold text-zinc-500 mb-2 block">{d.pick_category || "Pick a category"}</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setPublishCategory(cat)}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors border ${
                          publishCategory === cat 
                            ? "bg-zinc-100 text-zinc-900 border-zinc-100" 
                            : "bg-transparent text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2 mb-6">
                   {quizzes.length === 0 ? (
                     <div className="text-sm text-zinc-500 text-center py-4">No quizzes available to publish.</div>
                   ) : quizzes.map(q => (
                     <div 
                       key={q.id} 
                       onClick={() => toggleSelectToPublish(q.id)}
                       className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                         selectedToPublish.includes(q.id) 
                          ? "border-zinc-300 bg-white/5" 
                          : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800"
                       }`}
                     >
                       <div className="flex items-center gap-3">
                         <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedToPublish.includes(q.id) ? "bg-zinc-200 border-zinc-200 text-zinc-900" : "border-zinc-600"}`}>
                           {selectedToPublish.includes(q.id) && <CheckSquare size={14} />}
                         </div>
                         <span className="font-semibold text-sm text-zinc-200 truncate max-w-[200px]">{q.title}</span>
                       </div>
                       <div className="flex items-center gap-1 text-xs text-zinc-500">
                         <LayersIcon size={12} /> {q.questions?.length || 0}
                       </div>
                     </div>
                   ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handlePublish}
                    disabled={selectedToPublish.length === 0 || isPublishing}
                    className="w-full bg-zinc-200 hover:bg-white text-zinc-900 disabled:opacity-50 font-bold py-3.5 rounded-2xl transition-colors flex justify-center items-center gap-2"
                  >
                    {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                    {d.publish_btn || "Publish"} ({selectedToPublish.length})
                  </button>
                  <button 
                    onClick={() => setIsPublishModalOpen(false)}
                    className="w-full text-zinc-400 hover:text-zinc-200 font-bold py-3 rounded-2xl transition-colors"
                  >
                    {d.cancel || "Cancel"}
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LayersIcon({ size = 24, className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 12 12 17 22 12"></polyline>
      <polyline points="2 17 12 22 22 17"></polyline>
    </svg>
  );
}
