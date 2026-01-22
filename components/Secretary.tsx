
import React, { useState, useRef, useEffect } from 'react';
import { secretaryService } from '../services/geminiService';
import { ChatMessage, Patient, Appointment } from '../types';

interface SecretaryProps {
  patients: Patient[];
  appointments: Appointment[];
  doctorName: string;
}

const Secretary: React.FC<SecretaryProps> = ({ patients, appointments, doctorName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: `Olá, Dr(a), Sou a Rubia sua assistente virtual. Como posso ajudar em sua rotina hoje?`, 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await secretaryService.getChatResponse(input, history, { patients, appointments }, doctorName);

    setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-12rem)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header Updated to Medical Blue */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b flex items-center gap-3 alpha-gradient text-white shrink-0">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse border border-white/30">
           <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" /></svg>
        </div>
        <div>
          <h3 className="font-bold text-sm md:text-base">Rubia Assistant</h3>
          <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-cyan-100">Inteligência Ativa Alpha</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-2.5 md:py-3 shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-900 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
              <span className="text-[9px] md:text-[10px] opacity-50 mt-1 block text-right">
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">
              <div className="flex gap-1">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 md:p-4 bg-white border-t shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte à Rubia..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-xs md:text-sm focus:ring-2 focus:ring-blue-900"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="bg-blue-900 text-white p-2.5 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-30 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20"
          >
            <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
        <p className="text-[9px] md:text-[10px] text-center text-slate-400 mt-2">Rubia IA: Focada em otimizar sua rotina.</p>
      </div>
    </div>
  );
};

export default Secretary;
