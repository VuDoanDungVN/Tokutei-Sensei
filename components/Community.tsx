import React, { useState, useRef, useEffect, useContext } from 'react';
import Header from './shared/Header';
import { AppContext } from '../App';
// Fix: Renamed geminiService to appService to match exported member from geminiService.ts
import { appService } from '../services/geminiService';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const AiAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  </div>
);

const Community: React.FC = () => {
  const { t } = useContext(AppContext);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: t('community.welcome') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Fix: Renamed geminiService to appService to match exported member from geminiService.ts
    const aiResponseText = await appService.askKaigoSensei(input);
    const aiMessage: Message = { text: aiResponseText, sender: 'ai' };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen">
       <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <Header title={t('community.title')} />
      <div className="flex-grow p-4 overflow-y-auto space-y-6 no-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && <AiAvatar />}
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-blue text-white rounded-br-lg' : 'bg-gray-100 text-brand-text-primary rounded-bl-lg'}`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-3 justify-start">
             <AiAvatar />
             <div className="max-w-xs px-4 py-3 rounded-2xl bg-gray-100 text-brand-text-primary rounded-bl-lg">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 bg-transparent border-t border-gray-200">
        <form onSubmit={handleSend} className="flex items-center space-x-3 bg-white border border-gray-300 rounded-[10px] p-1 focus-within:ring-2 focus-within:ring-brand-blue transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('community.placeholder')}
            className="flex-grow p-2 bg-transparent border-none focus:outline-none text-gray-800 placeholder:text-gray-500 text-sm ml-2"
            disabled={isLoading}
          />
          <button type="submit" className="bg-brand-blue text-white p-2.5 rounded-[10px] transition-colors hover:bg-brand-blue-dark disabled:bg-gray-400 disabled:cursor-not-allowed shrink-0" disabled={isLoading || !input.trim()}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Community;