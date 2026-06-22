"use client";
import { apiFetch } from "@/lib/api";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, FileUp, Loader2 } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiFetch("http://127.0.0.1:8000/api/v1/documents/", {
        method: "POST",
        // Do not set Content-Type header, let the browser set it with the boundary for FormData
        body: formData,
      });

      if (res.ok) {
        // Assume API generates a quiz from the document and we navigate to it, or library
        router.push("/library");
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

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
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`glass-panel border-2 border-dashed border-zinc-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center mt-12 transition-colors group ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500/50 hover:bg-zinc-800/50 cursor-pointer'}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".pdf,.doc,.docx,.txt"
        />
        
        <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          {isUploading ? <Loader2 size={40} className="animate-spin" strokeWidth={1.5} /> : <FileUp size={40} strokeWidth={1.5} />}
        </div>
        
        <h3 className="font-semibold text-lg text-zinc-100 mb-2">Select File (PDF, DOC, DOCX, TXT)</h3>
        <p className="text-sm text-zinc-500 mb-8 font-medium">Choose from Device</p>
        
        <button 
          disabled={isUploading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] interactive transition-all"
        >
          {isUploading ? "Uploading..." : "Choose from Device"}
        </button>
      </div>
    </div>
  );
}
