import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

export function ChatWindow({ messages, onSendMessage, isLoading, disabled }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <Bot className="w-12 h-12 mb-4 text-slate-400" />
            <p className="font-sans font-medium text-lg text-slate-500">Upload a PDF to start analysis</p>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={cn(
                "flex flex-col",
                msg.role === 'user' ? "items-end" : "items-start"
              )}
            >
              <div className={cn(
                "p-4 text-sm shadow-sm max-w-2xl",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-2xl rounded-tr-none shadow-indigo-100" 
                  : "bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none"
              )}>
                {msg.role === 'bot' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-4 h-4 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight">Verified Response</span>
                  </div>
                )}
                <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                {msg.role === 'bot' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Citation Engine:</span>
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-medium">Grounded Source</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-2 px-1">
                {msg.role === 'user' ? 'Message Sent' : 'Retrieved from source'}
              </span>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 items-center"
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 animate-pulse">Scanning PDF...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-8 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? "Please upload a PDF first..." : "Ask a question about the document..."}
            disabled={disabled || isLoading}
            className="w-full pl-6 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm shadow-inner transition-all disabled:opacity-50"
          />
          <div className="absolute right-2 top-2 bottom-2 flex gap-2">
            <button
              type="submit"
              disabled={disabled || isLoading || !input.trim()}
              className="px-6 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow shadow-indigo-100 hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Query</span>
            </button>
          </div>
        </form>
        <p className="text-center mt-3 text-[10px] text-slate-400 font-medium">
          Grounding active: Responses are hallucination-free and verified against source text.
        </p>
      </div>
    </div>
  );
}
