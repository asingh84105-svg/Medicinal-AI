import React, { useState } from 'react';
import { GitCompare, AlertOctagon, CheckCircle, ArrowRight } from 'lucide-react';
import { checkDrugInteraction } from '../services/geminiService';

const InteractionChecker: React.FC = () => {
  const [drugA, setDrugA] = useState('');
  const [drugB, setDrugB] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!drugA || !drugB) return;
    setLoading(true);
    try {
      const response = await checkDrugInteraction(drugA, drugB);
      setResult(response);
    } catch (e) {
      setResult("Error checking interaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 animate-fade-in">
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             <GitCompare className="text-purple-400" /> Interaction Checker
          </h2>
          <p className="text-slate-400 text-sm">Check safety between two medicines.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
           <input 
             type="text"
             placeholder="First Medicine"
             value={drugA}
             onChange={e => setDrugA(e.target.value)}
             className="flex-1 w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
           />
           <div className="bg-slate-800 p-2 rounded-full text-slate-400">
              <ArrowRight size={16} />
           </div>
           <input 
             type="text"
             placeholder="Second Medicine"
             value={drugB}
             onChange={e => setDrugB(e.target.value)}
             className="flex-1 w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-purple-500 outline-none"
           />
        </div>

        <button 
          onClick={handleCheck}
          disabled={loading || !drugA || !drugB}
          className="w-full mt-6 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"
        >
          {loading ? 'Analyzing...' : 'Analyze Interaction'}
        </button>

        {result && (
          <div className="mt-8 bg-slate-950 p-6 rounded-xl border border-slate-800 animate-fade-in-up">
             <h3 className="text-white font-semibold mb-2">Analysis Result</h3>
             <div className="prose prose-invert prose-sm text-slate-300">
                <p className="whitespace-pre-wrap">{result}</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractionChecker;
