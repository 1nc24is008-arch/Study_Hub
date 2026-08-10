import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Image as ImageIcon, Volume2, Loader2, Bot, User, Sparkles, Zap, Maximize2, Minimize2, FileText, Plus, Trash2 } from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import ReactMarkdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Attachment {
  data: string;
  mimeType: string;
  name: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image' | 'audio';
  imageUrl?: string;
  audioUrl?: string;
  isStreaming?: boolean;
}

export const AIChatBot = () => {
  const WELCOME_MESSAGE: Message = {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm **Dear_AI**. How can I help you with your studies today?",
    type: 'text'
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current && (isExpanded || isFullScreen)) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isExpanded, isFullScreen]);

  // Prevent body scroll when in full screen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isFullScreen]);

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setShowClearConfirm(false);
  };

  const generateContent = async (prompt: string) => {
    if (!prompt.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const currentAttachment = attachment;
    setAttachment(null); // Clear attachment for next message

    try {
      // STREAMING TEXT + MULTIMODAL ANALYSIS
      const parts: any[] = [{ text: prompt }];
      
      if (currentAttachment) {
        parts.push({
          inlineData: {
            data: currentAttachment.data,
            mimeType: currentAttachment.mimeType
          }
        });
      }

      const stream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          systemInstruction: `You are Dear_AI, a highly intelligent and versatile AI Assistant.
          
          CAPABILITIES:
          1. KNOWLEDGE: You have deep knowledge of the world, engineering, history, and science.
          2. PDF/IMAGE ANALYSIS: If a user uploads a document or image, analyze it deeply. 
          3. STRUCTURED: Always use Markdown headers (###), bullet points, and numbered lists for clarity.
          4. TONE: Professional, helpful, and concise.
          5. IDENTITY: Your name is Dear_AI. No repetitive welcome messages.`
        }
      });

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        type: 'text',
        isStreaming: true
      }]);

      let fullText = '';
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        fullText += (c.text || '');
        setMessages(prev => prev.map(m => 
          m.id === assistantMessageId ? { ...m, content: fullText } : m
        ));
      }

      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId ? { ...m, isStreaming: false } : m
      ));
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "### System Error\nI encountered a technical glitch while processing your data. Please check your file format and try again.",
        type: 'text'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setAttachment({
        data: base64,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <>
      <AnimatePresence>
        {isFullScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl p-6 flex items-center justify-center"
          >
            <motion.div 
              layoutId="chatbot-container"
              className="glass-panel w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden border-border bg-panel shadow-[0_0_100px_rgba(0,0,0,0.1)]"
            >
              {/* Full Screen Header */}
              <div className="p-6 border-b border-border bg-soft-bg/50 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-accent-color flex items-center justify-center text-white shadow-xl shadow-accent-color/30">
                    <Sparkles size={24} className={isLoading ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-main uppercase tracking-[0.2em] flex items-center gap-3">
                      Dear_AI
                      <span className="px-2.5 py-1 rounded-lg bg-accent-soft text-[10px] text-accent-color border border-accent-color/20 tracking-normal">SYSTEM V4.0</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      <span className="text-[11px] text-dim uppercase font-bold tracking-widest">Neural Co-Processor Linked</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                       onClick={() => setShowClearConfirm(true)}
                       className="px-5 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all text-[11px] font-black uppercase flex items-center gap-2 border border-red-500/20"
                       title="Clear Conversation"
                    >
                      <Trash2 size={18} />
                      Clear History
                    </button>
                    <button 
                       onClick={() => setIsFullScreen(false)}
                       className="p-3 hover:bg-accent-soft rounded-2xl transition-all text-dim hover:text-main hover:scale-105 active:scale-95 border border-transparent hover:border-border"
                    >
                      <Minimize2 size={24} />
                    </button>
                </div>
              </div>

              {/* Messages (Full Screen) */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide relative bg-panel"
              >
                <AnimatePresence>
                  {showClearConfirm && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute left-1/2 -translate-x-1/2 top-10 z-20 bg-panel border border-border p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg mx-auto glass-panel"
                    >
                      <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6">
                        <Trash2 size={40} />
                      </div>
                      <h4 className="text-2xl font-black text-main mb-2 text-center uppercase tracking-tight">Purge Data Logs?</h4>
                      <p className="text-dim text-sm text-center mb-8 leading-relaxed font-medium">This action will permanently delete all session history from the current neural buffer. This cannot be undone.</p>
                      <div className="grid grid-cols-2 gap-5">
                        <button 
                           onClick={() => setShowClearConfirm(false)}
                           className="py-4 rounded-2xl bg-accent-soft text-accent-color text-xs font-black uppercase hover:bg-accent-soft/80 transition-all border border-accent-color/10"
                        >
                          Abort Action
                        </button>
                        <button 
                           onClick={clearChat}
                           className="py-4 rounded-2xl bg-red-600 text-white text-xs font-black uppercase hover:bg-red-700 transition-all shadow-xl shadow-red-600/30"
                        >
                          Execute Pure
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Same message list logic as below */}
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border shadow-lg ${
                          m.role === 'user' 
                          ? 'bg-accent-color text-white border-accent-color shadow-accent-color/20' 
                          : 'bg-panel text-accent-color border-border shadow-sm'
                        }`}>
                          {m.role === 'user' ? <User size={24} /> : <Bot size={24} />}
                        </div>
                        <div className={`p-6 rounded-3xl text-lg leading-relaxed shadow-sm ${
                          m.role === 'user' 
                          ? 'bg-accent-color text-white' 
                          : 'bg-panel border border-border text-main'
                        }`}>
                          {m.type === 'text' && (
                            <div className="markdown-body prose dark:prose-invert prose-lg max-w-none">
                              <ReactMarkdown>{m.content}</ReactMarkdown>
                              {m.isStreaming && (
                                <motion.span 
                                  animate={{ opacity: [1, 0] }}
                                  transition={{ repeat: Infinity, duration: 0.5 }}
                                  className="inline-block w-2 h-6 bg-accent-color ml-1 align-middle"
                                />
                              )}
                            </div>
                          )}
                          {m.type === 'image' && m.imageUrl && (
                            <div className="space-y-6">
                               <p className="mb-2 italic text-dim font-medium">{m.content}</p>
                               <div className="relative group/fullscreen-img rounded-3xl overflow-hidden border border-border shadow-2xl">
                                  <img src={m.imageUrl} alt="AI Generated" className="w-full max-h-[600px] object-contain transition-transform duration-700 group-hover/fullscreen-img:scale-110" referrerPolicy="no-referrer" />
                                  <div className="absolute top-4 right-4 flex gap-2">
                                     <button onClick={() => window.open(m.imageUrl, '_blank')} className="p-3 bg-brand-primary/20 backdrop-blur-md rounded-xl text-white hover:bg-brand-primary/40 transition-all border border-brand-primary/20">
                                        <Plus className="rotate-45" size={20} />
                                     </button>
                                  </div>
                               </div>
                            </div>
                          )}
                          {m.type === 'audio' && m.audioUrl && (
                            <div className="flex items-center gap-8 py-4">
                               <div className="flex-1 w-64 h-2 bg-accent-soft rounded-full overflow-hidden">
                                 <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="w-1/2 h-full bg-accent-color/40" />
                               </div>
                               <button onClick={() => playAudio(m.audioUrl!)} className="w-16 h-16 rounded-2xl bg-accent-color text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent-color/30">
                                 <Volume2 size={32} />
                               </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (messages.length === 0 || !messages[messages.length-1].isStreaming) && (
                  <div className="flex justify-start">
                    <div className="bg-accent-soft px-8 py-4 rounded-3xl flex items-center gap-5 border border-accent-color/10">
                      <Loader2 size={24} className="text-accent-color animate-spin" />
                      <span className="text-sm text-accent-color font-black uppercase tracking-[0.2em]">Processing Request</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Screen Input (Claude style centered) */}
              <div className="p-10 border-t border-border bg-soft-bg dark:bg-black/90 backdrop-blur-2xl">
                 <div className="max-w-4xl mx-auto">
                    <AnimatePresence>
                      {attachment && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="mb-6 flex items-center gap-4 bg-accent-soft/30 border border-accent-color/20 p-4 rounded-3xl"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-accent-color text-white flex items-center justify-center shadow-lg shadow-accent-color/20">
                            {attachment.mimeType.includes('pdf') ? <FileText size={28} /> : <ImageIcon size={28} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-main font-black truncate uppercase tracking-tight text-sm">{attachment.name}</p>
                            <p className="text-[10px] text-accent-color font-black uppercase tracking-widest">{attachment.mimeType}</p>
                          </div>
                          <button onClick={() => setAttachment(null)} className="p-3 hover:bg-red-500/10 rounded-2xl text-dim hover:text-red-500 transition-colors">
                            <Trash2 size={20} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        generateContent(input);
                      }}
                      className="relative group/fullscreen-form"
                    >
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-panel/50 hover:bg-accent-soft rounded-2xl text-dim hover:text-accent-color transition-all border border-transparent hover:border-border"
                      >
                        <Plus size={28} />
                      </button>
                      
                      <input 
                        type="text"
                        value={input}
                        disabled={isLoading}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Dear_AI anything about the world..."
                        className="w-full bg-soft-bg border-border border-2 rounded-[2rem] py-8 pl-20 pr-24 text-xl text-main outline-none focus:border-accent-color focus:bg-panel transition-all shadow-xl placeholder:text-dim/30"
                      />
                      
                      <button 
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-[1.5rem] bg-accent-color text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all shadow-2xl shadow-accent-color/40"
                      >
                        <Send size={32} />
                      </button>
                    </form>
                    <p className="mt-4 text-center text-xs text-dim/40 font-bold uppercase tracking-widest">Powered by Advanced Neural Reasoning Technology</p>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Normal Mode (Collapsed or Expanded) */}
      <motion.div 
        layoutId="chatbot-container"
        initial={false}
        animate={{ 
          height: isExpanded ? '600px' : '72px',
          opacity: isFullScreen ? 0 : 1
        }}
        className={`glass-panel w-full flex flex-col overflow-hidden border-cyber-cyan/20 group transition-all duration-500 ease-in-out ${!isExpanded ? 'hover:border-cyber-cyan/50 cursor-pointer shadow-[0_0_20px_rgba(0,234,255,0.05)]' : 'shadow-2xl'} ${isFullScreen ? 'hidden' : 'flex'} z-50`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        {/* Header (Stay Same) */}
        <div className={`p-4 flex items-center justify-between ${isExpanded ? 'border-b border-border bg-soft-bg/30' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-color flex items-center justify-center text-white shadow-lg shadow-accent-color/20">
              <Sparkles size={20} className={isLoading ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h3 className="text-sm font-black text-main uppercase tracking-widest flex items-center gap-2">
                Dear_AI
                <span className="px-1.5 py-0.5 rounded-md bg-accent-soft text-[10px] border border-accent-color/10 font-mono text-accent-color">PREMIUM</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-dim font-medium">
                  {isExpanded ? 'Online & Intelligent' : 'Boost Your Learning - Click to Start'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             {isExpanded ? (
               <div className="flex items-center gap-1.5">
                 <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowClearConfirm(true);
                    }}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-dim hover:text-red-500 group/btn"
                    title="Clear Conversation"
                 >
                   <Trash2 size={16} />
                 </button>
                 <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFullScreen(true);
                    }}
                    className="p-2 hover:bg-accent-soft rounded-lg transition-colors text-dim hover:text-accent-color"
                    title="Full Screen"
                 >
                   <Maximize2 size={16} />
                 </button>
                 <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    className="p-2 hover:bg-accent-soft rounded-lg transition-colors text-dim hover:text-main"
                    title="Minimize"
                 >
                   <Minimize2 size={16} />
                 </button>
               </div>
             ) : (
               <motion.div
                 animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                 transition={{ repeat: Infinity, duration: 4 }}
                 className="bg-accent-soft p-2 rounded-lg"
               >
                 <Sparkles size={18} className="text-accent-color" />
               </motion.div>
             )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full overflow-hidden bg-panel"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Messages (Standard Expanded) */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide relative"
              >
                <AnimatePresence>
                  {showClearConfirm && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-x-5 top-5 z-20 bg-panel border-2 border-red-500/20 p-5 rounded-2xl shadow-2xl glass-panel"
                    >
                      <p className="text-xs font-bold text-main mb-4 text-center tracking-wide">Delete conversation history permanently?</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                           onClick={() => setShowClearConfirm(false)}
                           className="py-2.5 rounded-xl bg-accent-soft text-accent-color text-xs font-bold uppercase hover:bg-accent-soft/80 transition-all"
                        >
                           Go Back
                        </button>
                        <button 
                           onClick={clearChat}
                           className="py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold uppercase hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                        >
                           Clear Chat
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border shadow-sm ${
                          m.role === 'user' 
                          ? 'bg-accent-color text-white border-accent-color/30' 
                          : 'bg-panel text-accent-color border-border shadow-sm'
                        }`}>
                          {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                          m.role === 'user' 
                          ? 'bg-accent-color text-white' 
                          : 'bg-panel border border-border text-main'
                        }`}>
                          {m.type === 'text' && (
                            <div className="markdown-body prose dark:prose-invert prose-sm max-w-none">
                              <ReactMarkdown>{m.content}</ReactMarkdown>
                              {m.isStreaming && (
                                <motion.span 
                                  animate={{ opacity: [1, 0] }}
                                  transition={{ repeat: Infinity, duration: 0.5 }}
                                  className="inline-block w-1.5 h-4 bg-accent-color ml-1 align-middle"
                                />
                              )}
                            </div>
                          )}
                           {m.type === 'image' && m.imageUrl && (
                            <div className="space-y-3">
                               <p className="mb-2 italic opacity-60 text-xs font-medium tracking-wide">{m.content}</p>
                               <div className="relative group/img overflow-hidden rounded-xl border border-border">
                                 <img src={m.imageUrl} alt="AI Generated" className="w-full max-h-[250px] object-cover transition-transform duration-500 group-hover/img:scale-105" referrerPolicy="no-referrer" />
                                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => window.open(m.imageUrl, '_blank')} className="px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase rounded-lg shadow-xl shadow-brand-primary/40">View Full</button>
                                 </div>
                               </div>
                            </div>
                          )}
                          {m.type === 'audio' && m.audioUrl && (
                            <div className="flex items-center gap-4 py-1">
                               <div className="flex-1 w-32 h-1 bg-accent-soft rounded-full overflow-hidden">
                                 <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="w-1/2 h-full bg-accent-color/40" />
                               </div>
                               <button onClick={() => playAudio(m.audioUrl!)} className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent-color hover:bg-accent-color hover:text-white transition-all">
                                 <Volume2 size={18} />
                               </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (messages.length === 0 || !messages[messages.length-1].isStreaming) && (
                  <div className="flex justify-start">
                    <div className="bg-accent-soft flex items-center gap-3 px-4 py-2 rounded-2xl">
                      <Loader2 size={14} className="text-accent-color animate-spin" />
                      <span className="text-[10px] text-accent-color font-bold uppercase tracking-widest">Generating Insight</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area (Modern) */}
              <div className="p-4 border-t border-border bg-panel dark:bg-black/60 relative">
                <AnimatePresence>
                  {attachment && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="mb-3 flex items-center gap-2 bg-panel border border-accent-color/20 p-2 rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent-color text-white flex items-center justify-center">
                        {attachment.mimeType.includes('pdf') ? <FileText size={14} /> : <ImageIcon size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-main text-[10px] font-bold truncate">{attachment.name}</p>
                        <p className="text-[8px] text-accent-color font-black uppercase tracking-tight">{attachment.mimeType}</p>
                      </div>
                      <button onClick={() => setAttachment(null)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-dim hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    generateContent(input);
                  }}
                  className="relative group/form"
                >
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 hover:bg-accent-soft rounded-lg text-dim hover:text-accent-color transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept="application/pdf,image/*" 
                  />
                  
                  <input 
                    type="text"
                    value={input}
                    disabled={isLoading}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask or upload PDF..."
                    className="w-full bg-soft-bg border border-border rounded-2xl py-3.5 pl-12 pr-14 text-[13px] text-main outline-none focus:ring-2 focus:ring-accent-color/20 focus:border-accent-color transition-all placeholder:text-dim/40"
                  />
                  
                  <button 
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-accent-color text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all shadow-lg shadow-accent-color/20"
                  >
                    <Send size={18} />
                  </button>
                </form>
                <div className="mt-2 text-center">
                   <p className="text-[8px] text-dim/50 font-medium tracking-tight">AI can make mistakes. Verify important info.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
