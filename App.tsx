import React, { useState } from 'react';
import { ScanLine, MessageSquare, Map, Activity, ShieldCheck, History, GitCompare, Bell } from 'lucide-react';
import Scanner from './components/Scanner';
import ChatInterface from './components/ChatInterface';
import HospitalMap from './components/HospitalMap';
import LiveAssistant from './components/LiveAssistant';
import HistoryScreen from './components/History';
import Reminders from './components/Reminders';
import InteractionChecker from './components/InteractionChecker';
import { AppScreen } from './types';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.HOME);

  const NavButton = ({ target, icon: Icon, label }: { target: AppScreen, icon: any, label: string }) => (
    <button 
      onClick={() => setScreen(target)}
      className={`flex flex-col items-center gap-1 p-2 transition-all min-w-[50px] ${
        screen === target 
          ? 'text-cyan-400 -translate-y-2' 
          : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <div className={`p-2 rounded-full transition-all ${screen === target ? 'bg-slate-800 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : ''}`}>
        <Icon size={20} />
      </div>
      <span className={`text-[9px] font-medium tracking-wide ${screen === target ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header className="p-6 flex items-center justify-between sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen(AppScreen.HOME)}>
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 rounded-full"></div>
            <ShieldCheck className="relative text-cyan-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Medicinal <span className="text-cyan-400">AI</span></h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Healthcare Intelligence</p>
          </div>
        </div>
        <div className="text-xs px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded-full border border-emerald-800/50">
           Protected
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto pt-6 px-4">
        {screen === AppScreen.HOME && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in">
             <div className="space-y-4 max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Your Personal <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Health Companion</span>
                </h2>
                <p className="text-slate-400 text-lg">
                  Advanced AI analysis for your medicine and health queries.
                </p>
             </div>
             
             <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <button 
                  onClick={() => setScreen(AppScreen.SCAN)}
                  className="p-6 bg-slate-800/50 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 rounded-xl transition-all group"
                >
                   <ScanLine className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                   <h3 className="text-white font-semibold">Scan Medicine</h3>
                   <p className="text-xs text-slate-500 mt-1">Identify pills & bottles</p>
                </button>
                <button 
                  onClick={() => setScreen(AppScreen.LIVE)}
                  className="p-6 bg-slate-800/50 border border-slate-700 hover:border-purple-500 hover:bg-slate-800 rounded-xl transition-all group"
                >
                   <Activity className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                   <h3 className="text-white font-semibold">Live Doctor</h3>
                   <p className="text-xs text-slate-500 mt-1">Real-time voice chat</p>
                </button>
                <button 
                  onClick={() => setScreen(AppScreen.INTERACTIONS)}
                  className="p-6 bg-slate-800/50 border border-slate-700 hover:border-pink-500 hover:bg-slate-800 rounded-xl transition-all group"
                >
                   <GitCompare className="w-8 h-8 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
                   <h3 className="text-white font-semibold">Interactions</h3>
                   <p className="text-xs text-slate-500 mt-1">Check safety</p>
                </button>
                <button 
                  onClick={() => setScreen(AppScreen.REMINDERS)}
                  className="p-6 bg-slate-800/50 border border-slate-700 hover:border-yellow-500 hover:bg-slate-800 rounded-xl transition-all group"
                >
                   <Bell className="w-8 h-8 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                   <h3 className="text-white font-semibold">Reminders</h3>
                   <p className="text-xs text-slate-500 mt-1">Daily alerts</p>
                </button>
             </div>
             
             <button 
               onClick={() => setScreen(AppScreen.MAPS)}
               className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mt-4"
             >
                <Map size={16} /> Find Nearby Hospitals
             </button>
          </div>
        )}

        {screen === AppScreen.SCAN && <Scanner />}
        {screen === AppScreen.CHAT && <ChatInterface />}
        {screen === AppScreen.MAPS && <HospitalMap />}
        {screen === AppScreen.LIVE && <LiveAssistant />}
        {screen === AppScreen.HISTORY && <HistoryScreen />}
        {screen === AppScreen.REMINDERS && <Reminders />}
        {screen === AppScreen.INTERACTIONS && <InteractionChecker />}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl z-50">
        <NavButton target={AppScreen.HOME} icon={ShieldCheck} label="Home" />
        <NavButton target={AppScreen.SCAN} icon={ScanLine} label="Scan" />
        <NavButton target={AppScreen.HISTORY} icon={History} label="History" />
        <NavButton target={AppScreen.CHAT} icon={MessageSquare} label="Chat" />
        <NavButton target={AppScreen.LIVE} icon={Activity} label="Live" />
      </nav>
    </div>
  );
};

export default App;
