import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, Activity } from 'lucide-react';
import { connectLiveSession } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';

const LiveAssistant: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null); // Type 'any' used for session due to complex internal type
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio Processing Utility
  const pcmToWav = (pcmData: Float32Array, sampleRate: number) => {
    // Simplified PCM conversion logic would go here for broader compatibility if needed
    // For now, we rely on the specific raw PCM streaming logic expected by the browser
    return pcmData; 
  };

  const startSession = async () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioCtx.destination);

      const sessionPromise = connectLiveSession(
        async (msg: LiveServerMessage) => {
           // Handle Audio Output
           const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
           if (audioData) {
             setIsSpeaking(true);
             playAudio(audioData);
           }
           if (msg.serverContent?.turnComplete) {
             setIsSpeaking(false);
           }
        },
        () => {
          setConnected(true);
          console.log("Live Session Open");
        },
        () => {
          setConnected(false);
          console.log("Live Session Closed");
        },
        (err) => console.error(err)
      );

      sessionRef.current = sessionPromise;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 for API
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
          int16[i] = inputData[i] * 32768;
        }
        
        const uint8 = new Uint8Array(int16.buffer);
        let binary = '';
        const len = uint8.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8[i]);
        }
        const b64 = btoa(binary);

        sessionPromise.then(session => {
            session.sendRealtimeInput({
                media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: b64
                }
            });
        });
      };

    } catch (e) {
      console.error("Failed to start live session", e);
    }
  };

  const stopSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setConnected(false);
    setIsSpeaking(false);
    // Note: Official SDK doesn't expose a clean 'disconnect' on the promise wrapper easily 
    // without storing the underlying socket, but stopping media stops the flow.
    window.location.reload(); // Hard reset for MVP safety
  };

  const playAudio = async (base64String: string) => {
     try {
        const binaryString = atob(base64String);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Output context usually 24k for Gemini
        const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        
        // Manual decoding of PCM16LE
        const dataInt16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(dataInt16.length);
        for(let i=0; i<dataInt16.length; i++) {
            float32[i] = dataInt16[i] / 32768.0;
        }

        const buffer = outCtx.createBuffer(1, float32.length, 24000);
        buffer.getChannelData(0).set(float32);
        
        const source = outCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(outCtx.destination);
        source.start();
        source.onended = () => setIsSpeaking(false);
     } catch (e) {
         console.error("Audio playback error", e);
     }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-slate-900/30 rounded-2xl border border-slate-800 relative overflow-hidden">
        
      {connected ? (
        <div className="text-center space-y-8 z-10">
          <div className="relative">
             <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${isSpeaking ? 'bg-cyan-500 shadow-[0_0_50px_#06b6d4]' : 'bg-slate-800'}`}>
                <Activity size={48} className={`text-white ${isSpeaking ? 'animate-pulse' : ''}`} />
             </div>
             {/* Ripple effect */}
             <div className={`absolute inset-0 rounded-full border-2 border-cyan-500/30 ${isSpeaking ? 'animate-ping' : 'hidden'}`}></div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-white">Listening...</h3>
            <p className="text-slate-400 mt-2">Ask about medicine, symptoms, or usage.</p>
          </div>

          <button 
            onClick={stopSession}
            className="px-8 py-4 bg-red-500/20 text-red-400 border border-red-500/50 rounded-full hover:bg-red-500/30 transition-all flex items-center gap-2 mx-auto"
          >
            <MicOff size={20} /> End Session
          </button>
        </div>
      ) : (
        <div className="text-center z-10 max-w-md p-6">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
            <Mic size={32} className="text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Live Personal Doctor</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Start a real-time voice conversation with Medicinal AI. 
            Ask complex questions and get instant audio responses.
          </p>
          <button 
            onClick={startSession}
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-3 mx-auto"
          >
            <Mic size={24} /> Start Voice Chat
          </button>
        </div>
      )}
      
      {/* Visualizer Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
         <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-cyan-900/20 to-transparent"></div>
      </div>
    </div>
  );
};

export default LiveAssistant;
