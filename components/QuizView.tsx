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
  
  // Kanji analysis state
  const [currentKanjiWords, setCurrentKanjiWords] = useState<{ word?: string; furigana?: string; meaning?: { en?: string; vi?: string } }[]>([]);
  const [isKanjiAnalyzing, setIsKanjiAnalyzing] = useState(false);
  const [showKanjiHints, setShowKanjiHints] = useState(false);

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

  // Auto-analyze kanji when question changes
  useEffect(() => {
    if (question && !showExplanation && selectedAnswer === null) {
      analyzeKanjiForQuestion(question);
    }
  }, [question, showExplanation, selectedAnswer]);


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
    setCurrentKanjiWords([]);
    setIsKanjiAnalyzing(false);
    setShowKanjiHints(false); // Reset to hide hints for new question


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

  const analyzeKanjiForQuestion = async (questionData: Question) => {
    if (!questionData) return;
    
    setIsKanjiAnalyzing(true);
    
    // Extract basic kanji words immediately (fast fallback)
    const fullText = `${questionData.question} ${questionData.options.map(opt => typeof opt === 'string' ? opt : opt.text).join(' ')}`;
    const kanjiRegex = /[\u4e00-\u9faf]+/g;
    const basicKanjiWords = fullText.match(kanjiRegex) || [];
    
    // Show basic kanji words immediately
    const basicWords = basicKanjiWords.slice(0, 8).map(word => ({
      word: word,
      furigana: '読み方...',
      meaning: {
        en: 'Reading...',
        vi: 'Đang phân tích...'
      }
    }));
    
    setCurrentKanjiWords(basicWords);
    
    try {
      // Get options text
      const optionsText = questionData.options.map(opt => typeof opt === 'string' ? opt : opt.text);
      
      // Let AI analyze without timeout - let it take as long as needed
      const kanjiWords = await appService.analyzeKanjiInQuestion(questionData.question, optionsText);
      
      // Update with AI results if successful
      if (kanjiWords && kanjiWords.length > 0) {
        setCurrentKanjiWords(kanjiWords);
      }
    } catch (error) {
      console.error('Error analyzing kanji:', error);
      // Keep the basic words if AI fails
    } finally {
      setIsKanjiAnalyzing(false);
    }
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
          <p className="text-lg font-semibold leading-relaxed whitespace-pre-wrap">
            {parseQuestionText(question.question, question.kanjiHints)}
          </p>
          
          {/* Auto-display kanji hints */}
          {(currentKanjiWords.length > 0 || isKanjiAnalyzing) && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">漢字のヒント (Kanji Hints)</span>
                  {isKanjiAnalyzing && (
                    <span className="text-xs text-blue-600 flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
                      Đang phân tích...
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowKanjiHints(!showKanjiHints)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                  title={showKanjiHints ? 'Ẩn gợi ý kanji' : 'Hiện gợi ý kanji'}
                >
                  {showKanjiHints ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </div>
              {showKanjiHints && (
                <div className="flex flex-wrap gap-2">
                  {currentKanjiWords.map((word, index) => (
                    <div key={index} className="flex items-center bg-white px-2 py-1 rounded border text-xs">
                      <span className="font-bold text-gray-800 mr-1" style={{ fontSize: '13px' }}>
                        {word.word}
                      </span>
                      <span className="text-red-600 mr-1" style={{ fontSize: '13px' }}>
                        ({word.furigana})
                      </span>
                      <span className="text-gray-600" style={{ fontSize: '13px' }}>
                        {word.meaning?.[settings.language] || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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