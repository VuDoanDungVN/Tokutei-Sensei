import React, { useState, useEffect, useRef } from 'react';
import { appService } from '../../services/geminiService';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatPopup: React.FC<ChatPopupProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('kaigo-chat-messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading chat messages:', error);
      }
    } else {
      // Add welcome message if no saved messages
      const welcomeMessage: ChatMessage = {
        text: "Xin chào! Tôi là Kaigo Fukushi Sensei\n\nChuyên gia về chăm sóc y tế & tiếng Nhật y tế\n\nTôi có thể giúp bạn:\n• Dịch tiếng Nhật sang tiếng Việt\n• Phân tích từ kanji với cách đọc chi tiết\n• Giải thích thuật ngữ Kaigo Fukushi\n• Học tiếng Nhật chuyên ngành\n• Hướng dẫn kỳ thi 介護福祉士\n• Trả lời câu hỏi về chăm sóc y tế\n\nMẹo:\n• Từ/cụm từ kanji ngắn → Phân tích chi tiết với cách đọc\n• Đoạn văn tiếng Nhật dài → Dịch đơn giản\n• Câu hỏi tiếng Việt → Trả lời chuyên môn\n\nHãy hỏi tôi bất cứ điều gì!",
        isUser: false,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('kaigo-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper function to detect Japanese text
  const isJapaneseText = (text: string): boolean => {
    const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/;
    return japaneseRegex.test(text);
  };

  // Helper function to check if text is short kanji phrase/word (for detailed breakdown)
  const isShortKanjiText = (text: string): boolean => {
    const trimmedText = text.trim();
    // Check if text contains Japanese characters
    const hasJapanese = /[\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff]/.test(trimmedText);
    // Check if text is short (less than 20 characters and contains kanji)
    const isShort = trimmedText.length <= 20;
    const hasKanji = /[\u4e00-\u9faf]/.test(trimmedText);
    
    return hasJapanese && isShort && hasKanji;
  };

  // Voice input function
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ voice input. Vui lòng sử dụng bàn phím.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('Vui lòng cho phép sử dụng microphone để sử dụng tính năng voice input.');
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  // Clear chat function
  const handleClearChat = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ cuộc trò chuyện?')) {
      setMessages([]);
      localStorage.removeItem('kaigo-chat-messages');
    }
  };

  // Send message function
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    // Check if the message contains Japanese text
    const containsJapanese = isJapaneseText(userMessage);
    
    // Add user message
    const newUserMessage: ChatMessage = { text: userMessage, isUser: true, timestamp };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // If the message contains Japanese, check if it's short kanji text
      if (containsJapanese) {
        if (isShortKanjiText(userMessage)) {
          // Short kanji phrase/word - show detailed breakdown
          try {
            const translationWithReading = await appService.translateJapaneseWithReading(userMessage);
            
            const translationTimestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            const translationMessage: ChatMessage = { 
              text: `📝 Dịch tiếng Nhật:\n\n${translationWithReading}`, 
              isUser: false, 
              timestamp: translationTimestamp 
            };
            setMessages(prev => [...prev, translationMessage]);
          } catch (translationError) {
            console.error('❌ Error translating text:', translationError);
            const errorTimestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            const errorMessage: ChatMessage = { 
              text: '❌ Không thể dịch văn bản tiếng Nhật. Vui lòng thử lại.', 
              isUser: false, 
              timestamp: errorTimestamp 
            };
            setMessages(prev => [...prev, errorMessage]);
          }
        } else {
          // Long Japanese text - simple translation
          try {
            const simpleTranslation = await appService.translateText(userMessage, 'vi');
            
            const translationTimestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            const translationMessage: ChatMessage = { 
              text: `📝 Dịch tiếng Nhật:\n\n${simpleTranslation}`, 
              isUser: false, 
              timestamp: translationTimestamp 
            };
            setMessages(prev => [...prev, translationMessage]);
          } catch (translationError) {
            console.error('❌ Error translating text:', translationError);
            const errorTimestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            const errorMessage: ChatMessage = { 
              text: '❌ Không thể dịch văn bản tiếng Nhật. Vui lòng thử lại.', 
              isUser: false, 
              timestamp: errorTimestamp 
            };
            setMessages(prev => [...prev, errorMessage]);
          }
        }
      } else {
        // For non-Japanese text, get AI response
        const aiResponse = await appService.askKaigoSensei(userMessage);
        const aiTimestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        // Add AI response
        const aiMessage: ChatMessage = { text: aiResponse, isUser: false, timestamp: aiTimestamp };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      const errorTimestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const errorMessage: ChatMessage = { 
        text: 'Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau.', 
        isUser: false, 
        timestamp: errorTimestamp 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-green-50 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">K</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Kaigo Fukushi Sensei</h3>
              <p className="text-sm text-gray-600">Chuyên gia về chăm sóc y tế & ngôn ngữ tiếng Nhật</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearChat}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Xóa cuộc trò chuyện"
            >
              🗑️ Xóa
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Đóng chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl px-4 py-3 rounded-lg ${
                message.isUser 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="text-sm">
                  {message.text.split('\n').map((line, lineIndex) => {
                    // Check if line is a section header
                    if (line.match(/^【.*】$/)) {
                      return (
                        <div key={lineIndex} className="font-bold text-green-700 mt-3 mb-2 first:mt-0">
                          {line}
                        </div>
                      );
                    }
                    // Check if line is a word breakdown item
                    else if (line.includes('(') && line.includes(')') && line.includes('-')) {
                      const parts = line.split(' - ');
                      const wordPart = parts[0];
                      const meaningPart = parts[1];
                      return (
                        <div key={lineIndex} className="ml-4 mb-2 border-l-2 border-green-200 pl-3">
                          <div className="font-medium text-gray-800">{wordPart}</div>
                          {meaningPart && <div className="text-gray-600 text-xs mt-1">{meaningPart}</div>}
                        </div>
                      );
                    }
                    // Regular text
                    else if (line.trim()) {
                      return (
                        <div key={lineIndex} className="mb-2">
                          {line}
                        </div>
                      );
                    }
                    // Empty line
                    return <div key={lineIndex} className="h-2"></div>;
                  })}
                </div>
                <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 max-w-2xl px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span className="text-sm">Kaigo Sensei đang suy nghĩ...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập từ kanji để phân tích chi tiết, đoạn văn tiếng Nhật để dịch, hoặc hỏi về Kaigo Fukushi..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
            <button
              onClick={handleVoiceInput}
              disabled={isLoading || isListening}
              className={`px-4 py-3 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Đang nghe...' : 'Nhấn để nói'}
            >
              {isListening ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              )}
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPopup;
