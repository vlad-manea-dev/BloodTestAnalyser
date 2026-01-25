'use client';

import React from 'react';
import { Activity } from 'lucide-react';

const Navbar = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('analyze')}>
        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
          <Activity size={24} />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">Medical</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <button onClick={() => scrollToSection('analyze')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Home</button>
        <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">About Us</button>
      </div>
      
      <button 
        onClick={() => scrollToSection('analyze')}
        className="px-6 py-2.5 rounded-full border border-blue-600 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-all"
      >
        Analyze Now
      </button>
    </nav>
  );
};

export default Navbar;
