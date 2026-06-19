import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { useApplication } from '../contexts/ApplicationContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  'What jobs match my profile?',
  'How can I improve my resume?',
  'What is my application status?',
  'What skills should I learn next?',
];

export default function CandidateChatbot() {
  const { user } = useAuth();
  const { myApplications, jobs } = useApplication();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${user?.first_name || 'there'}! 👋 I'm your AI career assistant. I can help you find matching jobs, improve your profile, or answer questions about your applications. What can I help you with today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { answer } = await apiClient.sendChatbotMessage({
        question: text.trim(),
        candidateName: user ? `${user.first_name} ${user.last_name}` : 'Candidate',
        appliedJobs: myApplications,
        availableJobs: jobs,
      });
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      if (!isOpen) setHasUnread(true);
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I couldn't connect right now. Please try again!",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-50 w-auto sm:w-[360px] max-h-[calc(100vh-120px)] sm:max-h-[540px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#060f1e]"
            style={{ boxShadow: '0 0 60px rgba(79,250,240,0.08), 0 25px 50px rgba(0,0,0,0.6)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/6 bg-gradient-to-r from-[#0a1628] to-[#071021]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primaryGlow/15 border border-primaryGlow/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primaryGlow" />
                </div>
                <div>
                  <p className="text-xs font-black text-white font-space uppercase tracking-wider">AI Career Assistant</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] text-emerald-400 font-space uppercase tracking-wide">Online · Powered by Gemini</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/8 text-mutedGray hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10" style={{ maxHeight: '340px' }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-primaryGlow/15 border border-primaryGlow/25 text-primaryGlow' : 'bg-secondaryGlow/15 border border-secondaryGlow/25 text-secondaryGlow'}`}>
                    {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`max-w-[78%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed font-outfit ${
                    msg.role === 'assistant'
                      ? 'bg-white/5 border border-white/6 text-gray-200'
                      : 'bg-secondaryGlow/20 border border-secondaryGlow/20 text-white'
                  }`}>
                    {msg.content}
                    <p className="text-[9px] text-mutedGray/60 mt-1.5 font-space">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primaryGlow/15 border border-primaryGlow/25 text-primaryGlow flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/6">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primaryGlow animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primaryGlow animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primaryGlow animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested Questions (only when 1 message) */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-[9px] px-2.5 py-1.5 rounded-lg border border-primaryGlow/20 bg-primaryGlow/5 text-primaryGlow hover:bg-primaryGlow/15 transition-all cursor-pointer font-space uppercase tracking-wide"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-white/6 bg-[#060f1e] flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ask me anything..."
                className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-mutedGray focus:outline-none focus:border-primaryGlow/40 transition-all font-outfit disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-primaryGlow text-[#030712] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-primaryGlow to-secondaryGlow text-[#030712] flex items-center justify-center cursor-pointer shadow-lg"
        style={{ boxShadow: '0 0 30px rgba(79,250,240,0.35), 0 8px 24px rgba(0,0,0,0.4)' }}
        aria-label="Open AI Career Assistant"
        id="chatbot-fab-btn"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accentGlow border-2 border-[#060f1e] flex items-center justify-center">
            <span className="text-[8px] font-black text-white">1</span>
          </span>
        )}

        {/* Pulse ring */}
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-2xl border-2 border-primaryGlow/40"
            animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.button>
    </>
  );
}
