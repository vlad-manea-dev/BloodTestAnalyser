'use client';

import React, { useState } from 'react';
import { Linkedin, Github, Cpu, Database, Shield } from 'lucide-react';
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
          <section id="results" className="px-8 py-12 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ResultsDisplay result={analysisResult} />
          </section>
        )}

        {/* Learn More Section */}
        <section id="learn-more" className="px-8 py-24 max-w-7xl mx-auto w-full">
          <div className="bg-white rounded-[2.5rem] p-12 shadow-xl shadow-slate-200 border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">How it works</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <Cpu size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Locally Run AI</h3>
                <p className="text-slate-600 leading-relaxed">
                  This project runs entirely on your local machine using <span className="font-semibold text-slate-900">Ollama</span>. No data leaves your laptop, ensuring complete privacy and speed.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Shield size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Private & Secure</h3>
                <p className="text-slate-600 leading-relaxed">
                  Your health data is sensitive. That's why we process everything locally. We don't store your reports on any external servers.
                </p>
              </div>

              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                  <Database size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No Database</h3>
                <p className="text-slate-600 leading-relaxed">
                  This is a stateless application. There is no database attached, meaning your data disappears as soon as you close the session.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="px-8 py-16 max-w-7xl mx-auto w-full text-center">
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
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-50"></div>
      </div>
    </div>
  );
}
