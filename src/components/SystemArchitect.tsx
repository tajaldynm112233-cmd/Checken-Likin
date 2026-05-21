/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Code, Terminal, Database, Calendar, HelpCircle, Loader, MessageSquare, ShieldAlert } from 'lucide-react';
import { ChatMessage } from '../types';

interface SystemArchitectProps {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function SystemArchitect({ chatHistory, setChatHistory }: SystemArchitectProps) {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Quick helper command suggestion chips
  const suggestionChips = [
    { label: 'PostgreSQL Schema', query: 'Show me the PostgreSQL database schema for the Chicken Licken website' },
    { label: 'Phase 1 Sprint Plan', query: 'Give me a detailed sprint plan schedule for Phase 1 Core Ordering build' },
    { label: 'Marketing Stack Tools', query: 'What enterprise tools are recommended for marketing automations & push alerts?' },
    { label: 'Abandoned Cart logic', query: 'Explain the timing and triggers for the Abandoned Cart recovery flow' }
  ];

  useEffect(() => {
    // Auto scroll chat to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: ChatMessage = {
          id: `chat_${Date.now() + 1}`,
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, assistantMsg]);
        
        // Notify the user in the AI Studio platform that the API key can be set in Settings
        // when we notice the server initialized correctly. (The guidelines ask us to say things like "Your API key can be found in Settings > Secrets").
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server error');
      }
    } catch (e: any) {
      console.error(e);
      // Fallback fallback response state
      const errorMsg: ChatMessage = {
        id: `chat_${Date.now() + 1}`,
        sender: 'assistant',
        text: "🚨 **API Connection alert**: I experienced a transmission challenge. Please double-check your `GEMINI_API_KEY` in the **Settings > Secrets** panel. However, let me guide you descriptively on: " + textToSend.slice(0, 40) + "...\n\n### Recommended Omnisystem Guidelines:\nFor direct integration of Chicken Licken databases, you require active PostgreSQL and standard Express middlewares. Feel free to re-submit your prompt or alter settings.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(userInput);
  };

  // Bespoke high-fidelity Markdown and SQL code blocks parser made specifically for React 19 safety
  const renderFormattedMessageText = (rawText: string) => {
    const parts = rawText.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // Check if this segment represents a markdown code-block
      if (part.startsWith('```')) {
        const lines = part.split('\n');
        // Extract language e.g. "sql" or "typescript"
        const lang = lines[0].replace('```', '').trim() || 'code';
        const codeContent = lines.slice(1, lines.length - 1).join('\n');

        return (
          <div key={index} className="my-3.5 rounded-xl overflow-hidden border border-stone-850 shadow-lg text-left">
            <div className="bg-stone-900 border-b border-stone-800 px-4 py-2 flex justify-between items-center text-[10px] text-stone-400 font-mono font-bold leading-none select-none">
              <span>{lang.toUpperCase()} SYNTAX CODE</span>
              <button
                onClick={() => navigator.clipboard.writeText(codeContent)}
                className="hover:text-stone-100 transition-colors uppercase text-[9px] cursor-pointer"
              >
                Copy Code
              </button>
            </div>
            <pre className="bg-stone-950 p-4 overflow-x-auto text-[10px] text-emerald-400 font-mono leading-relaxed select-text">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Format markdown elements: Headlines, Bullet lists, boldings
      const textLines = part.split('\n');
      return (
        <div key={index} className="space-y-1.5 leading-relaxed text-xs">
          {textLines.map((line, lIdx) => {
            const trimmed = line.trim();

            // Headers
            if (trimmed.startsWith('### ')) {
              return (
                <h5 key={lIdx} className="text-xs font-black text-amber-900 uppercase tracking-wider mt-4.5 mb-2 first:mt-0">
                  {trimmed.replace('### ', '')}
                </h5>
              );
            }
            if (trimmed.startsWith('#### ')) {
              return (
                <h6 key={lIdx} className="text-[11px] font-extrabold text-stone-800 uppercase tracking-wider mt-3 mb-1.5">
                  {trimmed.replace('#### ', '')}
                </h6>
              );
            }

            // Bullet Lists
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
              const cleaned = trimmed.replace(/^[\*\-]\s+/, '');
              return (
                <div key={lIdx} className="flex items-start gap-1.5 pl-2">
                  <span className="text-amber-500 font-extrabold shrink-0 mt-0.5">•</span>
                  <span className="text-stone-700 text-xs">
                    {parseInlineBolding(cleaned)}
                  </span>
                </div>
              );
            }

            // Standard line parsing
            if (trimmed === '') {
              return <div key={lIdx} className="h-2"></div>;
            }

            return (
              <p key={lIdx} className="text-stone-700 font-normal leading-relaxed text-[11.5px]">
                {parseInlineBolding(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Helper bold replacement: matches **text** and wraps in <strong>
  const parseInlineBolding = (text: string) => {
    const boldRegex = /\*\*([\s\S]*?)\*\*/g;
    const parts = text.split(boldRegex);
    if (parts.length === 1) return text;

    return parts.map((seg, sIdx) => {
      if (sIdx % 2 === 1) {
        return <strong key={sIdx} className="font-extrabold text-stone-950">{seg}</strong>;
      }
      return seg;
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm flex flex-col h-[650px]" id="ai-system-architect-chat">
      {/* Consult Header */}
      <div className="p-4 bg-amber-50/75 rounded-t-3xl border-b border-amber-100/50 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-850 rounded-xl text-white">
            <Sparkles className="w-4 h-4 text-amber-200 fill-amber-200" />
          </div>
          <div>
            <span className="text-xs font-black text-stone-900 block leading-none">Consult CL-ARCHITECT AI</span>
            <span className="text-[9.5px] font-medium text-stone-550 block mt-1">Systems Architecture Co-Pilot powered by Gemini</span>
          </div>
        </div>

        <span className="text-[9px] font-mono text-stone-400 bg-white border border-stone-200 px-2.5 py-1 rounded-lg">
          MODEL: gemini-3.5-flash
        </span>
      </div>

      {/* Suggested trigger chips */}
      <div className="px-4 py-3 border-b border-stone-50 bg-stone-50/50 flex-shrink-0">
        <span className="block text-[8.5px] font-bold text-stone-400 uppercase tracking-widest mb-2">Suggested Architecture Topics</span>
        <div className="flex gap-2 overflow-x-auto py-0.5 scrollbar-none">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              id={`chat-chip-${idx}`}
              onClick={() => handleSendMessage(chip.query)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white hover:bg-amber-50 border border-stone-150 rounded-lg text-[10px] font-bold text-stone-700 hover:text-amber-900 cursor-pointer whitespace-nowrap transition-all duration-150 hover:border-amber-200"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scrolling Grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                  isUser
                    ? 'bg-amber-800 text-white rounded-tr-none'
                    : 'bg-stone-50 border border-stone-150/60 text-stone-900 rounded-tl-none'
                }`}
              >
                <div className="flex justify-between items-center text-[8.5px] opacity-65 mb-1 select-none font-bold">
                  <span>{isUser ? 'YOU' : 'CL SYSTEMS ARCHITECT'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                
                <div className="space-y-1">
                  {isUser ? (
                    <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                  ) : (
                    renderFormattedMessageText(msg.text)
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-stone-50 border border-stone-150/60 rounded-2xl rounded-tl-none px-4 py-3.5 max-w-[80%] flex items-center gap-2">
              <Loader className="w-3.5 h-3.5 text-amber-800 animate-spin" />
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest animate-pulse">
                Awaiting CL-ARCHITECT logic engine...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input controls form */}
      <form onSubmit={handleFormSubmit} className="p-4 border-t border-stone-100 flex-shrink-0">
        <div className="relative flex items-center bg-stone-50 border border-stone-200 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500">
          <input
            id="chat-user-input"
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 pl-4 pr-12 py-3 bg-transparent text-xs text-stone-900 placeholder-stone-400 focus:outline-none"
            placeholder="E.g. Explain how SendGrid triggers inside Phase 1 ordering..."
          />
          <button
            type="submit"
            id="submit-chat-btn"
            disabled={!userInput.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-amber-800 disabled:bg-stone-200 text-white hover:bg-amber-900 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[9px] text-stone-400 text-center mt-2 flex items-center gap-1 justify-center">
          <MessageSquare className="w-3 h-3 text-stone-400" />
          <span>Need specific adjustments? Select a topic above or prompt custom questions.</span>
        </div>
      </form>
    </div>
  );
}
