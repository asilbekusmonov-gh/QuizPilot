"use client";

import Link from "next/link";
import { ChevronLeft, FileUp } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="pt-8 pb-32 animate-in relative min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 interactive transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold font-outfit text-zinc-100">Upload PDF</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Dropzone */}
      <div className="glass-panel border-2 border-dashed border-zinc-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center mt-12 hover:border-indigo-500/50 hover:bg-zinc-800/50 transition-colors group">
        <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          <FileUp size={40} strokeWidth={1.5} />
        </div>
        
        <h3 className="font-semibold text-lg text-zinc-100 mb-2">Select File (PDF, DOC, DOCX, TXT)</h3>
        <p className="text-sm text-zinc-500 mb-8 font-medium">Choose from Device</p>
        
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] interactive transition-all">
          Choose from Device
        </button>
      </div>
    </div>
  );
}
