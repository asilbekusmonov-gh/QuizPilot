"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, CreditCard, HelpCircle, Headphones, Info, ExternalLink, ChevronRight, Crown, Edit2, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SettingsPage() {
  const { language, setLanguage, dict } = useLanguage();
  const d = dict.settings;

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [userName, setUserName] = useState(d.loading);
  const [isEditingName, setIsEditingName] = useState(false);
  const [userStats, setUserStats] = useState({ quizzes: 0, credits: 0 });
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch("http://127.0.0.1:8000/api/v1/users/");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const user = data[0];
            setUserId(user.id);
            setUserName(user.username);
            setUserStats({ quizzes: user.quiz_count || 0, credits: user.credits || 0 });
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSaveName = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    
    try {
      const res = await apiFetch(`http://127.0.0.1:8000/api/v1/users/${userId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName })
      });
      if (res.ok) {
        setIsEditingName(false);
      } else {
        console.error("Failed to update name");
      }
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const sections = [
    { title: d.sections.stats, items: [
      { label: d.stats.quizzes_created, value: userStats.quizzes.toString(), type: "value" },
      { label: d.credits, value: userStats.credits.toString(), type: "value", highlight: true }
    ]},
    { title: d.sections.language, items: [
      { type: "custom", render: () => (
        <div className="flex gap-2 w-full p-2">
          {[{ code: "EN", label: "English" }, { code: "RU", label: "Русский" }, { code: "UZ", label: "O'zbek" }].map(lang => (
            <button 
              key={lang.label} 
              onClick={() => setLanguage(lang.code as any)}
              className={`flex-1 py-3 flex flex-col items-center justify-center rounded-xl border ${language === lang.code ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'} interactive transition-all`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 ${language === lang.code ? 'bg-indigo-500/20' : 'bg-zinc-700'}`}>{lang.code}</div>
              <span className="text-[11px] font-semibold">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    ]},
    { title: d.sections.preferences, items: [
      { label: d.preferences.sound_effects, desc: d.preferences.sound_effects_desc, type: "toggle", active: true }
    ]},
    { title: d.sections.about, items: [
      { label: d.about.help, icon: Headphones },
      { label: d.about.version, value: "1.15.0", type: "value" },
      { label: d.about.terms, icon: ExternalLink },
      { label: d.about.privacy, icon: ExternalLink },
    ]}
  ];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="pt-8 pb-32 animate-in relative min-h-screen">
      <h1 className="text-2xl font-bold mb-6 font-outfit text-center text-zinc-100">{d.title}</h1>

      {/* Profile */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between mb-4 interactive cursor-pointer hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=27272a&color=fff`} alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)} 
                  className="bg-zinc-900 border border-indigo-500 rounded-md px-2 py-1 text-sm text-zinc-100 focus:outline-none w-full"
                  autoFocus
                />
                <button onClick={handleSaveName} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md font-semibold interactive transition-colors">
                  {d.buttons.save}
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-semibold text-lg text-zinc-100 flex items-center gap-2">
                  {userName}
                  <Edit2 size={14} className="text-zinc-500 hover:text-indigo-400 cursor-pointer transition-colors" onClick={(e) => { e.stopPropagation(); setIsEditingName(true); }} />
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">{userStats.credits} {d.credits}</p>
              </>
            )}
          </div>
        </div>
        <ChevronRight size={18} className="text-zinc-600" />
      </div>

      {/* Premium Banner */}
      <div className="rounded-2xl p-4 mb-8 flex justify-between items-center text-white border border-indigo-500/30 interactive cursor-pointer hover:border-indigo-500/60 transition-colors group relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(168, 85, 247, 0.1))' }}>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Crown size={20} className="text-yellow-500" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-100">{d.premium.title}</h3>
            <p className="text-xs text-indigo-300/80 font-medium">{d.premium.subtitle}</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-indigo-400/50 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all relative z-10" />
      </div>

      {/* Sections */}
      {sections.map((sec, idx) => (
        <div key={idx} className="mb-6">
          <h4 className="text-[10px] font-bold text-zinc-500 mb-2 px-2 tracking-wider uppercase">{sec.title}</h4>
          <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-zinc-800/50">
            {sec.items.map((item, i) => (
              item.type === 'custom' && item.render ? (
                <div key={i}>{item.render()}</div>
              ) : (
                <div key={i} className="p-4 flex justify-between items-center hover:bg-zinc-800/30 transition-colors interactive">
                  <div>
                    <span className="font-medium text-[14px] text-zinc-200">{item.label}</span>
                    {item.desc && <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>}
                  </div>
                  {item.type === 'value' && <span className={`font-semibold text-sm ${item.highlight ? 'text-indigo-400' : 'text-zinc-500'}`}>{item.value}</span>}
                  {item.icon && <item.icon size={16} className="text-zinc-500" />}
                  {item.type === 'toggle' && (
                    <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${item.active ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${item.active ? 'translate-x-5' : ''}`} />
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      ))}

      {/* How it works Button */}
      <div className="mt-6 mb-8 text-center relative z-10">
        <Link href="/how-it-works" className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900/80 backdrop-blur-md rounded-full shadow-lg text-zinc-400 text-sm font-bold hover:text-zinc-200 hover:bg-zinc-800 transition-all active:scale-95">
          <HelpCircle size={16} /> {d.buttons.how_it_works}
        </Link>
      </div>

      {/* Close App Button */}
      <div className="mt-8">
        <button 
          onClick={() => setShowCloseModal(true)}
          className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 py-3.5 rounded-xl font-bold text-[15px] transition-all interactive shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        >
          {d.buttons.close_app}
        </button>
      </div>

      {/* Custom Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-[300px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-zinc-100 mb-2">{d.modal.title}</h3>
            <p className="text-sm text-zinc-400 mb-6 font-medium">{d.modal.desc}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCloseModal(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors interactive"
              >
                {d.buttons.cancel}
              </button>
              <button 
                onClick={() => {
                  console.log("App closing...");
                  setShowCloseModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-teal-500 hover:bg-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-colors interactive"
              >
                {d.buttons.ok}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
