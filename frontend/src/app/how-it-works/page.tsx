import Link from "next/link";
import { ChevronLeft, FileUp, MessageSquare, Layers, Presentation, Users, Crown, Zap } from "lucide-react";

export default function HowItWorksPage() {
  const features = [
    {
      title: "Upload a file",
      desc: "Turn a PDF, DOCX, PPTX or Excel into a quiz in about a minute.",
      icon: FileUp,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      badges: ["1 Send file", "2 Pick settings", "3 Generate"]
    },
    {
      title: "From a topic",
      desc: "No file? Type any subject and AI writes the questions for you.",
      icon: MessageSquare,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      title: "Flashcards",
      desc: "Flip-card study sets generated straight from your documents.",
      icon: Layers,
      color: "text-orange-400 bg-orange-500/10 border-orange-500/20"
    },
    {
      title: "AI Slides",
      desc: "Generate a full presentation with speaker notes from a topic.",
      icon: Presentation,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    {
      title: "Group quiz",
      desc: "Host or join a live multiplayer round and compete with friends.",
      icon: Users,
      color: "text-green-400 bg-green-500/10 border-green-500/20"
    },
    {
      title: "Premium",
      desc: "Unlimited quizzes, images inside questions, and AI explanations.",
      icon: Crown,
      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
    }
  ];

  return (
    <div className="pt-8 pb-32 animate-in relative min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 interactive transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold font-outfit text-zinc-100">How QuizPilot works</h1>
        <div className="w-10" />
      </div>
      
      <p className="text-xs text-zinc-500 font-medium px-2 mb-6 text-center">
        Everything you can do — turn any material into a quiz, study it, and share it.
      </p>

      {/* Feature List */}
      <div className="flex flex-col gap-3 flex-1">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div key={idx} className="glass-panel p-4 rounded-2xl flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${feat.color}`}>
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100 text-[15px] mb-1">{feat.title}</h3>
                <p className="text-[11px] text-zinc-400 font-medium mb-2 leading-relaxed">{feat.desc}</p>
                {feat.badges && (
                  <div className="flex flex-wrap gap-2">
                    {feat.badges.map((badge, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-bold tracking-wide">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <div className="mt-8">
        <Link href="/create/upload" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-[15px] shadow-[0_0_20px_rgba(37,99,235,0.3)] interactive flex justify-center items-center gap-2 transition-all">
          <Zap size={18} fill="currentColor" className="text-yellow-400" /> Try it — upload a file
        </Link>
      </div>
    </div>
  );
}
