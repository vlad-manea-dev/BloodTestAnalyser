import React from 'react';
import { ArrowRight, FileText, Activity, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const LandingHero = () => {
  return (
    <section className="px-8 py-12 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
      <div className="flex flex-col gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
          AI-Powered Health Analysis
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-[1.1]">
          <span className="text-blue-600">BloodFlow</span>: The Intelligent Blood Test Analyser
        </h1>
        
        <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
          Upload your lab report PDF and get a clear, private AI explanation of every biomarker. No medical jargon, just simple insights.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/analyse"
            className="px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            Get Started <ArrowRight size={20} />
          </Link>
          <Link 
            href="/learn-more"
            className="px-8 py-4 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
          >
            Learn more
          </Link>
        </div>
      </div>

      <div className="relative flex justify-center items-center">
        {/* Abstract Representation of Analysis */}
        <div className="relative w-full max-w-md aspect-square bg-blue-50/50 rounded-full flex items-center justify-center p-8">
            <div className="absolute inset-0 border border-blue-100 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-8 border border-dashed border-blue-200 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 relative z-10 w-64 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <FileText size={32} />
                </div>
                <div className="space-y-3">
                    <div className="h-2 w-3/4 bg-slate-100 rounded-full mx-auto" />
                    <div className="h-2 w-1/2 bg-slate-100 rounded-full mx-auto" />
                </div>
                <div className="mt-6 flex justify-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck size={20} /></div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity size={20} /></div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-10 right-10 bg-white p-3 rounded-xl shadow-lg border border-slate-100 animate-bounce delay-700">
                <Activity className="text-pink-500" size={24} />
            </div>
            <div className="absolute bottom-10 left-10 bg-white p-3 rounded-xl shadow-lg border border-slate-100 animate-bounce delay-1000">
                <ShieldCheck className="text-emerald-500" size={24} />
            </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -z-0"></div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-0"></div>
      </div>
    </section>
  );
};

export default LandingHero;
