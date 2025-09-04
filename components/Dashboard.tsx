
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import Card from './shared/Card';
import ProgressBar from './shared/ProgressBar';
import Button from './shared/Button';
import { AppScreen } from '../types';
// Fix: Renamed geminiService to appService to match exported member from geminiService.ts
import { appService } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const { settings, setCurrentScreen, startMockExam, t } = useContext(AppContext);
  const [quote, setQuote] = useState("Loading your daily inspiration...");

  useEffect(() => {
    // Fix: Renamed geminiService to appService to match exported member from geminiService.ts
    appService.getMotivationalQuote().then(setQuote);
  }, []);

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
    <div className="p-4 md:p-6 space-y-6">
      <header className="pt-4">
        <h1 className="text-3xl font-bold text-brand-text-primary">{t('dashboard.greeting')}</h1>
        <p className="text-brand-text-secondary">{t('dashboard.subtitle')}</p>
      </header>

      {/* Progress Card */}
      <Card className="bg-gradient-to-br from-brand-blue to-teal-400 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm opacity-90">{t('dashboard.progress')}</p>
            <p className="text-2xl font-bold">JLPT N2 Level (Simulated)</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">{daysLeft} {t('dashboard.daysLeft')}</p>
            <p className="text-2xl font-bold">75%</p>
          </div>
        </div>
        <ProgressBar value={75} colorClass="bg-white" />
      </Card>

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
      
      <Button onClick={startMockExam} variant="secondary">{t('dashboard.startMockExam')}</Button>

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