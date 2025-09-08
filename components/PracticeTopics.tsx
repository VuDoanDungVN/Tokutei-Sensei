import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { PRACTICE_CATEGORIES } from '../constants';
import Card from './shared/Card';
import ProgressBar from './shared/ProgressBar';
import Header from './shared/Header';
import { Topic, TopicCategory } from '../types';
import ExamSelection from './ExamSelection';
import QuestionConfirmationModal from './shared/QuestionConfirmationModal';
import ManualQuestionInput from './shared/ManualQuestionInput';
import { imageAnalysisService, AnalyzedQuestion } from '../services/imageAnalysisService';
import { questionService, SubjectCategory } from '../services/questionService';
import { questionCacheService } from '../services/questionCacheService';
import { authService } from '../services/firebase';

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
  const { icon: Icon, titleKey, title, progress, questionsAttempted, id: topicId } = topic;
  
  // Upload image states
  const [showUpload, setShowUpload] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedQuestions, setAnalyzedQuestions] = useState<AnalyzedQuestion[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Manual input states
  const [inputMode, setInputMode] = useState<'image' | 'manual'>('image');
  const [existingQuestions, setExistingQuestions] = useState<AnalyzedQuestion[]>([]);
  
  // Firestore questions states
  const [savedQuestionsCount, setSavedQuestionsCount] = useState(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Map topic to subject category
  const getSubjectCategory = (topicTitle: string): SubjectCategory => {
    if (topicTitle.includes('Nền tảng nhân văn') || topicTitle.includes('xã hội')) {
      return 'Nền tảng nhân văn và xã hội';
    } else if (topicTitle.includes('y học') || topicTitle.includes('tâm lý')) {
      return 'Kiến thức y học và tâm lý';
    } else if (topicTitle.includes('chuyên ngành') || topicTitle.includes('điều dưỡng')) {
      return 'Kiến thức chuyên ngành điều dưỡng';
    } else {
      return 'Tổng hợp';
    }
  };

  // Load saved questions count
  const loadSavedQuestionsCount = async () => {
    const user = authService.getCurrentUser();
    if (!user) return;

    setIsLoadingQuestions(true);
    try {
      const subject = getSubjectCategory(title);
      
      // First check if exam period exists without creating it
      const examPeriod = await questionService.getExamPeriodOnly(user.uid, examNumber);
      if (!examPeriod) {
        // No exam period exists, so no questions
        setSavedQuestionsCount(0);
        return;
      }
      
      // Get questions for this specific exam number and topic
      const questions = await questionService.getQuestionsByTopic(
        examNumber,
        subject,
        topicId,
        100,
        user.uid,
        true // use cache
      );
      
      setSavedQuestionsCount(questions.length);
    } catch (error) {
      console.error('Error loading questions count:', error);
      // Don't fallback to simple collection for old questions
      // Only show questions from the current exam period and topic
      setSavedQuestionsCount(0);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Load existing questions for manual input
  const loadExistingQuestions = async () => {
    const user = authService.getCurrentUser();
    if (!user) return;

    setIsLoadingQuestions(true);
    try {
      const subject = getSubjectCategory(title);
      
      // Get questions for this specific exam number and topic
      const questions = await questionService.getQuestionsByTopic(
        examNumber,
        subject,
        topicId,
        100,
        user.uid,
        true // use cache
      );
      
      // Convert to AnalyzedQuestion format
      const analyzedQuestions: AnalyzedQuestion[] = questions.map(q => ({
        question: q.question,
        options: Array.isArray(q.options) 
          ? q.options.map((opt, index) => ({
              id: (index + 1).toString(),
              text: typeof opt === 'string' ? opt : opt.text,
              isCorrect: index === q.correctAnswer
            }))
          : [],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || 'Câu hỏi đã lưu'
      }));
      
      setExistingQuestions(analyzedQuestions);
    } catch (error) {
      console.error('Error loading existing questions:', error);
      setExistingQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Load questions count on component mount
  React.useEffect(() => {
    // Clear old cache first to ensure we don't show old questions
    const user = authService.getCurrentUser();
    if (user) {
      const subject = getSubjectCategory(title);
      questionCacheService.clearOldCache(user.uid, subject);
    }
    loadSavedQuestionsCount();
    loadExistingQuestions();
  }, [title, examNumber]);

  const handleImageUpload = async (file: File) => {
    setIsAnalyzing(true);
    setUploadError(null);
    
    try {
      // Check API key configuration
      const debugInfo = imageAnalysisService.getDebugInfo();
      console.log('API Debug Info:', debugInfo);
      
      if (!debugInfo.apiKeyExists) {
        setUploadError('API Key chưa được cấu hình. Vui lòng thêm VITE_GEMINI_API_KEY vào file .env');
        return;
      }
      
      // Test API key first
      const isApiKeyValid = await imageAnalysisService.testApiKey();
      if (!isApiKeyValid) {
        setUploadError('API Key không hợp lệ hoặc đã hết quota. Vui lòng kiểm tra cấu hình VITE_GEMINI_API_KEY trong file .env');
        return;
      }

      const subject = getSubjectCategory(title);
      const result = await imageAnalysisService.analyzeImage(file, subject);
      
      if (result.success && result.questions.length > 0) {
        setAnalyzedQuestions(result.questions);
        setShowConfirmation(true);
        setShowUpload(false);
      } else {
        const errorMessage = result.error || 'Không tìm thấy câu hỏi nào trong ảnh';
        setUploadError(errorMessage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Có lỗi xảy ra khi phân tích ảnh. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSave = async (editedQuestions: AnalyzedQuestion[]) => {
    setIsSaving(true);
    
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      const subject = getSubjectCategory(title);
      const result = await questionService.saveQuestions(
        editedQuestions,
        subject,
        user.uid,
        examNumber, // Pass the exam number
        topicId // Pass the specific topic ID
      );

      if (result.success) {
        setShowConfirmation(false);
        setAnalyzedQuestions([]);
        // Reload questions count and existing questions
        await loadSavedQuestionsCount();
        await loadExistingQuestions();
        // Show success message
        alert(`Đã lưu thành công ${result.savedCount} câu hỏi vào "${title}" - Kỳ thi ${examNumber}! Bây giờ bạn có thể làm bài kiểm tra.`);
      } else {
        throw new Error(result.error || 'Có lỗi xảy ra khi lưu câu hỏi');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu câu hỏi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelUpload = () => {
    setShowUpload(false);
    setUploadError(null);
    setAnalyzedQuestions([]);
    setInputMode('image');
  };

  const handleManualQuestionsAnalyzed = (questions: AnalyzedQuestion[]) => {
    setAnalyzedQuestions(questions);
    setShowConfirmation(true);
    setShowUpload(false);
  };

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="bg-brand-blue-light p-2 rounded-md">
          <Icon className="w-5 h-5 text-brand-blue-dark" />
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold text-sm text-brand-text-primary">{t(titleKey)}</h3>
          <p className="text-xs text-brand-text-secondary">{title}</p>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-xs text-brand-text-secondary">{questionsAttempted} {t('practice.questionsAttempted')}</p>
            {savedQuestionsCount > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {savedQuestionsCount} câu hỏi (Kỳ {examNumber})
              </span>
            )}
            {isLoadingQuestions && (
              <span className="text-xs text-gray-500">Đang tải...</span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className="btn-primary font-semibold px-3 py-2 rounded-lg text-sm transition flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Upload</span>
          </button>
          <button 
            onClick={() => startPracticeQuiz(topic, examNumber)} 
            className="font-semibold px-4 py-2 rounded-lg text-sm transition flex items-center space-x-1 btn-primary"
            disabled={isLoadingQuestions}
          >
            {isLoadingQuestions ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang tải...</span>
              </>
            ) : savedQuestionsCount > 0 ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Làm bài ({savedQuestionsCount})</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>{t('practice.start')}</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-2">
        <div className="flex justify-between text-xs text-brand-text-secondary mb-1">
          <span>{t('practice.progress')}</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Thêm câu hỏi mới</h4>
            <button
              onClick={handleCancelUpload}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Input Mode Tabs */}
          <div className="mb-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setInputMode('image')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  inputMode === 'image'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📷 Upload ảnh
              </button>
              <button
                onClick={() => setInputMode('manual')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  inputMode === 'manual'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ✏️ Nhập thủ công
              </button>
            </div>
          </div>
          
          {/* Image Upload Mode */}
          {inputMode === 'image' && (
            <div className="mb-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
                disabled={isAnalyzing}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isAnalyzing && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-600">Đang phân tích ảnh...</span>
                </div>
              )}
            </div>
          )}

          {/* Manual Input Mode */}
          {inputMode === 'manual' && (
            <ManualQuestionInput
              onQuestionsAnalyzed={handleManualQuestionsAnalyzed}
              onCancel={handleCancelUpload}
              loading={isAnalyzing}
              existingQuestions={existingQuestions}
            />
          )}
          
          {uploadError && inputMode === 'image' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 mb-2">{uploadError}</p>
              <div className="text-xs text-red-600">
                <p><strong>Gợi ý:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Đảm bảo ảnh rõ nét, không bị mờ</li>
                  <li>Ảnh chứa văn bản tiếng Nhật hoặc tiếng Việt</li>
                  <li>Định dạng JPG, PNG hoặc WebP</li>
                  <li>Kích thước dưới 20MB</li>
                  <li>Thử chụp ảnh với ánh sáng tốt hơn</li>
                </ul>
              </div>
            </div>
          )}
          
          {inputMode === 'image' && (
            <p className="text-xs text-gray-500">
              Upload ảnh đề thi để AI tự động trích xuất câu hỏi và đáp án
            </p>
          )}
          {inputMode === 'manual' && (
            <p className="text-xs text-gray-500">
              Nhập câu hỏi và đáp án thủ công, AI sẽ tự động phân tích và xác định đáp án đúng
            </p>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <QuestionConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSave}
        questions={analyzedQuestions}
        loading={isSaving}
        subject={getSubjectCategory(title)}
        examNumber={examNumber}
        topicTitle={title}
      />
    </div>
  );
};


export default PracticeTopics;