import React, { useState, useRef, useEffect } from 'react';
import { appService } from '../../services/geminiService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý AI thông minh của Mora Sensei. Tôi có thể giúp bạn về tiếng Nhật, luyện thi Kaigo Fukushi, và nhiều chủ đề khác như học tập, công nghệ, cuộc sống. Bạn cần hỗ trợ gì?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const popupMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollPopupToBottom = () => {
    popupMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isPopupOpen) {
      scrollPopupToBottom();
    }
  }, [messages, isPopupOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Use the new chatWithAI method
      const response = await appService.chatWithAI(inputText.trim());

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response || 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageText = (text: string) => {
    // Clean up special characters like ###, ##, #, **, *, etc.
    const cleanedText = text
      .replace(/^#{1,6}\s*/gm, '') // Remove markdown headers (###, ##, #)
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown (**text**)
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown (*text*)
      .replace(/`(.*?)`/g, '$1') // Remove code markdown (`text`)
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/^\s*[-*+]\s*/gm, '• ') // Convert list markers to bullet points
      .trim();
    
    // Split text into paragraphs and format
    const paragraphs = cleanedText.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Handle bullet points and numbered lists
      if (paragraph.includes('•') || paragraph.includes('-') || /^\d+\./.test(paragraph.trim())) {
        const lines = paragraph.split('\n');
        return (
          <div key={index} className="mb-2">
            {lines.map((line, lineIndex) => {
              if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                return (
                  <div key={lineIndex} className="flex items-start mb-1">
                    <span className="mr-2 mt-1" style={{ color: '#81c784' }}>•</span>
                    <span className="flex-1">{line.replace(/^[•-]\s*/, '')}</span>
                  </div>
                );
              } else if (/^\d+\./.test(line.trim())) {
                return (
                  <div key={lineIndex} className="flex items-start mb-1">
                    <span className="mr-2 mt-1 font-medium" style={{ color: '#81c784' }}>{line.match(/^\d+\./)?.[0]}</span>
                    <span className="flex-1">{line.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                );
              } else {
                return <div key={lineIndex} className="mb-1">{line}</div>;
              }
            })}
          </div>
        );
      }
      
      // Handle regular paragraphs
      return (
        <div key={index} className="mb-2 leading-relaxed">
          {paragraph.split('\n').map((line, lineIndex) => (
            <div key={lineIndex} className="mb-1">{line}</div>
          ))}
        </div>
      );
    });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'rotate-180' : ''
        }`}
        style={{ backgroundColor: '#81c784' }}
        title={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="text-white p-4 rounded-t-lg flex items-center justify-between" style={{ backgroundColor: '#46bcaf' }}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Mora AI Assistant</h3>
                <p className="text-xs opacity-90">Trợ lý AI đa năng</p>
              </div>
            </div>
            <button
              onClick={() => setIsPopupOpen(true)}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              title="Mở chat toàn màn hình"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.isUser
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                  style={message.isUser ? { backgroundColor: '#81c784' } : {}}
                >
                  <div className="text-sm">
                    {message.isUser ? (
                      <p>{message.text}</p>
                    ) : (
                      formatMessageText(message.text)
                    )}
                  </div>
                  <p className={`text-xs mt-2 ${
                    message.isUser ? 'text-white' : 'text-gray-500'
                  }`} style={message.isUser ? { opacity: 0.8 } : {}}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">Đang suy nghĩ...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                style={{ '--tw-ring-color': '#46bcaf' } as React.CSSProperties}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                style={{ backgroundColor: '#81c784' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Chat Full Screen */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
            {/* Popup Header */}
            <div className="text-white p-4 rounded-t-lg flex items-center justify-between" style={{ backgroundColor: '#46bcaf' }}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Mora AI Assistant</h2>
                  <p className="text-sm opacity-90">Trợ lý AI đa năng - Chat toàn màn hình</p>
                </div>
              </div>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                title="Đóng chat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Popup Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg ${
                      message.isUser
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    style={message.isUser ? { backgroundColor: '#81c784' } : {}}
                  >
                    <div className="text-base leading-relaxed">
                      {message.isUser ? (
                        <p>{message.text}</p>
                      ) : (
                        formatMessageText(message.text)
                      )}
                    </div>
                    <p className={`text-xs mt-3 ${
                      message.isUser ? 'text-white' : 'text-gray-500'
                    }`} style={message.isUser ? { opacity: 0.8 } : {}}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                      <span className="text-base">Đang suy nghĩ...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={popupMessagesEndRef} />
            </div>

            {/* Popup Input */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập câu hỏi của bạn..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-base"
                  style={{ '--tw-ring-color': '#81c784' } as React.CSSProperties}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="px-6 py-3 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-medium"
                  style={{ backgroundColor: '#81c784' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
