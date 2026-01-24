'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, X } from 'lucide-react';

interface UploadFormProps {
  onAnalysisResult: (result: any) => void;
}

const UploadForm = ({ onAnalysisResult }: UploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file.');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file.');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed. Please try again.');
      }

      const result = await response.json();
      onAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-blue-100 border border-blue-50 relative z-10">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-slate-800">Upload Report</h3>
        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">PDF Only</div>
      </div>

      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-blue-100 rounded-[1.5rem] p-10 flex flex-col items-center justify-center gap-4 bg-blue-50/30 hover:bg-blue-50 transition-all cursor-pointer group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf" 
            className="hidden" 
          />
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
            <Upload size={32} />
          </div>
          <div className="text-center">
            <p className="text-slate-800 font-semibold group-hover:text-blue-600 transition-colors">Drop your blood test report here</p>
            <p className="text-slate-500 text-sm">or click to browse files</p>
          </div>
        </div>
      ) : (
        <div className="border-2 border-blue-100 rounded-[1.5rem] p-6 flex items-center gap-4 bg-blue-50/20 relative">
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
            <FileText size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-800 font-semibold truncate">{file.name}</p>
            <p className="text-slate-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          {!isUploading && (
            <button 
              onClick={removeFile}
              className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          )}
          {isUploading && <Loader2 size={20} className="text-blue-600 animate-spin" />}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500 font-medium px-2">{error}</p>
      )}

      <button 
        disabled={!file || isUploading}
        onClick={handleSubmit}
        className={`w-full mt-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
          !file || isUploading 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-[0.98]'
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Analyzing Report...
          </>
        ) : (
          'Analyze Report'
        )}
      </button>

      {!file && !isUploading && (
        <div className="mt-8 space-y-4 opacity-40 select-none pointer-events-none">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600">
              <FileText size={20} />
            </div>
            <div className="flex-1">
              <div className="h-2 w-24 bg-slate-200 rounded-full mb-1"></div>
              <div className="h-1.5 w-16 bg-slate-100 rounded-full"></div>
            </div>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
