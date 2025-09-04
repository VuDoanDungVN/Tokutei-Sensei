
import React, { useContext } from 'react';
import { AppContext } from '../App';
import Button from './shared/Button';
import Card from './shared/Card';
import ProgressBar from './shared/ProgressBar';
import Confetti from './shared/Confetti';
import { AppScreen } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Results: React.FC = () => {
  const { lastResult, setCurrentScreen, t } = useContext(AppContext);

  if (!lastResult) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold">{t('quiz.noQuestions')}</h2>
        <Button onClick={() => setCurrentScreen(AppScreen.Dashboard)} className="mt-4">{t('quiz.backToDashboard')}</Button>
      </div>
    );
  }

  const { score, correctAnswers, totalQuestions, timeTaken } = lastResult;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const data = [
    { name: t('results.correct'), value: correctAnswers },
    { name: t('results.incorrect'), value: incorrectAnswers },
  ];
  const COLORS = ['#4CAF50', '#F44336'];

  const formatTime = (seconds: number) => {
    if (seconds === 0) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const isPass = score >= 60;
  const isExcellent = score >= 90;

  return (
    <div className="p-4 md:p-6 space-y-6 relative">
      {isExcellent && <Confetti />}
      <header className="pt-4 text-center">
        <h1 className="text-3xl font-bold text-brand-text-primary">{t('results.title')}</h1>
        
        {isExcellent && (
             <h2 className="text-2xl font-bold text-amber-500 my-4 animate-pulse">{t('results.passed')}</h2>
        )}
        
        <p className={`text-7xl font-bold mt-2 ${isPass ? 'text-brand-green-dark' : 'text-red-500'}`}>{score}%</p>
        
        {!isExcellent && (
            <p className="text-brand-text-secondary mt-1">{isPass ? t('results.passed') : t('results.failed')}</p>
        )}
      </header>

      <Card>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-around text-center mt-4">
          <div>
            <p className="text-sm text-brand-text-secondary">{t('results.correct')}</p>
            <p className="text-xl font-bold text-brand-green-dark">{correctAnswers}/{totalQuestions}</p>
          </div>
          <div>
            <p className="text-sm text-brand-text-secondary">{t('results.incorrect')}</p>
            <p className="text-xl font-bold text-red-500">{incorrectAnswers}/{totalQuestions}</p>
          </div>
          <div>
            <p className="text-sm text-brand-text-secondary">{t('results.time')}</p>
            <p className="text-xl font-bold">{formatTime(timeTaken)}</p>
          </div>
        </div>
      </Card>
      
      <Card>
          <h3 className="font-bold mb-3 text-brand-text-primary">{t('results.recommendedTopics')}</h3>
          <div className="space-y-4">
            <div className="flex items-center">
                <div className="flex-grow">
                    <p className="font-semibold text-sm">{t('topics.medical')}</p>
                    <ProgressBar value={30} colorClass="bg-red-500" />
                </div>
                <button className="ml-4 bg-brand-blue-light text-brand-blue-dark text-xs font-bold py-1 px-3 rounded-full">{t('results.review')}</button>
            </div>
             <div className="flex items-center">
                <div className="flex-grow">
                    <p className="font-semibold text-sm">{t('topics.lifeSupport')}</p>
                    <ProgressBar value={45} colorClass="bg-yellow-500" />
                </div>
                <button className="ml-4 bg-brand-blue-light text-brand-blue-dark text-xs font-bold py-1 px-3 rounded-full">{t('results.review')}</button>
            </div>
          </div>
      </Card>

      <div className="flex space-x-2">
        <Button onClick={() => setCurrentScreen(AppScreen.Practice)} variant="outline">{t('results.practiceMore')}</Button>
        <Button onClick={() => setCurrentScreen(AppScreen.Dashboard)}>{t('results.backToDashboard')}</Button>
      </div>
    </div>
  );
};

export default Results;