'use client';

import React from 'react';
import { Cpu, Lock, Database, ArrowLeft } from 'lucide-react';
import Navbar from "@/components/Navbar";
import Link from 'next/link';

export default function LearnMore() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-50 selection:text-blue-900 font-sans text-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-medium">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Privacy & Security</h1>
          <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
            We built this platform with a "privacy-first" architecture. Here is exactly how we ensure your medical data never leaves your control.
          </p>
        </div>

        <div className="grid gap-8">
          <div className="p-8 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all duration-300 group flex flex-col md:flex-row gap-8 items-start">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Cpu size={40} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Local Processing with Ollama</h3>
              <p className="text-slate-600 leading-relaxed text-lg mb-4">
                Unlike most AI tools that send your data to OpenAI or Google servers, this application runs the AI model (Llama 3.2) directly on your own computer.
              </p>
              <ul className="list-disc pl-5 text-slate-600 space-y-2">
                <li>No internet connection required for analysis</li>
                <li>Your PDF is processed in your device's memory</li>
                <li>Zero latency from network uploads</li>
              </ul>
            </div>
          </div>
          
          <div className="p-8 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all duration-300 group flex flex-col md:flex-row gap-8 items-start">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Lock size={40} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Zero Data Retention</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                We operate on a strict no-logs policy. The application is "stateless," meaning it doesn't remember anything from one session to the next.
              </p>
            </div>
          </div>

          <div className="p-8 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all duration-300 group flex flex-col md:flex-row gap-8 items-start">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Database size={40} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No Database</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                There is no backend database attached to this project. We cannot see, store, or share your medical reports even if we wanted to. Once you refresh the page, your data is gone forever.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
