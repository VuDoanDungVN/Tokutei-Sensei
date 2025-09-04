import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import Button from './shared/Button';
import ProgressBar from './shared/ProgressBar';
import { Question, ExamResult, AppScreen, KanjiHint } from '../types';
import Card from './shared/Card';
import Tooltip from './shared/Tooltip';
import FeedbackAnimation from './shared/FeedbackAnimation';
import { appService } from '../services/geminiService';

interface QuizViewProps {
  questions: Question[];
  isMockExam: boolean;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, isMockExam }) => {
  const { setCurrentScreen, setLastResult, settings, t, selectedTopic } = useContext(AppContext);
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
    const hintText = await appService.getQuestionHint(question.question, question.options);
    setHint(hintText);
    setIsHintLoading(false);

    // Find two incorrect answers to eliminate
    const incorrectOptions = question.options
      .map((_, index) => index)
      .filter(index => index !== question.correctAnswer);
    
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


  const handleSelectAnswer = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    if (!isMockExam) {
      const isCorrect = index === question.correctAnswer;
      setFeedbackStatus(isCorrect ? 'correct' : 'incorrect');

      setTimeout(() => {
        setFeedbackStatus(null);
        setShowExplanation(true);
      }, 1500);
    }
  };

  const handleNext = () => {
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


    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      handleFinish(newAnswers);
    }
  };

  const handleFinish = (finalAnswers = answers) => {
    let correct = 0;
    const finalAnswerSet = { ...finalAnswers };
    // ensure last question is included if next wasn't clicked
    if(selectedAnswer !== null && finalAnswerSet[question.id] === undefined){
        finalAnswerSet[question.id] = selectedAnswer;
    }

    Object.keys(finalAnswerSet).forEach(qId => {
      const q = questions.find(q => q.id === qId);
      if (q && q.correctAnswer === finalAnswerSet[qId]) {
        correct++;
      }
    });

    const result: ExamResult = {
      score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
      totalQuestions: questions.length,
      correctAnswers: correct,
      timeTaken: isMockExam ? questions.length * 60 - timeLeft : 0,
      answers: finalAnswerSet,
    };
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
        <p className="text-lg font-semibold mb-6 leading-relaxed">{parseQuestionText(question.question, question.kanjiHints)}</p>

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

            if (showExplanation) {
              if (index === question.correctAnswer) {
                buttonClass = 'border-green-500 bg-green-100 text-green-800';
              } else if (isSelected && index !== question.correctAnswer) {
                buttonClass = 'border-red-500 bg-red-100 text-red-800';
              }
            } else if (isSelected) {
                buttonClass = 'border-brand-blue bg-brand-blue-light';
            }
            
            return (
              <button
                key={index}
                disabled={showExplanation || feedbackStatus !== null || isEliminated}
                onClick={() => handleSelectAnswer(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${buttonClass} ${isEliminated ? 'opacity-40 cursor-not-allowed bg-gray-100' : ''}`}
              >
                {option}
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