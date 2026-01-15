import React, { useState, useRef } from 'react';
import { Camera, Upload, ScanLine, Loader2, AlertTriangle, CheckCircle, ChevronRight, Save } from 'lucide-react';
import { analyzeMedicineImage } from '../services/geminiService';
import { MedicineDetails, HistoryItem } from '../types';

const Scanner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [result, setResult] = useState<MedicineDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveToHistory = (data: MedicineDetails) => {
    try {
      const historyItem: HistoryItem = {
        ...data,
        id: Date.now().toString(),
        timestamp: Date.now()
      };
      const existingHistory = JSON.parse(localStorage.getItem('medicinal_history') || '[]');
      const updatedHistory = [historyItem, ...existingHistory].slice(0, 50); // Keep last 50
      localStorage.setItem('medicinal_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const startScan = async () => {
    if (!image) return;

    try {
      setEnhancing(true);
      // Simulate Image Enhancement
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEnhancing(false);
      
      setAnalyzing(true);
      const base64Data = image.split(',')[1]; // Remove data url prefix
      const data = await analyzeMedicineImage(base64Data);
      setResult(data);
      saveToHistory(data);
    } catch (err) {
      setError("Analysis failed. Please try a clearer image.");
      console.error(err);
    } finally {
      setAnalyzing(false);
      setEnhancing(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 animate-fade-in">
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>

        {!image ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl group-hover:bg-cyan-500/30 transition-all duration-500"></div>
              <div className="relative bg-slate-950 p-6 rounded-full border border-cyan-500/50 shadow-lg group-hover:scale-105 transition-transform">
                <Camera className="w-12 h-12 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Scan Medicine</h2>
              <p className="text-slate-400 max-w-md">
                Upload a photo of a strip, bottle, or box for instant analysis.
              </p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg flex items-center gap-2 transition-all"
            >
              <Upload size={18} />
              Select from Gallery
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Preview Area */}
            <div className="relative flex flex-col gap-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-lg group">
                <img src={image} alt="Scan preview" className="w-full h-64 object-cover" />
                
                {/* Scanning Overlay Animation */}
                {(enhancing || analyzing) && (
                  <div className="absolute inset-0 bg-cyan-500/10 z-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                )}

                {enhancing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-2" />
                      <p className="text-emerald-400 font-medium tracking-wide">Enhancing...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {!result && !analyzing && !enhancing && (
                <div className="flex gap-3">
                  <button 
                    onClick={startScan}
                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.4)] flex items-center justify-center gap-2 transition-all"
                  >
                    <ScanLine size={20} />
                    Analyze
                  </button>
                  <button 
                    onClick={handleReset}
                    className="px-4 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-all"
                  >
                    Retake
                  </button>
                </div>
              )}
            </div>

            {/* Results Area */}
            <div className="relative min-h-[300px]">
              {analyzing ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Analyzing Composition</h3>
                    <p className="text-slate-400 text-sm mt-1">Extracting text & identifying formula...</p>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-1">{result.brandName}</h2>
                      <p className="text-lg text-cyan-400 font-medium">{result.genericName}</p>
                      {result.manufacturer && <p className="text-sm text-slate-500">{result.manufacturer}</p>}
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 text-xs border border-emerald-900 bg-emerald-900/20 px-2 py-1 rounded">
                      <Save size={12} /> Saved
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                      <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Usage</h4>
                      <p className="text-slate-200 leading-relaxed">{result.usage}</p>
                    </div>
                    
                    <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                      <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Dosage</h4>
                      <p className="text-slate-200 leading-relaxed">{result.dosage}</p>
                    </div>

                    {result.warnings.length > 0 && (
                      <div className="bg-red-950/20 p-4 rounded-lg border border-red-900/50">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle size={16} className="text-red-400" />
                          <h4 className="text-xs text-red-400 uppercase tracking-wider">Warnings</h4>
                        </div>
                        <ul className="list-disc list-inside text-red-200 text-sm space-y-1">
                          {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <button onClick={handleReset} className="w-full py-3 mt-4 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-all">
                    Scan Another
                  </button>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                   <AlertTriangle className="w-12 h-12 text-red-500" />
                   <p className="text-red-200">{error}</p>
                   <button onClick={handleReset} className="text-sm text-slate-400 underline hover:text-white">Try Again</button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2 border-2 border-dashed border-slate-800 rounded-xl">
                  <ScanLine size={48} className="opacity-20" />
                  <p>Analysis results will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Scanner;
