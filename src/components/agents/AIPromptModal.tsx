import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Check, Loader2, Sparkles, MessageSquare, ClipboardList } from 'lucide-react';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (generatedPrompt: string) => void;
  context: any;
}

export default function AIPromptModal({ isOpen, onClose, onApprove, context }: AIPromptModalProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'questionnaire' | null>(null);
  const [draftPrompt, setDraftPrompt] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setMode(null);
      setDraftPrompt(null);
      setInputValue('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const extractSystemPrompt = (text: string) => {
    const match = text.match(/```systemprompt\n([\s\S]*?)```/);
    if (match && match[1]) {
      setDraftPrompt(match[1].trim());
    } else {
      setDraftPrompt(null);
    }
  };

  const startMode = async (selectedMode: 'chat' | 'questionnaire') => {
    setMode(selectedMode);

    let initialGreeting = '';
    if (selectedMode === 'chat') {
      initialGreeting = "Hey! Let's build the 'brain' for your agent. Tell me what kind of agent you need, and I'll draft the perfect system prompt based on your current configuration.";
    } else {
      initialGreeting = "Hey! Let's build the 'brain' for your agent. I'll ask you a few questions one by one about your business, the agent's goal, and how it should handle objections. Ready?";
    }

    const initMessage = { role: 'assistant' as const, content: initialGreeting };
    setMessages([initMessage]);

    // If it's a questionnaire, we need to trigger the first actual AI question automatically
    if (selectedMode === 'questionnaire') {
      await sendMessage([initMessage, { role: 'user' as const, content: 'Yes, I am ready. Ask me the first question.' }], selectedMode);
    }
  };

  const sendMessage = async (currentMessages: { role: 'user' | 'assistant', content: string }[], currentMode: 'chat' | 'questionnaire') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agents/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages,
          context: context,
          mode: currentMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();

      const newMessages = [...currentMessages, { role: data.role, content: data.message }];
      setMessages(newMessages);
      extractSystemPrompt(data.message);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Oops! I encountered an error communicating with the server. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !mode || isLoading) return;

    const newMessages = [...messages, { role: 'user' as const, content: inputValue }];
    setMessages(newMessages);
    setInputValue('');

    await sendMessage(newMessages, mode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col h-[80vh] border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Prompt Assistant</h2>
              <p className="text-xs text-slate-500 font-medium">Build your agent's brain</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white flex flex-col space-y-4">

          {/* Mode Selection */}
          {!mode && (
            <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="text-center max-w-sm">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">How would you like to build your prompt?</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">I've analyzed your agent's tools and configuration. Let's create the perfect system instructions.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-8">
                <button onClick={() => startMode('chat')} className="flex flex-col items-start p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group">
                  <MessageSquare className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-3" />
                  <span className="text-sm font-bold text-slate-900 mb-1">Quick Chat</span>
                  <span className="text-xs text-slate-500">I'll describe what I want, and you draft it immediately.</span>
                </button>

                <button onClick={() => startMode('questionnaire')} className="flex flex-col items-start p-6 rounded-xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group">
                  <ClipboardList className="w-6 h-6 text-slate-400 group-hover:text-purple-500 mb-3" />
                  <span className="text-sm font-bold text-slate-900 mb-1">Guided Questionnaire</span>
                  <span className="text-xs text-slate-500">Ask me step-by-step questions to build a tailored prompt.</span>
                </button>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          {mode && (
            <div className="flex flex-col space-y-4 pb-4">
              {messages.map((msg, idx) => {
                // Remove the system prompt block from the visible chat to keep it clean,
                // since we show it in the draft box
                let displayContent = msg.content;
                if (msg.role === 'assistant') {
                    displayContent = displayContent.replace(/```systemprompt\n([\s\S]*?)```/g, '\n[System Prompt Draft Generated Below]\n').trim();
                }

                return (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{displayContent}</p>
                  </div>
                </div>
              )})}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl p-4 flex items-center space-x-2 border border-slate-200 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Draft Prompt Action Area */}
        {draftPrompt && (
          <div className="bg-blue-50 border-t border-b border-blue-100 p-4 shrink-0 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" /> System Prompt Draft Ready
              </span>
              <button
                onClick={() => {
                  onApprove(draftPrompt);
                  onClose();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center"
              >
                Approve & Apply
              </button>
            </div>
            <div className="bg-white border border-blue-200 rounded-lg p-3 max-h-32 overflow-y-auto font-mono text-xs text-slate-700 shadow-inner leading-relaxed">
                {draftPrompt}
            </div>
          </div>
        )}

        {/* Input Area */}
        {mode && (
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-end space-x-2 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={mode === 'chat' ? "Describe your ideal agent..." : "Type your answer..."}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none h-[60px] min-h-[60px] max-h-[120px] scrollbar-thin shadow-sm"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">AI can make mistakes. Always review the prompt before applying.</p>
          </div>
        )}

      </div>
    </div>
  );
}
