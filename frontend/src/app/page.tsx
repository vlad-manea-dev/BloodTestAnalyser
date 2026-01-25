'use client';

import React from 'react';
import Navbar from "@/components/Navbar";
import LandingHero from "@/components/LandingHero";

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-50 selection:text-blue-900 font-sans text-slate-900">
      <Navbar />
      <main className="pb-24">
        <LandingHero />
      </main>
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden bg-slate-50/50">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      </div>
    </div>
  );
}
