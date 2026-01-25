import React from 'react';
import { ArrowRight } from 'lucide-react';
import UploadForm from './UploadForm';

interface HeroProps {
  onAnalysisResult: (result: any) => void;
}

const Hero = ({ onAnalysisResult }: HeroProps) => {
  const scrollToAnalyze = () => {
    const element = document.getElementById('analyze');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLearnMore = () => {
    const element = document.getElementById('learn-more');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="px-8 py-12 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
      <div className="flex flex-col gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
          AI-Powered Health Analysis
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-[1.1]">
          Understand Your <span className="text-blue-600">Blood Test</span> Results Instantly
        </h1>
        
        <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
          Upload your lab report PDF and get a clear, private AI explanation of every biomarker. No medical jargon, just simple insights.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={scrollToAnalyze}
            className="px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            Get Started <ArrowRight size={20} />
          </button>
          <button 
            onClick={scrollToLearnMore}
            className="px-8 py-4 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
          >
            Learn more
          </button>
        </div>
      </div>

      <div className="relative" id="analyze">
        <UploadForm onAnalysisResult={onAnalysisResult} />

        {/* Decorative Elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -z-0"></div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-0"></div>
      </div>
    </section>
  );
};

export default Hero;
