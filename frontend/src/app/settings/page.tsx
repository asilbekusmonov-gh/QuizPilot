"use client";

import { useState } from "react";
import Link from "next/link";
import { User, CreditCard, HelpCircle, Headphones, Info, ExternalLink, ChevronRight, Crown, Edit2 } from "lucide-react";

export default function SettingsPage() {
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [userName, setUserName] = useState("AsilbekUsmonov");
  const [isEditingName, setIsEditingName] = useState(false);
  const sections = [
    { title: "YOUR STATS", items: [
      { label: "Quizzes Created", value: "1", type: "value" },
      { label: "Credits", value: "1", type: "value", highlight: true }
    ]},
    { title: "LANGUAGE", items: [
      { type: "custom", render: () => (
        <div className="flex gap-2 w-full p-2">
          {[{ code: "EN", label: "English", active: true }, { code: "RU", label: "Русский" }, { code: "UZ", label: "O'zbek" }].map(lang => (
            <button key={lang.label} className={`flex-1 py-3 flex flex-col items-center justify-center rounded-xl border ${lang.active ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'} interactive transition-all`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 ${lang.active ? 'bg-indigo-500/20' : 'bg-zinc-700'}`}>{lang.code}</div>
              <span className="text-[11px] font-semibold">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    ]},
    { title: "PREFERENCES", items: [
      { label: "Sound Effects", desc: "Play quiz sounds. Off by default on phones.", type: "toggle", active: true }
    ]},
    { title: "ABOUT", items: [
      { label: "Help", icon: Headphones },
      { label: "Version", value: "1.15.0", type: "value" },
      { label: "Terms of Service", icon: ExternalLink },
      { label: "Privacy Policy", icon: ExternalLink },
    ]}
  ];

  return (
    <div className="pt-8 pb-32 animate-in relative min-h-screen">
      <h1 className="text-2xl font-bold mb-6 font-outfit text-center text-zinc-100">Settings</h1>

      {/* Profile */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between mb-4 interactive cursor-pointer hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-700">
            <img src="https://ui-avatars.com/api/?name=Asilbek+Usmonov&background=27272a&color=fff" alt="User" className="w-full h-full object-cover" />
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
                <button onClick={(e) => { e.stopPropagation(); setIsEditingName(false); }} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md font-semibold interactive transition-colors">
                  Save
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-semibold text-lg text-zinc-100 flex items-center gap-2">
                  {userName}
                  <Edit2 size={14} className="text-zinc-500 hover:text-indigo-400 cursor-pointer transition-colors" onClick={(e) => { e.stopPropagation(); setIsEditingName(true); }} />
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">1 Credits</p>
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
            <h3 className="font-bold text-indigo-100">Premium</h3>
            <p className="text-xs text-indigo-300/80 font-medium">Unlimited quizzes</p>
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
              item.type === 'custom' ? (
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
          <HelpCircle size={16} /> How QuizPilot Works
        </Link>
      </div>

      {/* Close App Button */}
      <div className="mt-8">
        <button 
          onClick={() => setShowCloseModal(true)}
          className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 py-3.5 rounded-xl font-bold text-[15px] transition-all interactive shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        >
          Close App
        </button>
      </div>

      {/* Custom Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-[300px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Close App</h3>
            <p className="text-sm text-zinc-400 mb-6 font-medium">Are you sure you want to close the app?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCloseModal(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors interactive"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  console.log("App closing...");
                  setShowCloseModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-teal-500 hover:bg-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-colors interactive"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
