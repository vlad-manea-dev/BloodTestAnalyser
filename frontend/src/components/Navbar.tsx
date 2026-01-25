'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2 cursor-pointer group">
        <div className="bg-blue-600 p-1.5 rounded-lg text-white group-hover:scale-105 transition-transform">
          <Activity size={24} />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">BloodFlow</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Home</Link>
        <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">About Me</Link>
      </div>
      
      <Link 
        href="/analyse"
        className="px-6 py-2.5 rounded-full border border-blue-600 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-all"
      >
        Analyse Now
      </Link>
    </nav>
  );
};

export default Navbar;
