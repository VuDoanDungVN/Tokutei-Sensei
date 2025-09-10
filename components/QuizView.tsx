import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { Question, ExamResult, AppScreen, KanjiHint } from '../types';
import Card from './shared/Card';
import Tooltip from './shared/Tooltip';
import FeedbackAnimation from './shared/FeedbackAnimation';
import { appService } from '../services/geminiService';
import { progressService } from '../services/progressService';

interface QuizViewProps {
  questions: Question[];
  isMockExam: boolean;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, isMockExam }) => {
  const { setCurrentScreen, setLastResult, settings, t, selectedTopic, user, selectedExamNumber } = useContext(AppContext);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(isMockExam ? questions.length * 60 : 0);
  const [translatedExplanation, setTranslatedExplanation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'correct' | 'incorrect' | null>(null);

  // New state for practice mode timer and hints
  const [practiceTimer, setPracticeTimer] = useState(60);
  const [hint, setHint] = useState<string | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [isHintLoading, setIsHintLoading] = useState(false);
  
  // Kaigo Chat state
  const [showKaigoChat, setShowKaigoChat] = useState(false);
  const [kaigoChatMessages, setKaigoChatMessages] = useState<{ text: string; isUser: boolean; timestamp: string }[]>([]);
  const [kaigoChatInput, setKaigoChatInput] = useState('');
  const [isKaigoChatLoading, setIsKaigoChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Copy functionality state
  const [copyStatus, setCopyStatus] = useState<{ type: 'question' | 'options' | null; success: boolean }>({ type: null, success: false });

  const question = questions[currentQ];

  // Timer for mock exams
  useEffect(() => {
    if (!isMockExam) return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isMockExam]);

  const handleTimeout = async () => {
    if (!question) return;
    // Get hint from AI
    setIsHintLoading(true);
    const optionsText = question.options.map(opt => typeof opt === 'string' ? opt : opt.text);
    const hintText = await appService.getQuestionHint(question.question, optionsText);
    setHint(hintText);
    setIsHintLoading(false);

    // Find two incorrect answers to eliminate
    const correctAnswerIndex = typeof question.correctAnswer === 'string' 
      ? question.options.findIndex(opt => opt.id === question.correctAnswer)
      : question.correctAnswer;
    const incorrectOptions = question.options
      .map((_, index) => index)
      .filter(index => index !== correctAnswerIndex);
    
    const shuffled = incorrectOptions.sort(() => 0.5 - Math.random());
    setEliminatedOptions(shuffled.slice(0, 2));
  };
  
  // Timer for practice questions
  useEffect(() => {
    if (isMockExam || showExplanation || selectedAnswer !== null) {
      return;
    }
    if (practiceTimer <= 0) {
      handleTimeout();
      return;
    }
    const timerId = setInterval(() => {
      setPracticeTimer(t => t - 1);
    }, 1000);
    return () => clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceTimer, isMockExam, showExplanation, selectedAnswer]);

  
  useEffect(() => {
    if (showExplanation && settings.language !== 'ja' && question) {
      const translate = async () => {
        setIsTranslating(true);
        setTranslatedExplanation(null);
        const translation = await appService.translateText(question.explanation, settings.language);
        setTranslatedExplanation(translation);
        setIsTranslating(false);
      };
      translate();
    }
  }, [showExplanation, question, settings.language]);

  // Kaigo Chat functions
  const handleKaigoChatSend = async () => {
    if (!kaigoChatInput.trim() || isKaigoChatLoading) return;
    
    const userMessage = kaigoChatInput.trim();
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    // Check if the message contains Japanese text
    const containsJapanese = isJapaneseText(userMessage);
    
    // Add user message
    setKaigoChatMessages(prev => [...prev, { text: userMessage, isUser: true, timestamp }]);
    setKaigoChatInput('');
    setIsKaigoChatLoading(true);
    
    try {
      let finalMessage = userMessage;
      
      // If the message contains Japanese, translate it first
      if (containsJapanese) {
        try {
          const translatedText = await appService.translateText(userMessage, 'vi');
          finalMessage = `[Dịch từ tiếng Nhật]: ${translatedText}\n\n[Văn bản gốc]: ${userMessage}`;
          
          // Add translation message
          const translationTimestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          setKaigoChatMessages(prev => [...prev, { 
            text: `📝 Đã dịch sang tiếng Việt:\n${translatedText}`, 
            isUser: false, 
            timestamp: translationTimestamp 
          }]);
        } catch (translationError) {
          console.error('❌ Error translating text:', translationError);
          // Continue with original message if translation fails
        }
      }
      
      // Get AI response
      const aiResponse = await appService.askKaigoSensei(finalMessage);
      const aiTimestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      
      // Add AI response
      setKaigoChatMessages(prev => [...prev, { text: aiResponse, isUser: false, timestamp: aiTimestamp }]);
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      const errorTimestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setKaigoChatMessages(prev => [...prev, { 
        text: 'Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau.', 
        isUser: false, 
        timestamp: errorTimestamp 
      }]);
    } finally {
      setIsKaigoChatLoading(false);
    }
  };

  // Voice input function
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ voice input. Vui lòng sử dụng bàn phím.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'vi-VN'; // Vietnamese
    recognition.continuous = false;
    recognition.interimResults = false;
    
    setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setKaigoChatInput(transcript);
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

  // Helper function to detect Japanese text
  const isJapaneseText = (text: string): boolean => {
    // Check for Hiragana, Katakana, and Kanji characters
    const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/;
    return japaneseRegex.test(text);
  };

  // Copy functions
  const handleCopyQuestion = async () => {
    try {
      const questionText = question.question;
      await navigator.clipboard.writeText(questionText);
      setCopyStatus({ type: 'question', success: true });
      setTimeout(() => setCopyStatus({ type: null, success: false }), 2000);
    } catch (error) {
      console.error('Failed to copy question:', error);
      setCopyStatus({ type: 'question', success: false });
      setTimeout(() => setCopyStatus({ type: null, success: false }), 2000);
    }
  };

  const handleCopyOptions = async () => {
    try {
      const optionsText = question.options.map((option, index) => {
        const optionText = typeof option === 'string' ? option : option.text;
        return `${index + 1}. ${optionText}`;
      }).join('\n');
      
      await navigator.clipboard.writeText(optionsText);
      setCopyStatus({ type: 'options', success: true });
      setTimeout(() => setCopyStatus({ type: null, success: false }), 2000);
    } catch (error) {
      console.error('Failed to copy options:', error);
      setCopyStatus({ type: 'options', success: false });
      setTimeout(() => setCopyStatus({ type: null, success: false }), 2000);
    }
  };


  const handleSelectAnswer = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    if (!isMockExam) {
      // Handle both old format (number) and new format (string)
      const correctAnswerIndex = typeof question.correctAnswer === 'string' 
        ? question.options.findIndex(opt => opt.id === question.correctAnswer)
        : question.correctAnswer;
      const isCorrect = index === correctAnswerIndex;
      setFeedbackStatus(isCorrect ? 'correct' : 'incorrect');

      setTimeout(() => {
        setFeedbackStatus(null);
        setShowExplanation(true);
      }, 1500);
    }
  };

  const handleNext = async () => {
    const newAnswers = { ...answers };
    if (selectedAnswer !== null) {
      newAnswers[question.id] = selectedAnswer;
    }
    setAnswers(newAnswers);

    setShowExplanation(false);
    setSelectedAnswer(null);
    setTranslatedExplanation(null);
    // Reset practice timer states
    setPracticeTimer(60);
    setHint(null);
    setEliminatedOptions([]);
    setIsHintLoading(false);
    // Reset kaigo chat states
    setShowKaigoChat(false);
    setKaigoChatMessages([]);
    setKaigoChatInput('');
    setIsKaigoChatLoading(false);
    setIsListening(false);
    
    // Reset copy status
    setCopyStatus({ type: null, success: false });


    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      await handleFinish(newAnswers);
    }
  };

  const handleFinish = async (finalAnswers = answers) => {
    let correct = 0;
    const finalAnswerSet = { ...finalAnswers };
    // ensure last question is included if next wasn't clicked
    if(selectedAnswer !== null && finalAnswerSet[question.id] === undefined){
        finalAnswerSet[question.id] = selectedAnswer;
    }

    Object.keys(finalAnswerSet).forEach(qId => {
      const q = questions.find(q => q.id === qId);
      if (q) {
        // Handle both old format (number) and new format (string)
        const correctAnswerIndex = typeof q.correctAnswer === 'string' 
          ? q.options.findIndex(opt => opt.id === q.correctAnswer)
          : q.correctAnswer;
        if (correctAnswerIndex === finalAnswerSet[qId]) {
          correct++;
        }
      }
    });

    const result: ExamResult = {
      score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
      totalQuestions: questions.length,
      correctAnswers: correct,
      timeTaken: isMockExam ? questions.length * 60 - timeLeft : 0,
      answers: finalAnswerSet,
    };

    // Save quiz result and update progress
    if (user && selectedTopic && selectedExamNumber) {
      try {
        const questionsAnswered = Object.keys(finalAnswerSet);
        await progressService.saveQuizResult(
          user.uid,
          selectedExamNumber,
          selectedTopic.id,
          result,
          questionsAnswered
        );
      } catch (error) {
        console.error('❌ Error saving progress:', error);
        // Continue with the quiz even if progress saving fails
      }
    }

    setLastResult(result);
    setCurrentScreen(AppScreen.Results);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  const parseQuestionText = (text: string, hints: KanjiHint[] | undefined): React.ReactNode => {
    if (!hints || hints.length === 0 || !text) {
        return text;
    }

    let parts: (string | React.ReactNode)[] = [text];

    hints.forEach((hint, hintIndex) => {
        const newParts: (string | React.ReactNode)[] = [];
        parts.forEach((part) => {
            if (typeof part === 'string') {
                const splitText = part.split(hint.kanji);
                if (splitText.length > 1) {
                    for (let i = 0; i < splitText.length; i++) {
                        newParts.push(splitText[i]);
                        if (i < splitText.length - 1) {
                            const tooltipContent = (
                                <div className="text-left">
                                    <p><strong>Romaji:</strong> {hint.romaji}</p>
                                    <p><strong>{settings.language === 'vi' ? 'Nghĩa:' : 'Meaning:'}</strong> {hint.meaning[settings.language as 'en' | 'vi']}</p>
                                </div>
                            );
                            newParts.push(
                                <Tooltip key={`${hintIndex}-${i}`} content={tooltipContent}>
                                    <span className="text-brand-blue font-bold border-b-2 border-brand-blue-light border-dashed cursor-pointer">{hint.kanji}</span>
                                </Tooltip>
                            );
                        }
                    }
                } else {
                    newParts.push(part);
                }
            } else {
                newParts.push(part);
            }
        });
        parts = newParts;
    });
    
    return <>{parts.map((p, i) => <React.Fragment key={i}>{p}</React.Fragment>)}</>;
  };


  if (!questions || questions.length === 0) {
    return (
        <div className="p-4 text-center">
            <h2 className="text-xl font-bold">{t('quiz.noQuestions')}</h2>
            <Button onClick={() => setCurrentScreen(AppScreen.Practice)} className="mt-4">{t('practice.backToSelection')}</Button>
        </div>
    );
  }
  
  if (!question) {
     return (
        <div className="p-4 text-center">
            <h2 className="text-xl font-bold">Loading...</h2>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen flex flex-col">
      {feedbackStatus && <FeedbackAnimation type={feedbackStatus} />}
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center flex-1 min-w-0">
          {!isMockExam && (
            <button onClick={() => setCurrentScreen(AppScreen.Practice)} className="mr-2 p-1 rounded-full hover:bg-gray-100 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h2 className="font-bold text-lg truncate">{isMockExam ? t('quiz.mockExam') : selectedTopic ? t(selectedTopic.titleKey) : t('quiz.practice')}</h2>
        </div>
        <div className="shrink-0 ml-2">
            {isMockExam && <div className="font-mono text-lg bg-red-100 text-red-700 px-3 py-1 rounded-lg">{formatTime(timeLeft)}</div>}
            {!isMockExam && !showExplanation && selectedAnswer === null && (
            <div className="font-mono text-lg bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">
                {practiceTimer}s
            </div>
            )}
        </div>
      </div>

      <ProgressBar value={((currentQ + 1) / questions.length) * 100} />
      <p className="text-sm text-center text-brand-text-secondary my-2">{t('quiz.question')} {currentQ + 1} {t('quiz.of')} {questions.length}</p>

      {/* Question Card */}
      <Card className="flex-grow flex flex-col">
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-start justify-between mb-3">
            <p className="text-lg font-semibold leading-relaxed whitespace-pre-wrap flex-1">
              {parseQuestionText(question.question, question.kanjiHints)}
            </p>
            <button
              onClick={handleCopyQuestion}
              className="ml-3 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors shrink-0"
              title="Copy câu hỏi"
            >
              {copyStatus.type === 'question' && copyStatus.success ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              )}
            </button>
          </div>
          
          {/* Kaigo Fukushi AI Chat */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🤖</span>
                <span className="text-sm font-medium text-gray-700">Học cùng AI</span>
              </div>
              <button
                onClick={() => {
                  setShowKaigoChat(!showKaigoChat);
                  // Add welcome message when opening chat for the first time
                  if (!showKaigoChat && kaigoChatMessages.length === 0) {
                    const welcomeMessage = {
                      text: "Xin chào! Tôi là Kaigo Fukushi Sensei\n\nChuyên gia về chăm sóc y tế & tiếng Nhật y tế\n\nTôi có thể giúp bạn:\n• Dịch thuật tiếng Nhật y tế (tự động khi bạn paste)\n• Giải thích thuật ngữ Kaigo Fukushi\n• Học tiếng Nhật chuyên ngành\n• Hướng dẫn kỳ thi 介護福祉士\n• Trả lời câu hỏi về chăm sóc y tế\n\nMẹo: Copy câu hỏi tiếng Nhật và paste vào đây để dịch tự động!\n\nHãy hỏi tôi bất cứ điều gì!",
                      isUser: false,
                      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    };
                    setKaigoChatMessages([welcomeMessage]);
                  }
                }}
                className="flex items-center space-x-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                title="Chat với AI chuyên gia Kaigo Fukushi"
              >
                <span className="text-sm font-medium">
                  {showKaigoChat ? 'Ẩn Chat' : 'Mở Chat'}
                </span>
              </button>
            </div>
            
            {showKaigoChat && (
              <div className="bg-white border border-gray-200 rounded-lg h-80 flex flex-col">
                {/* Chat Header */}
                <div className="p-3 border-b bg-green-50 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">K</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">Kaigo Fukushi Sensei</h3>
                      <p className="text-xs text-gray-600">Chuyên gia về chăm sóc y tế & ngôn ngữ tiếng Nhật</p>
                    </div>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                      {kaigoChatMessages.map((message, index) => (
                        <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                            message.isUser 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                            <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                          </div>
                        </div>
                      ))}
                  
                  {isKaigoChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                          <span className="text-sm">Kaigo Sensei đang suy nghĩ...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Chat Input */}
                <div className="p-3 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={kaigoChatInput}
                      onChange={(e) => setKaigoChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleKaigoChatSend()}
                      placeholder="Hỏi về Kaigo Fukushi, copy câu hỏi tiếng Nhật để dịch tự động, hoặc chat với AI..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      disabled={isKaigoChatLoading}
                    />
                    <button
                      onClick={handleVoiceInput}
                      disabled={isKaigoChatLoading || isListening}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={isListening ? 'Đang nghe...' : 'Nhấn để nói'}
                    >
                      {isListening ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={handleKaigoChatSend}
                      disabled={!kaigoChatInput.trim() || isKaigoChatLoading}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {isHintLoading && (
            <div className="my-4 p-3 bg-blue-50/50 border-blue-200 rounded-lg text-center">
                <p className="font-semibold text-sm text-blue-700">ヒントを生成中...</p>
            </div>
        )}
        {hint && (
            <div className="my-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center animate-fade-in">
                <p className="font-semibold text-blue-700">ヒント: {hint}</p>
            </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Câu trả lời:</h3>
            <button
              onClick={handleCopyOptions}
              className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
              title="Copy tất cả câu trả lời"
            >
              {copyStatus.type === 'options' && copyStatus.success ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              )}
            </button>
          </div>
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isEliminated = eliminatedOptions.includes(index);
            let buttonClass = 'border-gray-300 bg-white hover:bg-gray-50';

            // Handle both old format (number) and new format (string)
            const correctAnswerIndex = typeof question.correctAnswer === 'string' 
              ? question.options.findIndex(opt => opt.id === question.correctAnswer)
              : question.correctAnswer;

            if (showExplanation) {
              if (index === correctAnswerIndex) {
                buttonClass = 'border-green-500 bg-green-100 text-green-800';
              } else if (isSelected && index !== correctAnswerIndex) {
                buttonClass = 'border-red-500 bg-red-100 text-red-800';
              }
            } else if (isSelected) {
                buttonClass = 'border-green-500 bg-green-100 text-green-800';
            }
            
            return (
              <button
                key={index}
                disabled={showExplanation || feedbackStatus !== null || isEliminated}
                onClick={() => handleSelectAnswer(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${buttonClass} ${isEliminated ? 'opacity-40 cursor-not-allowed bg-gray-100' : ''}`}
              >
                <span className="whitespace-pre-wrap leading-relaxed">
                  {typeof option === 'string' ? option : option.text}
                </span>
              </button>
            );
          })}
        </div>
        
        {showExplanation && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3 animate-fade-in">
            <style>{`
              @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
              }
            `}</style>
            <div>
              <h4 className="font-bold text-yellow-800">{t('quiz.explanation')} (日本語)</h4>
              <p className="text-sm text-yellow-700">{question.explanation}</p>
            </div>
            {settings.language !== 'ja' && (
              <div>
                <h4 className="font-bold text-yellow-800">{t('quiz.explanation')} ({settings.language === 'en' ? 'English' : 'Tiếng Việt'})</h4>
                {isTranslating && <p className="text-sm text-yellow-700">Translating...</p>}
                {translatedExplanation && <p className="text-sm text-yellow-700">{translatedExplanation}</p>}
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* Footer Actions */}
      <div className="mt-6">
        <Button onClick={showExplanation ? handleNext : (isMockExam ? handleNext : () => {})} disabled={selectedAnswer === null || feedbackStatus !== null}>
          {showExplanation ? (currentQ === questions.length-1 ? t('quiz.finish') : t('quiz.next')) : isMockExam ? (currentQ === questions.length-1 ? t('quiz.finish') : t('quiz.next')) : t('quiz.checkAnswer')}
        </Button>
      </div>


    </div>
  );
};

export default QuizView;