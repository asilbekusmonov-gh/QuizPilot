import Link from 'next/link';
import { ChevronLeft, Check, X, Sparkles, Crown } from 'lucide-react';

export default function PremiumPage() {
  const features = [
    { name: "Unlimited PDF quizzes", free: "1 / 3 days", premium: "true" },
    { name: "Images from documents in quizzes", free: "false", premium: "true" },
    { name: "Create Flashcards", free: "1 / 3 days", premium: "true" },
    { name: "Create Slides", free: "false", premium: "true" },
    { name: "AI slide images", free: "false", premium: "1/day" },
    { name: "AI explanations", free: "false", premium: "true" },
    { name: "SuperFocus", free: "false", premium: "true" },
    { name: "Upload up to 25 MB", free: "10 MB", premium: "30 MB" },
  ];

  return (
    <div className="pt-8 pb-32 animate-in relative min-h-screen overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 blur-[100px] rounded-full z-0 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center mb-8">
        <Link href="/" className="absolute left-0 top-0 text-zinc-400 hover:text-zinc-200 p-2 interactive transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold mb-8 font-outfit text-zinc-100">Premium</h1>
        
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-5 animate-pulse">
          <Crown size={32} className="text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold font-outfit text-zinc-100">Get Premium</h2>
        <p className="text-zinc-400 font-medium text-sm mt-1">Unlimited quizzes & features</p>
      </div>

      {/* Feature Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm mb-8 relative z-10 border-zinc-800">
        <div className="flex justify-end p-3 bg-zinc-900/80 border-b border-zinc-800 text-xs font-bold text-zinc-500">
          <div className="w-16 text-center">Free</div>
          <div className="w-20 text-center text-yellow-500">Premium</div>
        </div>
        <div className="divide-y divide-zinc-800/50 bg-zinc-900/30">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center p-3.5 text-[13px] hover:bg-zinc-800/50 transition-colors">
              <div className="flex-1 font-medium flex items-center gap-2.5 text-zinc-300">
                <Sparkles size={14} className="text-indigo-400 opacity-70" />
                {feat.name}
              </div>
              <div className="w-16 flex justify-center text-zinc-500 font-medium text-[11px]">
                {feat.free === "false" ? <X size={14} /> : feat.free}
              </div>
              <div className="w-20 flex justify-center font-bold text-green-500 text-[11px]">
                {feat.premium === "true" ? <Check size={16} /> : feat.premium}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Packages */}
      <div className="flex flex-col gap-3 relative z-10">
        <div className="glass-panel p-4 rounded-2xl border-2 border-zinc-800 flex items-center justify-between interactive cursor-pointer hover:bg-zinc-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-zinc-600"></div>
            <div>
              <div className="font-semibold text-zinc-200">1 day</div>
              <div className="text-[10px] text-zinc-500 font-medium">Try premium features</div>
              <div className="text-[10px] text-orange-400/80 font-semibold mt-0.5">⚡ 131 bought today</div>
            </div>
          </div>
          <div className="font-bold text-zinc-200">9 900 so'm</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-2 border-yellow-500/50 flex items-center justify-between interactive cursor-pointer bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-yellow-500 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
            </div>
            <div>
              <div className="font-bold flex items-center gap-2 text-zinc-100">
                7 days 
                <span className="bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Most Popular</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-medium">5 571 so'm/day</div>
              <div className="text-[10px] text-orange-400/80 font-semibold mt-0.5">⚡ 5 bought today</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-zinc-100">39 000 so'm</div>
            <div className="text-[10px] text-green-500 font-bold">-44% off</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-2 border-zinc-800 flex items-center justify-between interactive cursor-pointer hover:bg-zinc-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-zinc-600"></div>
            <div>
              <div className="font-semibold flex items-center gap-2 text-zinc-200">
                30 days
                <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Best Value</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-medium">2 300 so'm/day</div>
              <div className="text-[10px] text-orange-400/80 font-semibold mt-0.5">⚡ 3 bought today</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-zinc-200">69 000 so'm</div>
            <div className="text-[10px] text-green-500 font-bold">-77% off</div>
          </div>
        </div>
      </div>

      {/* Buy Now Button */}
      <div className="relative z-10 mt-8">
        <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-yellow-950 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(234,179,8,0.3)] interactive flex justify-center items-center gap-2 transition-all">
          <Crown size={20} strokeWidth={2.5} /> Buy Now — 39 000 so'm
        </button>
        <p className="text-center text-[10px] text-zinc-500 font-medium mt-3">One-time purchase. No auto-renewal.</p>
      </div>
    </div>
  );
}
