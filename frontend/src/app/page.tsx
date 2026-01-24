'use client';

import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalysisResult = (result: any) => {
    setAnalysisResult(result);
    // Smooth scroll to results if they exist
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-zinc-50 selection:bg-blue-100 selection:text-blue-700 font-sans">
      <Navbar />
      <main className="pb-24">
        <Hero onAnalysisResult={handleAnalysisResult} />
        
        {analysisResult && (
          <section id="results" className="px-8 py-12 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-blue-100/50 border border-blue-50">
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Analysis Results</h2>
              <pre className="bg-slate-50 p-6 rounded-2xl overflow-auto max-h-[600px] text-sm text-slate-700">
                {JSON.stringify(analysisResult, null, 2)}
              </pre>
            </div>
          </section>
        )}
      </main>
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-50"></div>
      </div>
    </div>
  );
}
