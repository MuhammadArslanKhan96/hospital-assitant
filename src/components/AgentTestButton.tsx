'use client';

import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { Mic, Square, Loader2 } from 'lucide-react';

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '');

export default function AgentTestButton({ assistantId, agentName }: { assistantId: string, agentName: string }) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    vapi.on('call-start', () => {
      setConnecting(false);
      setIsSessionActive(true);
    });

    vapi.on('call-end', () => {
      setIsSessionActive(false);
      setConnecting(false);
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  const toggleCall = async () => {
    if (isSessionActive) {
      vapi.stop();
    } else {
      setConnecting(true);
      try {
        await vapi.start(assistantId);
      } catch (e) {
        console.error("Failed to start call", e);
        setConnecting(false);
        alert("Failed to connect. Check your microphone permissions.");
      }
    }
  };

  if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      return <div className="text-xs text-red-500">Config Error: Missing VAPI Public Key</div>;
  }

  return (
    <button
      onClick={toggleCall}
      disabled={connecting}
      className={`flex items-center px-4 py-2 rounded-md font-bold text-white transition-colors ${
        isSessionActive
          ? 'bg-red-600 hover:bg-red-700'
          : 'bg-indigo-600 hover:bg-indigo-700'
      }`}
    >
      {connecting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : isSessionActive ? (
        <Square className="w-4 h-4 mr-2 fill-current" />
      ) : (
        <Mic className="w-4 h-4 mr-2" />
      )}
      {connecting ? 'Connecting...' : isSessionActive ? 'End Test Call' : `Talk to ${agentName}`}
    </button>
  );
}
