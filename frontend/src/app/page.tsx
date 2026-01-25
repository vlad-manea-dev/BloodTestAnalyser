'use client';

import React, { useState } from 'react';
import { Linkedin, Github, Cpu, Lock, Database } from 'lucide-react';
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
    <div className="min-h-screen bg-white selection:bg-blue-50 selection:text-blue-900 font-sans text-slate-900">
      <Navbar />
      <main className="pb-24">
        <Hero onAnalysisResult={handleAnalysisResult} />
        
        {analysisResult && (
          <section id="results" className="px-8 py-12 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ResultsDisplay result={analysisResult} />
          </section>
        )}

        {/* Learn More / Privacy Section */}
        <section id="learn-more" className="px-8 py-24 max-w-7xl mx-auto w-full border-t border-slate-100">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Privacy & Security</h2>
            <p className="text-lg text-slate-600">
              Designed with strict medical data privacy standards. Your personal health information remains under your complete control.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
              <Cpu className="w-10 h-10 text-slate-400 group-hover:text-blue-600 mb-6 transition-colors" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Local Processing</h3>
              <p className="text-slate-600 leading-relaxed">
                Analysis is performed entirely on your device using Ollama. No data is ever sent to the cloud.
              </p>
            </div>
            
            <div className="p-8 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
              <Lock className="w-10 h-10 text-slate-400 group-hover:text-blue-600 mb-6 transition-colors" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Zero Data Retention</h3>
              <p className="text-slate-600 leading-relaxed">
                We operate on a strict no-logs policy. Once you close your browser, your session data is permanently erased.
              </p>
            </div>

            <div className="p-8 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
              <Database className="w-10 h-10 text-slate-400 group-hover:text-blue-600 mb-6 transition-colors" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Stateless Architecture</h3>
              <p className="text-slate-600 leading-relaxed">
                No database. No persistent storage. Your report is analyzed in memory and discarded immediately after.
              </p>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="px-8 py-16 max-w-7xl mx-auto w-full text-center border-t border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">About the Developer</h2>
          <div className="flex justify-center gap-6">
            <a 
              href="https://www.linkedin.com/in/vlad-manea-022014387/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Linkedin size={20} />
              LinkedIn
            </a>
            <a 
              href="https://github.com/vlad-manea-dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <Github size={20} />
              GitHub
            </a>
          </div>
        </section>
      </main>
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden bg-slate-50/50">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      </div>
    </div>
  );
}
