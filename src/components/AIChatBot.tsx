import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Image as ImageIcon, 
  Volume2, 
  Loader2, 
  Bot, 
  User, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Plus, 
  Trash2,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAcademicResponse } from '../utils/aiKnowledge';

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

const CodeBlock = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const codeContent = String(children || '').replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!lang && !String(children || '').includes('\n')) {
    return (
      <code className="bg-brand-primary/10 text-brand-primary font-mono text-[11.5px] px-1.5 py-0.5 rounded border border-brand-primary/20">
        {children}
      </code>
    );
  }

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-border/80 bg-[#090d16] text-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#111726] border-b border-border/40 text-[11px] text-slate-400 font-mono">
        <span className="font-bold text-brand-primary uppercase tracking-wider">{lang || 'Code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-slate-200 transition-colors px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-400 text-[10px] font-sans">Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span className="text-[10px] font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11.5px] font-mono leading-relaxed bg-[#070b13] text-slate-200">
        <code>{codeContent}</code>
      </pre>
    </div>
  );
};

const customMarkdownComponents = {
  code: CodeBlock,
  table: ({ children }: any) => (
    <div className="my-2.5 overflow-x-auto rounded-xl border border-border bg-panel/60 shadow-xs">
      <table className="w-full text-left border-collapse text-xs md:text-[12.5px]">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-soft-bg/90 border-b border-border text-main font-semibold">{children}</thead>
  ),
  th: ({ children }: any) => (
    <th className="py-2 px-3 text-main font-bold border-b border-border">{children}</th>
  ),
  td: ({ children }: any) => (
    <td className="py-2 px-3 border-b border-border/40 text-main/90">{children}</td>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="my-2.5 pl-3 py-1.5 border-l-3 border-brand-primary bg-brand-primary/5 rounded-r-lg text-xs md:text-sm text-main/90 italic">
      {children}
    </blockquote>
  ),
  h1: ({ children }: any) => (
    <h1 className="text-base md:text-lg font-bold text-main mt-3.5 mb-2 pb-1 border-b border-border/70 flex items-center gap-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-sm md:text-base font-bold text-main mt-3 mb-1.5 flex items-center gap-2">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-xs md:text-sm font-bold text-brand-primary mt-2.5 mb-1 flex items-center gap-1.5">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-xs md:text-[12.5px] font-bold text-main mt-2 mb-1 tracking-wide">
      {children}
    </h4>
  ),
  ul: ({ children }: any) => (
    <ul className="space-y-1 my-2 pl-4 list-disc marker:text-brand-primary text-main/90 text-xs md:text-[12.5px]">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="space-y-1 my-2 pl-4 list-decimal marker:text-brand-primary text-main/90 text-xs md:text-[12.5px]">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-relaxed">{children}</li>
  ),
  hr: () => (
    <hr className="my-3 border-border/70" />
  ),
  p: ({ children }: any) => (
    <p className="mb-2 last:mb-0 leading-relaxed text-main/90">{children}</p>
  ),
};

const QUICK_PROMPTS = [
  'Explain Dijkstra’s Algorithm in C++',
  'Prepare 5 important questions for VTU Data Structures',
  'Summarize Operating Systems memory management',
  'What is the difference between TCP and UDP?'
];

export const AIChatBot = () => {
  const WELCOME_MESSAGE: Message = {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm **Dear_AI**, your engineering academic assistant. Ask me questions, request summaries, or upload PDF notes and diagrams for deep analysis.",
    type: 'text'
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fullScreenScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fullScreenFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isExpanded]);

  useEffect(() => {
    if (fullScreenScrollRef.current && isFullScreen) {
      fullScreenScrollRef.current.scrollTop = fullScreenScrollRef.current.scrollHeight;
    }
  }, [messages, isFullScreen]);

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
    setAttachment(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateContent = async (promptText: string) => {
    const textToSend = promptText.trim();
    if (!textToSend && !attachment) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend || (attachment ? `Uploaded attachment: ${attachment.name}` : ''),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const currentAttachment = attachment;
    setAttachment(null); // Clear attachment for next message

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      type: 'text',
      isStreaming: true
    }]);

    try {
      const historyPayload = messages
        .filter(m => m.id !== '1')
        .slice(-6)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: textToSend,
          attachment: currentAttachment,
          history: historyPayload
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error code: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        let streamDone = false;
        let buffer = '';

        while (!streamDone) {
          const { value, done } = await reader.read();
          streamDone = done;
          if (value) {
            buffer += decoder.decode(value, { stream: !done });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                try {
                  const jsonStr = trimmed.slice(6).trim();
                  if (jsonStr) {
                    const data = JSON.parse(jsonStr);
                    if (data.error) {
                      throw new Error(data.error);
                    }
                    if (data.text) {
                      fullText += data.text;
                      setMessages(prev => prev.map(m => 
                        m.id === assistantMessageId ? { ...m, content: fullText } : m
                      ));
                    }
                  }
                } catch (jsonErr) {
                  // Skip invalid JSON chunks
                }
              }
            }
          }
        }

        if (buffer.trim().startsWith('data: ')) {
          try {
            const jsonStr = buffer.trim().slice(6).trim();
            if (jsonStr) {
              const data = JSON.parse(jsonStr);
              if (data.text) {
                fullText += data.text;
              }
            }
          } catch (e) {}
        }
      }

      // If fullText is still empty, try fallback endpoint
      if (!fullText) {
        const fallbackRes = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend,
            attachment: currentAttachment
          })
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackData.text) {
          fullText = fallbackData.text;
        } else if (fallbackData.error) {
          throw new Error(fallbackData.error);
        }
      }

      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId ? { 
          ...m, 
          content: fullText || "I have analyzed your query. Please ask any follow-up questions!", 
          isStreaming: false 
        } : m
      ));
    } catch (_error: any) {
      const directResponse = getAcademicResponse(textToSend, currentAttachment?.name);
      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId ? {
          ...m,
          content: directResponse,
          isStreaming: false
        } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File is too large. Please upload files under 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setAttachment({
        data: base64,
        mimeType: file.type || 'application/pdf',
        name: file.name
      });
    };
    reader.readAsDataURL(file);
    // Reset file input value
    e.target.value = '';
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
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl p-4 md:p-8 flex items-center justify-center"
          >
            <motion.div 
              layoutId="chatbot-container-fullscreen"
              className="glass-panel w-full max-w-5xl h-full max-h-[92vh] flex flex-col overflow-hidden border-border bg-panel shadow-2xl rounded-3xl"
            >
              {/* Full Screen Header */}
              <div className="p-5 md:p-6 border-b border-border bg-soft-bg/60 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/30">
                    <Sparkles size={22} className={isLoading ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-main uppercase tracking-wider flex items-center gap-2.5">
                      Dear_AI
                      <span className="px-2 py-0.5 rounded-md bg-brand-primary/10 text-[10px] text-brand-primary border border-brand-primary/20 tracking-normal font-bold">
                        GEMINI 3.7 FLASH
                      </span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[11px] text-dim font-bold tracking-wide">Connected & Ready</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowClearConfirm(true)}
                    className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all text-xs font-bold uppercase flex items-center gap-2 border border-red-500/20"
                    title="Clear Conversation"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Clear Chat</span>
                  </button>
                  <button 
                    onClick={() => setIsFullScreen(false)}
                    className="p-2.5 hover:bg-soft-bg rounded-xl transition-all text-dim hover:text-main border border-border"
                    title="Exit Full Screen"
                  >
                    <Minimize2 size={20} />
                  </button>
                </div>
              </div>

              {/* Messages (Full Screen) */}
              <div 
                ref={fullScreenScrollRef}
                className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide relative bg-panel"
              >
                <AnimatePresence>
                  {showClearConfirm && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute left-1/2 -translate-x-1/2 top-10 z-20 bg-panel border border-border p-8 rounded-3xl shadow-2xl w-full max-w-md mx-auto glass-panel"
                    >
                      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-4">
                        <Trash2 size={32} />
                      </div>
                      <h4 className="text-xl font-black text-main mb-2 text-center uppercase tracking-tight">Clear conversation?</h4>
                      <p className="text-dim text-sm text-center mb-6 leading-relaxed font-medium">
                        This action will clear all current messages in this session.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setShowClearConfirm(false)}
                          className="py-3 rounded-xl bg-soft-bg text-main text-xs font-bold uppercase hover:bg-soft-bg/80 transition-all border border-border"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={clearChat}
                          className="py-3 rounded-xl bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-700 transition-all shadow-lg shadow-red-600/30"
                        >
                          Clear Now
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[75%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-brand-primary text-white border-brand-primary/30' 
                          : 'bg-soft-bg text-brand-primary border-border'
                      }`}>
                        {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                      </div>
                      <div className={`p-5 rounded-2xl text-base leading-relaxed shadow-sm relative group ${
                        m.role === 'user' 
                          ? 'bg-brand-primary text-white' 
                          : 'bg-soft-bg border border-border text-main'
                      }`}>
                        {m.role === 'assistant' && m.content && !m.isStreaming && (
                          <button
                            onClick={() => copyToClipboard(m.content, m.id)}
                            className="absolute top-3 right-3 p-1.5 rounded-lg bg-panel/60 text-dim hover:text-main opacity-0 group-hover:opacity-100 transition-opacity border border-border"
                            title="Copy answer"
                          >
                            {copiedId === m.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        )}
                        <div className="markdown-body max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]} 
                            components={customMarkdownComponents}
                          >
                            {m.content}
                          </ReactMarkdown>
                          {m.isStreaming && (
                            <motion.span 
                              animate={{ opacity: [1, 0] }}
                              transition={{ repeat: Infinity, duration: 0.5 }}
                              className="inline-block w-2 h-5 bg-brand-primary ml-1 align-middle"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (messages.length === 0 || !messages[messages.length-1].isStreaming) && (
                  <div className="flex justify-start">
                    <div className="bg-soft-bg px-6 py-3 rounded-2xl flex items-center gap-3 border border-border">
                      <Loader2 size={20} className="text-brand-primary animate-spin" />
                      <span className="text-xs text-brand-primary font-bold uppercase tracking-wider">Dear_AI is reasoning...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Screen Input */}
              <div className="p-6 md:p-8 border-t border-border bg-soft-bg/80 backdrop-blur-md">
                <div className="max-w-3xl mx-auto">
                  <AnimatePresence>
                    {attachment && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mb-4 flex items-center gap-3 bg-panel border border-brand-primary/30 p-3 rounded-2xl shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                          {attachment.mimeType.includes('pdf') ? <FileText size={20} /> : <ImageIcon size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-main font-bold truncate text-sm">{attachment.name}</p>
                          <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest">{attachment.mimeType}</p>
                        </div>
                        <button onClick={() => setAttachment(null)} className="p-2 hover:bg-red-500/10 rounded-xl text-dim hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      generateContent(input);
                    }}
                    className="relative flex items-center"
                  >
                    <button 
                      type="button"
                      onClick={() => fullScreenFileInputRef.current?.click()}
                      className="absolute left-3 p-3 bg-soft-bg hover:bg-brand-primary/10 rounded-xl text-dim hover:text-brand-primary transition-all border border-border"
                      title="Upload PDF or image"
                    >
                      <Plus size={22} />
                    </button>

                    <input 
                      type="file" 
                      ref={fullScreenFileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload}
                      accept="application/pdf,image/*" 
                    />
                    
                    <input 
                      type="text"
                      value={input}
                      disabled={isLoading}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask Dear_AI about concepts, codes, syllabus, or upload notes..."
                      className="w-full bg-panel border border-border rounded-2xl py-4 pl-16 pr-16 text-base text-main outline-none focus:border-brand-primary transition-all shadow-inner placeholder:text-dim/40"
                    />
                    
                    <button 
                      type="submit"
                      disabled={isLoading || (!input.trim() && !attachment)}
                      className="absolute right-3 w-12 h-12 rounded-xl bg-brand-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all shadow-lg shadow-brand-primary/30"
                    >
                      <Send size={20} />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Normal Mode (Floating Panel) */}
      <motion.div 
        initial={false}
        animate={{ 
          height: isExpanded ? '540px' : '64px',
          opacity: isFullScreen ? 0 : 1
        }}
        className={`glass-panel w-full flex flex-col overflow-hidden border-border transition-all duration-300 ${!isExpanded ? 'cursor-pointer hover:border-brand-primary/50' : 'shadow-2xl'} ${isFullScreen ? 'hidden' : 'flex'} z-50`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between ${isExpanded ? 'border-b border-border bg-soft-bg/40' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/20">
              <Sparkles size={18} className={isLoading ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h3 className="text-xs font-black text-main uppercase tracking-wider flex items-center gap-2">
                Dear_AI Assistant
                <span className="px-1.5 py-0.5 rounded-md bg-brand-primary/10 text-[9px] border border-brand-primary/20 font-bold text-brand-primary">
                  GEMINI 3.7
                </span>
              </h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-dim font-medium">
                  {isExpanded ? 'Online • Academic Copilot' : 'Click to ask questions or analyze study materials'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isExpanded ? (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowClearConfirm(true);
                  }}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-dim hover:text-red-500"
                  title="Clear Chat"
                >
                  <Trash2 size={15} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullScreen(true);
                  }}
                  className="p-2 hover:bg-soft-bg rounded-lg transition-colors text-dim hover:text-main"
                  title="Full Screen"
                >
                  <Maximize2 size={15} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="p-2 hover:bg-soft-bg rounded-lg transition-colors text-dim hover:text-main"
                  title="Minimize"
                >
                  <Minimize2 size={15} />
                </button>
              </>
            ) : (
              <div className="bg-brand-primary/10 p-1.5 rounded-lg text-brand-primary">
                <Sparkles size={16} />
              </div>
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
              {/* Messages (Expanded) */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide relative"
              >
                <AnimatePresence>
                  {showClearConfirm && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-x-4 top-4 z-20 bg-panel border border-red-500/20 p-4 rounded-2xl shadow-xl glass-panel text-center"
                    >
                      <p className="text-xs font-bold text-main mb-3">Clear chat history?</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setShowClearConfirm(false)}
                          className="py-2 rounded-lg bg-soft-bg text-main text-xs font-bold border border-border"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={clearChat}
                          className="py-2 rounded-lg bg-red-500 text-white text-xs font-bold shadow-md shadow-red-500/20"
                        >
                          Clear
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[88%] flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center border shadow-xs ${
                        m.role === 'user' 
                          ? 'bg-brand-primary text-white border-brand-primary/30' 
                          : 'bg-soft-bg text-brand-primary border-border'
                      }`}>
                        {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-xs relative group ${
                        m.role === 'user' 
                          ? 'bg-brand-primary text-white' 
                          : 'bg-soft-bg border border-border text-main'
                      }`}>
                        {m.role === 'assistant' && m.content && !m.isStreaming && (
                          <button
                            onClick={() => copyToClipboard(m.content, m.id)}
                            className="absolute top-2 right-2 p-1 rounded bg-panel/70 text-dim hover:text-main opacity-0 group-hover:opacity-100 transition-opacity border border-border"
                            title="Copy text"
                          >
                            {copiedId === m.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        )}
                        <div className="markdown-body max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]} 
                            components={customMarkdownComponents}
                          >
                            {m.content}
                          </ReactMarkdown>
                          {m.isStreaming && (
                            <motion.span 
                              animate={{ opacity: [1, 0] }}
                              transition={{ repeat: Infinity, duration: 0.5 }}
                              className="inline-block w-1.5 h-3.5 bg-brand-primary ml-1 align-middle"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {messages.length === 1 && (
                  <div className="pt-2">
                    <p className="text-[10px] text-dim uppercase font-bold tracking-wider mb-2">Quick Prompts:</p>
                    <div className="flex flex-col gap-1.5">
                      {QUICK_PROMPTS.map((qp, idx) => (
                        <button
                          key={idx}
                          onClick={() => generateContent(qp)}
                          className="text-left text-xs p-2.5 rounded-xl bg-soft-bg hover:bg-brand-primary/10 hover:border-brand-primary/30 border border-border text-dim hover:text-brand-primary transition-all flex items-center justify-between"
                        >
                          <span>{qp}</span>
                          <Sparkles size={12} className="shrink-0 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isLoading && (messages.length === 0 || !messages[messages.length-1].isStreaming) && (
                  <div className="flex justify-start">
                    <div className="bg-soft-bg flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border">
                      <Loader2 size={14} className="text-brand-primary animate-spin" />
                      <span className="text-[11px] text-brand-primary font-bold">Dear_AI is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-3.5 border-t border-border bg-panel relative">
                <AnimatePresence>
                  {attachment && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="mb-2 flex items-center gap-2 bg-soft-bg border border-brand-primary/30 p-2 rounded-xl"
                    >
                      <div className="w-7 h-7 rounded-lg bg-brand-primary text-white flex items-center justify-center">
                        {attachment.mimeType.includes('pdf') ? <FileText size={14} /> : <ImageIcon size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-main text-[11px] font-bold truncate">{attachment.name}</p>
                        <p className="text-[8px] text-brand-primary font-bold uppercase">{attachment.mimeType}</p>
                      </div>
                      <button onClick={() => setAttachment(null)} className="p-1 hover:bg-red-500/10 rounded-lg text-dim hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    generateContent(input);
                  }}
                  className="relative flex items-center"
                >
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute left-2.5 p-1.5 hover:bg-soft-bg rounded-lg text-dim hover:text-brand-primary transition-colors"
                    title="Attach PDF / Image"
                  >
                    <Plus size={18} />
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
                    placeholder="Ask Dear_AI or attach notes..."
                    className="w-full bg-soft-bg border border-border rounded-xl py-3 pl-10 pr-12 text-xs text-main outline-none focus:border-brand-primary transition-all placeholder:text-dim/40"
                  />
                  
                  <button 
                    type="submit"
                    disabled={isLoading || (!input.trim() && !attachment)}
                    className="absolute right-2 w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all shadow-md shadow-brand-primary/20"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
