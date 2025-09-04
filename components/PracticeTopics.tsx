import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { PRACTICE_CATEGORIES } from '../constants';
import Card from './shared/Card';
import ProgressBar from './shared/ProgressBar';
import Header from './shared/Header';
import { Topic, TopicCategory } from '../types';
import ExamSelection from './ExamSelection';

const PracticeTopics: React.FC = () => {
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const { t } = useContext(AppContext);

  if (!selectedExam) {
    return <ExamSelection onSelectExam={setSelectedExam} />;
  }

  return (
    <div>
      <Header 
        title={t('practice.examN', { n: selectedExam })} 
        onBack={() => setSelectedExam(null)} 
      />
      <div className="p-4 md:p-6 space-y-4">
        {PRACTICE_CATEGORIES.map(category => (
          <CategoryAccordion key={category.id} category={category} examNumber={selectedExam} />
        ))}
      </div>
    </div>
  );
};

interface CategoryAccordionProps {
  category: TopicCategory;
  examNumber: number;
}

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({ category, examNumber }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useContext(AppContext);

  return (
    <Card className="!p-0 overflow-hidden">
      <button 
        className="w-full text-left p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`category-${category.id}`}
      >
        <div>
          <h2 className="font-bold text-brand-text-primary">{t(category.titleKey)}</h2>
          <p className="text-xs text-brand-text-secondary">{category.japaneseTitle}</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-brand-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div id={`category-${category.id}`} className="p-4 border-t border-gray-100 space-y-3">
          {category.topics.map(topic => (
            <TopicItem key={topic.id} topic={topic} examNumber={examNumber} />
          ))}
        </div>
      )}
    </Card>
  );
};


const TopicItem: React.FC<{ topic: Topic, examNumber: number }> = ({ topic, examNumber }) => {
  const { startPracticeQuiz, t } = useContext(AppContext);
  const { icon: Icon, titleKey, title, progress, questionsAttempted } = topic;

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="bg-brand-blue-light p-2 rounded-md">
          <Icon className="w-5 h-5 text-brand-blue-dark" />
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold text-sm text-brand-text-primary">{t(titleKey)}</h3>
          <p className="text-xs text-brand-text-secondary">{title}</p>
          <p className="text-xs text-brand-text-secondary mt-1">{questionsAttempted} {t('practice.questionsAttempted')}</p>
        </div>
        <button 
          onClick={() => startPracticeQuiz(topic, examNumber)} 
          className="bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg text-sm transition hover:bg-brand-blue-dark"
        >
          {t('practice.start')}
        </button>
      </div>
       <div className="mt-2">
        <div className="flex justify-between text-xs text-brand-text-secondary mb-1">
          <span>{t('practice.progress')}</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>
    </div>
  );
};


export default PracticeTopics;