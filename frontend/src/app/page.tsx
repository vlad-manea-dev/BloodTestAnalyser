'use client';

import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ResultsDisplay from "@/components/ResultsDisplay";

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
          <section id="results" className="px-8 py-12 max-w-7xl mx-auto w-full">
            <ResultsDisplay result={analysisResult} />
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
