'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, ArrowUp, ArrowDown, Activity } from 'lucide-react';

interface Biomarker {
  name: string;
  value: number;
  unit: string;
  reference_low: number;
  reference_high: number;
  status: 'low' | 'high' | 'critical' | 'normal';
  explanation: string;
  recommendation: string | null;
}

interface AnalysisResult {
  summary: string;
  biomarkers: Biomarker[];
  concerns: string[];
  recommendations: string[];
  disclaimer: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const configs = {
    normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 size={14} /> },
    low: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <ArrowDown size={14} /> },
    high: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <ArrowUp size={14} /> },
    critical: { bg: 'bg-red-50', text: 'text-red-700', icon: <AlertCircle size={14} /> },
  };

  const config = configs[status as keyof typeof configs] || configs.normal;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  );
};

const RangeBar = ({ value, low, high, status }: { value: number; low: number; high: number; status: string }) => {
  // Calculate position percentage
  const range = high - low;
  const padding = range * 0.2; // Add 20% padding on each side
  const min = low - padding;
  const max = high + padding;
  const total = max - min;
  
  const pos = ((value - min) / total) * 100;
  const lowPos = ((low - min) / total) * 100;
  const highPos = ((high - min) / total) * 100;

  const getMarkerColor = () => {
    if (status === 'normal') return 'bg-emerald-500';
    if (status === 'critical') return 'bg-red-500';
    return 'bg-amber-500';
  };

  return (
    <div className="w-full h-8 relative mt-6 flex items-center">
      {/* Background track */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
      
      {/* Reference range highlight */}
      <div 
        className="absolute h-1.5 bg-emerald-100 rounded-full"
        style={{ left: `${lowPos}%`, width: `${highPos - lowPos}%` }}
      ></div>

      {/* Value marker */}
      <div 
        className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-md transition-all duration-1000 ${getMarkerColor()}`}
        style={{ left: `${Math.max(0, Math.min(100, pos))}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 whitespace-nowrap">
          {value}
        </div>
      </div>

      {/* Labels */}
      <div className="absolute -top-4 left-[lowPos%] -translate-x-1/2 text-[9px] font-medium text-slate-400" style={{ left: `${lowPos}%` }}>
        {low}
      </div>
      <div className="absolute -top-4 left-[highPos%] -translate-x-1/2 text-[9px] font-medium text-slate-400" style={{ left: `${highPos}%` }}>
        {high}
      </div>
    </div>
  );
};

const ResultsDisplay = ({ result }: { result: AnalysisResult }) => {
  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Summary Card */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-blue-100/50 border border-blue-50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
              <Activity size={24} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Summary</h2>
          </div>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            {result.summary}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Biomarkers Detail */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 px-4">Detailed Biomarkers</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {result.biomarkers.map((bm, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-slate-800">{bm.name}</h4>
                  <StatusBadge status={bm.status} />
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-black text-slate-900">{bm.value}</span>
                  <span className="text-sm font-medium text-slate-400">{bm.unit}</span>
                </div>
                
                <RangeBar value={bm.value} low={bm.reference_low} high={bm.reference_high} status={bm.status} />
                
                <p className="mt-8 text-sm text-slate-500 leading-relaxed">
                  {bm.explanation}
                </p>
                {bm.recommendation && (
                  <div className="mt-4 flex gap-2 p-3 rounded-2xl bg-blue-50/50 text-blue-700 text-xs font-medium border border-blue-50">
                    <Info size={14} className="shrink-0" />
                    {bm.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Items & Concerns */}
        <div className="space-y-8">
          {/* Concerns */}
          {result.concerns.length > 0 && (
            <div className="bg-white rounded-[2rem] p-8 border border-red-50 shadow-sm">
              <div className="flex items-center gap-2 text-red-600 mb-6">
                <AlertTriangle size={20} />
                <h3 className="font-bold uppercase tracking-wider text-sm">Key Concerns</h3>
              </div>
              <ul className="space-y-4">
                {result.concerns.map((c, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></div>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-200">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-blue-400" size={20} />
              Recommendations
            </h3>
            <ul className="space-y-4">
              {result.recommendations.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <div className="w-1 h-4 bg-blue-500 rounded-full shrink-0"></div>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
        <div className="flex gap-3 items-start text-slate-500">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed italic">
            {result.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
