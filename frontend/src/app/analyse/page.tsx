'use client';

import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import UploadForm from "@/components/UploadForm";
import ResultsDisplay from "@/components/ResultsDisplay";

export default function AnalysePage() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalysisResult = (result: any) => {
    setAnalysisResult(result);
    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white selection:bg-blue-50 selection:text-blue-900 font-sans text-slate-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-8 py-12 flex flex-col items-center">
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Upload Your Report
          </h1>
          <p className="text-slate-600 text-lg">
            Our local AI will analyse your PDF biomarkers instantly. No data leaves your device.
          </p>
        </div>

        <div className="w-full max-w-xl mb-12">
          <UploadForm onAnalysisResult={handleAnalysisResult} />
        </div>

        {analysisResult && (
          <section id="results" className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ResultsDisplay result={analysisResult} />
          </section>
        )}
      </main>
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden bg-slate-50/50">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      </div>
    </div>
  );
}
