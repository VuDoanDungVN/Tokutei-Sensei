import React, { useState, useContext } from 'react';
import Header from './shared/Header';
import Card from './shared/Card';
import Button from './shared/Button';
import { AppContext } from '../App';
import { Question } from '../types';
import { appService } from '../services/geminiService';


const AdminPanel: React.FC = () => {
  const { t } = useContext(AppContext);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // FIX: Changed the state type to Omit<Question, 'id' | 'examNumber'>[] because the examNumber is added later.
  const [extractedQuestions, setExtractedQuestions] = useState<Omit<Question, 'id' | 'examNumber'>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [examNumber, setExamNumber] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null); // No preview for PDFs
      }
      setExtractedQuestions([]);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleProcessDocument = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setExtractedQuestions([]);

    try {
      const result = await appService.processExamDocument(selectedFile);
      
      if ('error' in result) {
        setError(result.error);
      } else {
        setExtractedQuestions(result);
      }
    } catch (e) {
      setError('An unexpected error occurred. Please check the console.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveQuestions = async () => {
      if (extractedQuestions.length === 0 || !examNumber) {
          setError("Exam number and extracted questions are required.");
          return;
      }
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      try {
          const num = parseInt(examNumber, 10);
          if (isNaN(num)) {
              setError("Invalid exam number.");
              setIsSaving(false);
              return;
          }
          const questionsToSave = extractedQuestions.map(q => ({ ...q, examNumber: num }));
          await appService.saveExtractedQuestions(questionsToSave);
          setSuccessMessage(t('admin.saveSuccess'));
          setExtractedQuestions([]); // Clear after saving
      } catch (e) {
          setError(t('admin.saveError'));
          console.error(e);
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div>
      <Header title={t('admin.title')} />
      <div className="p-4 md:p-6 space-y-6">
        <Card>
          <h3 className="font-bold text-brand-text-primary mb-2">{t('admin.uploadTitle')}</h3>
          <p className="text-sm text-brand-text-secondary mb-4">{t('admin.uploadSubtitle')}</p>
          <div className="space-y-4">
             <input
              type="file"
              accept="image/jpeg, image/png, application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-blue-light file:text-brand-blue hover:file:bg-brand-blue-light/80"
            />
            <div>
              <label htmlFor="examNumber" className="block text-sm font-medium text-brand-text-primary mb-1">{t('admin.examNumberLabel')}</label>
              <input
                type="number"
                id="examNumber"
                value={examNumber}
                onChange={(e) => setExamNumber(e.target.value)}
                required
                placeholder="37"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-brand-text-primary focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>
        </Card>

        {(previewUrl || selectedFile) && (
          <Card>
            <h3 className="font-bold text-brand-text-primary mb-2">{t('admin.preview')}</h3>
            {previewUrl ? (
                 <img src={previewUrl} alt="Exam preview" className="rounded-lg max-h-80 w-auto mx-auto" />
            ) : (
                <p className="text-center p-4 bg-gray-100 rounded-md">PDF file selected. No preview available.</p>
            )}
           
            <Button onClick={handleProcessDocument} disabled={isLoading || !examNumber} className="mt-4">
              {isLoading ? t('admin.processing') : t('admin.extract')}
            </Button>
          </Card>
        )}

        {isLoading && (
            <div className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
                <p className="mt-4 text-brand-text-secondary">{t('admin.analyzing')}</p>
            </div>
        )}

        {error && (
            <Card className="bg-red-50 border-red-200">
                <p className="text-red-700 font-semibold">{error}</p>
            </Card>
        )}
        
        {successMessage && (
            <Card className="bg-green-50 border-green-200">
                <p className="text-green-700 font-semibold">{successMessage}</p>
            </Card>
        )}


        {extractedQuestions.length > 0 && (
          <Card>
            <h3 className="font-bold text-brand-text-primary mb-4">{t('admin.extractedQuestions')} ({extractedQuestions.length})</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {extractedQuestions.map((q, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                  <p className="font-semibold text-sm">{index + 1}. {q.question}</p>
                  <ul className="list-disc list-inside pl-2 mt-2 text-xs text-brand-text-secondary">
                    {q.options.map((opt, i) => (
                      <li key={i} className={i === q.correctAnswer ? 'font-bold text-green-700' : ''}>{opt}</li>
                    ))}
                  </ul>
                  <p className="text-xs italic mt-2 text-blue-600"><strong>Topic:</strong> {q.topic}</p>
                  <p className="text-xs italic mt-2 text-blue-600"><strong>{t('quiz.explanation')}:</strong> {q.explanation}</p>
                </div>
              ))}
            </div>
            <Button onClick={handleSaveQuestions} variant="secondary" className="mt-4" disabled={isSaving}>
                {isSaving ? t('admin.saving') : t('admin.save')}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;