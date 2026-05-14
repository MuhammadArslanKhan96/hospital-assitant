'use client';

import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';

export default function MarketingDemoCaller() {
  const [config, setConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [vapi, setVapi] = useState<any>(null);

  useEffect(() => {
    fetch('/api/demo-agent/config')
      .then(res => res.json())
      .then(data => {
        if (data.publicKey && data.vapiAssistantId && data.isActive) {
          setConfig(data);
          const v = new Vapi(data.publicKey);

          v.on('call-start', () => {
            setConnecting(false);
            setIsSessionActive(true);
          });

          v.on('call-end', () => {
            setIsSessionActive(false);
            setConnecting(false);
          });

          setVapi(v);
        }
      })
      .catch(err => console.error("Failed to fetch demo agent config", err))
      .finally(() => setLoadingConfig(false));

      return () => {
          if (vapi) {
              vapi.removeAllListeners();
          }
      };
  }, []);

  const toggleCall = async () => {
    if (!vapi || !config) return;

    if (isSessionActive) {
      vapi.stop();
    } else {
      setConnecting(true);
      try {
        await vapi.start(config.vapiAssistantId);
      } catch (e) {
        console.error("Failed to start call", e);
        setConnecting(false);
        alert("Failed to connect. Please ensure microphone permissions are granted.");
      }
    }
  };

  if (loadingConfig || !config) {
    return (
      <div className="relative group inline-block w-full sm:w-auto">
          <button disabled className="relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-slate-500 bg-slate-800/50 shadow-black/50 border border-white/5 transition-all rounded-full cursor-not-allowed">
            {loadingConfig ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-400" /> : <Mic className="w-4 h-4 mr-2 text-slate-600" />}
            {loadingConfig ? 'Loading...' : 'Demo Agent Offline'}
          </button>
      </div>
    );
  }

  return (
    <div className="relative group inline-block w-full sm:w-auto">
        <div className={`absolute -inset-1 rounded-full blur opacity-20 transition duration-1000 group-hover:opacity-50 group-hover:duration-200 pointer-events-none ${isSessionActive ? 'bg-red-500' : 'bg-blue-500'}`}></div>
        <button
          onClick={toggleCall}
          disabled={connecting}
          className={`relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white transition-all shadow-xl active:scale-95 rounded-full ${
            isSessionActive
              ? 'bg-red-600 hover:bg-red-500 shadow-red-500/30 ring-2 ring-red-500/50 ring-offset-2 ring-offset-slate-900'
              : 'bg-slate-800 hover:bg-slate-700 shadow-black/50 border border-white/10'
          }`}
        >
          {connecting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : isSessionActive ? (
            <>
               <span className="relative flex h-3 w-3 mr-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
               </span>
               <Square className="w-4 h-4 mr-2 fill-current hidden" />
               End Test Call
            </>
          ) : (
            <>
               <Mic className="w-4 h-4 mr-2 text-blue-400 group-hover:text-blue-300 transition-colors" />
               Talk to our Agent
            </>
          )}
        </button>
    </div>
  );
}
