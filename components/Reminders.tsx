import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Reminder } from '../types';

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newMed, setNewMed] = useState('');
  const [newTime, setNewTime] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('medicinal_reminders');
    if (data) {
      setReminders(JSON.parse(data));
    }
  }, []);

  const saveReminders = (data: Reminder[]) => {
    setReminders(data);
    localStorage.setItem('medicinal_reminders', JSON.stringify(data));
  };

  const addReminder = () => {
    if (!newMed || !newTime) return;
    const item: Reminder = {
      id: Date.now().toString(),
      medicine: newMed,
      time: newTime,
      active: true
    };
    saveReminders([...reminders, item]);
    setNewMed('');
    setNewTime('');
    setIsAdding(false);
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, active: !r.active } : r);
    saveReminders(updated);
  };

  const deleteReminder = (id: string) => {
    saveReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="text-cyan-400" /> Daily Reminders
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
        >
          {isAdding ? 'Close' : <Plus size={20} />}
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl mb-6 animate-fade-in-up">
           <h3 className="text-white font-medium mb-3">Add Alert</h3>
           <div className="grid gap-3">
              <input 
                type="text" 
                placeholder="Medicine Name"
                value={newMed}
                onChange={e => setNewMed(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-cyan-500 outline-none"
              />
              <input 
                type="time" 
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-cyan-500 outline-none"
              />
              <button 
                onClick={addReminder}
                disabled={!newMed || !newTime}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white py-2 rounded-lg font-medium"
              >
                Set Reminder
              </button>
           </div>
        </div>
      )}

      <div className="space-y-3">
        {reminders.length === 0 ? (
           <p className="text-center text-slate-500 py-10">No active reminders.</p>
        ) : (
          reminders.map(r => (
            <div key={r.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${r.active ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-950 border-slate-900 opacity-60'}`}>
               <div className="flex items-center gap-4">
                  <button onClick={() => toggleReminder(r.id)} className="text-cyan-400">
                     {r.active ? <CheckCircle2 size={24} /> : <Circle size={24} className="text-slate-600" />}
                  </button>
                  <div>
                     <p className={`font-medium ${r.active ? 'text-white' : 'text-slate-400 line-through'}`}>{r.medicine}</p>
                     <p className="text-sm text-slate-500">{r.time}</p>
                  </div>
               </div>
               <button onClick={() => deleteReminder(r.id)} className="text-slate-600 hover:text-red-400">
                  <Trash2 size={18} />
               </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reminders;
