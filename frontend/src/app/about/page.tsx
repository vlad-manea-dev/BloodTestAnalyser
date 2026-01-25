'use client';

import React from 'react';
import { Linkedin, Github, Mail, ArrowLeft, User } from 'lucide-react';
import Navbar from "@/components/Navbar";
import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-50 selection:text-blue-900 font-sans text-slate-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-medium">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <User size={48} />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">About the Developer</h1>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
              Hi, I'm Vlad Manea. I built this open-source tool to make medical data more accessible and understandable, without compromising on privacy.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-[2.5rem] p-12 border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Get in Touch</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <a 
              href="mailto:vladdmanea@gmail.com"
              className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <span className="font-semibold text-slate-900 mb-1">Email</span>
              <span className="text-sm text-slate-500">vladdmanea@gmail.com</span>
            </a>

            <a 
              href="https://www.linkedin.com/in/vlad-manea-022014387/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Linkedin size={24} />
              </div>
              <span className="font-semibold text-slate-900 mb-1">LinkedIn</span>
              <span className="text-sm text-slate-500">Connect with me</span>
            </a>

            <a 
              href="https://github.com/vlad-manea-dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-800 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Github size={24} />
              </div>
              <span className="font-semibold text-slate-900 mb-1">GitHub</span>
              <span className="text-sm text-slate-500">View source code</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
