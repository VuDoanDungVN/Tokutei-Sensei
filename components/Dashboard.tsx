
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import Card from './shared/Card';
import ProgressBar from './shared/ProgressBar';
import Button from './shared/Button';
import { AppScreen, Language } from '../types';
// Fix: Renamed geminiService to appService to match exported member from geminiService.ts
import { appService } from '../services/geminiService';
import { progressService } from '../services/progressService';

const Dashboard: React.FC = () => {
  const { settings, setCurrentScreen, startMockExam, t, setSettings, selectedExamNumber, setSelectedExamNumber, user, currentScreen, setSettingsOpen } = useContext(AppContext);
  const [quote, setQuote] = useState("Loading your daily inspiration...");
  const [examProgress, setExamProgress] = useState<{ [examNumber: number]: { name: string; progress: number } }>({});

  useEffect(() => {
    // Fix: Renamed geminiService to appService to match exported member from geminiService.ts
    appService.getMotivationalQuote().then(setQuote);
  }, []);

  // Load exam progress data
  useEffect(() => {
    const loadExamProgress = async () => {
      if (!user) return;

      try {
        // Load real progress data from database
        const allProgress = await progressService.getAllUserProgress(user.uid);
        
        // Get all exams with progress (not just passed ones)
        const examsWithProgress = await progressService.getExamsWithProgress(allProgress);
        
        // Convert to display format - show all exams with progress
        const progressMap: { [examNumber: number]: { name: string; progress: number } } = {};
        
        for (const [examNumber, progress] of Object.entries(examsWithProgress)) {
          const examNum = parseInt(examNumber);
          const progressPercentage = await progressService.calculateProgressPercentage(progress, examNum);
          
          progressMap[examNum] = {
            name: progressService.getExamName(examNum),
            progress: progressPercentage
          };
        }
        
        setExamProgress(progressMap);
        
        // Set default exam if none selected
        if (!selectedExamNumber && Object.keys(progressMap).length > 0) {
          const firstExam = parseInt(Object.keys(progressMap)[0]);
          setSelectedExamNumber(firstExam);
        }
        
      } catch (error) {
        console.error('❌ Error loading exam progress:', error);
        
        // Fallback to empty progress if there's an error
        // No passed exams to show if there's an error
        setExamProgress({});
        
        // Reset selected exam if no passed exams available
        if (selectedExamNumber) {
          setSelectedExamNumber(null);
        }
      }
    };
    
    loadExamProgress();
  }, [user, selectedExamNumber, setSelectedExamNumber]);

  // Refresh progress when returning from quiz
  useEffect(() => {
    if (user && currentScreen === AppScreen.Dashboard) {
      const loadExamProgress = async () => {
        try {
          const allProgress = await progressService.getAllUserProgress(user.uid);
          
          // Get all exams with progress (not just passed ones)
          const examsWithProgress = await progressService.getExamsWithProgress(allProgress);
          
          // Convert to display format - show all exams with progress
          const progressMap: { [examNumber: number]: { name: string; progress: number } } = {};
          
          for (const [examNumber, progress] of Object.entries(examsWithProgress)) {
            const examNum = parseInt(examNumber);
            const progressPercentage = await progressService.calculateProgressPercentage(progress, examNum);
            
            progressMap[examNum] = {
              name: progressService.getExamName(examNum),
              progress: progressPercentage
            };
          }
          
          setExamProgress(progressMap);
        } catch (error) {
          console.error('❌ Error refreshing progress:', error);
        }
      };
      
      loadExamProgress();
    }
  }, [user, currentScreen]);

  const getDaysUntilExam = () => {
    if (!settings.examDate) return 0;
    const today = new Date();
    const examDate = new Date(settings.examDate);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = getDaysUntilExam();


  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-brand-text-primary">{t('dashboard.greeting')}</h1>
          <p className="text-brand-text-secondary">{t('dashboard.subtitle')}</p>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Cài đặt"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Progress Card */}
      <Card className="bg-gradient-to-br from-brand-blue to-teal-400 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm opacity-90">{t('dashboard.progress')}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold">
                {selectedExamNumber && examProgress[selectedExamNumber] 
                  ? examProgress[selectedExamNumber].name 
                  : Object.keys(examProgress).length > 0 
                    ? 'Chọn kỳ thi'
                    : 'Chưa có tiến độ nào'
                }
              </p>
              {Object.keys(examProgress).length > 0 && (
                <select
                  value={selectedExamNumber || ''}
                  onChange={(e) => setSelectedExamNumber(parseInt(e.target.value))}
                  className="bg-white/20 text-white text-sm rounded px-2 py-1 border border-white/30"
                >
                  <option value="" className="text-gray-800">Chọn kỳ thi</option>
                  {Object.entries(examProgress).map(([examNum, data]) => (
                    <option key={examNum} value={examNum} className="text-gray-800">
                      {(data as { name: string; progress: number }).name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">{daysLeft} {t('dashboard.daysLeft')}</p>
            <p className="text-2xl font-bold">
              {selectedExamNumber && examProgress[selectedExamNumber] 
                ? `${examProgress[selectedExamNumber].progress}%`
                : Object.keys(examProgress).length > 0 
                  ? 'Chọn kỳ thi'
                  : '0%'
              }
            </p>
          </div>
        </div>
        <ProgressBar 
          value={selectedExamNumber && examProgress[selectedExamNumber] 
            ? examProgress[selectedExamNumber].progress 
            : Object.keys(examProgress).length > 0 
              ? 0
              : 0
          } 
          colorClass="bg-white" 
        />
      </Card>

      {/* No progress message */}
      {Object.keys(examProgress).length === 0 && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Chưa có tiến độ nào</h3>
              <p className="text-sm text-green-700">
                Hãy làm bài luyện tập để bắt đầu theo dõi tiến độ học tập của bạn!
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Access */}
      <div className="grid grid-cols-2 gap-4">
        <Card onClick={() => setCurrentScreen(AppScreen.Practice)} className="text-center items-center flex flex-col justify-center !p-6">
          <div className="bg-brand-blue-light p-3 rounded-full mb-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
          </div>
          <h3 className="font-bold text-brand-text-primary">{t('dashboard.practiceByTopic')}</h3>
        </Card>
        <Card onClick={() => {}} className="text-center items-center flex flex-col justify-center !p-6">
          <div className="bg-brand-green-light p-3 rounded-full mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-green-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
          <h3 className="font-bold text-brand-text-primary">{t('dashboard.flashcards')}</h3>
        </Card>
      </div>
      
      <Button onClick={startMockExam} variant="primary">{t('dashboard.startMockExam')}</Button>

      {/* Motivational Quote & Streak */}
      <Card className="text-center">
        <p className="text-sm text-brand-text-secondary italic">"{quote}"</p>
        <div className="mt-4 flex justify-center items-center space-x-2 text-brand-green-dark">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-bold">5 {t('dashboard.streak')}</span>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <h3 className="font-bold mb-2">{t('dashboard.notifications')}</h3>
        <div className="bg-brand-blue-light p-3 rounded-lg flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-blue-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="font-semibold text-sm">{t('dashboard.mockExamScheduled')}</p>
            <p className="text-xs text-brand-text-secondary">{t('dashboard.reviewNotes')}</p>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default Dashboard;