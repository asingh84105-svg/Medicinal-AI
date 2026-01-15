import React, { useEffect, useState } from 'react';
import { History, Trash2, ChevronRight, Clock } from 'lucide-react';
import { HistoryItem } from '../types';

const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('medicinal_history');
    if (data) {
      setHistory(JSON.parse(data));
    }
  }, []);

  const clearHistory = () => {
    if (confirm("Clear all history?")) {
      localStorage.removeItem('medicinal_history');
      setHistory([]);
    }
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('medicinal_history', JSON.stringify(updated));
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="text-cyan-400" /> Recent Scans
        </h2>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <Trash2 size={12} /> Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800">
          <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400">No scan history yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl hover:bg-slate-800/80 transition-all group relative">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg">{item.brandName}</h3>
                  <p className="text-cyan-400 text-sm">{item.genericName}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <button 
                  onClick={(e) => deleteItem(item.id, e)}
                  className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-2 gap-4">
                 <div>
                    <span className="text-[10px] uppercase text-slate-500 tracking-wider">Usage</span>
                    <p className="text-xs text-slate-300 line-clamp-2">{item.usage}</p>
                 </div>
                 <div>
                    <span className="text-[10px] uppercase text-slate-500 tracking-wider">Dosage</span>
                    <p className="text-xs text-slate-300 line-clamp-2">{item.dosage}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;
