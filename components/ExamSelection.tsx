import React, { useContext } from 'react';
import { AppContext } from '../App';
import Header from './shared/Header';
import Card from './shared/Card';

interface ExamSelectionProps {
  onSelectExam: (examNumber: number) => void;
}

const ExamSelection: React.FC<ExamSelectionProps> = ({ onSelectExam }) => {
  const { t, settings } = useContext(AppContext);
  const currentExamYear = 37;
  const exams = Array.from({ length: currentExamYear }, (_, i) => currentExamYear - i);

  return (
    <div>
      <Header title={t('practice.selectExamTitle')} />
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {exams.map(examNumber => (
            <Card
              key={examNumber}
              onClick={() => onSelectExam(examNumber)}
              className="!p-0 text-center flex items-center justify-center aspect-square transition transform hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-brand-blue"
            >
              <div className="font-bold text-brand-text-primary">
                {settings.language === 'ja'
                  ? t('practice.examN', { n: examNumber })
                  : (
                    <>
                      <span className="block text-lg">{t('practice.examN', { n: examNumber }).split('(')[0]}</span>
                      <span className="block text-xs text-brand-text-secondary">
                        ({t('practice.examN', { n: examNumber }).split('(')[1]}
                      </span>
                    </>
                  )
                }
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamSelection;
