import React, { useState } from 'react';
import { AnalyzedQuestion } from '../../services/imageAnalysisService';
import { appService } from '../../services/geminiService';

interface ManualQuestionInputProps {
  onQuestionsAnalyzed: (questions: AnalyzedQuestion[]) => void;
  onCancel: () => void;
  loading: boolean;
  className?: string;
  existingQuestions?: AnalyzedQuestion[]; // Câu hỏi đã có trước đó
}

interface QuestionInput {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
  isAnalyzing?: boolean;
}

const ManualQuestionInput: React.FC<ManualQuestionInputProps> = ({
  onQuestionsAnalyzed,
  onCancel,
  loading,
  className = '',
  existingQuestions = []
}) => {
  const [questions, setQuestions] = useState<QuestionInput[]>([
    {
      id: '1',
      question: '',
      options: ['', '', '', ''], // Bắt đầu với 4 đáp án mặc định
      isAnalyzing: false
    }
  ]);

  const addNewQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([...questions, {
      id: newId,
      question: '',
      options: ['', '', '', ''], // Bắt đầu với 4 đáp án mặc định
      isAnalyzing: false
    }]);
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...q.options, ''] };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length > 2) { // Tối thiểu 2 đáp án
        const newOptions = q.options.filter((_, index) => index !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const moveQuestionUp = (id: string) => {
    const currentIndex = questions.findIndex(q => q.id === id);
    if (currentIndex > 0) {
      const newQuestions = [...questions];
      [newQuestions[currentIndex], newQuestions[currentIndex - 1]] = 
      [newQuestions[currentIndex - 1], newQuestions[currentIndex]];
      setQuestions(newQuestions);
    }
  };

  const moveQuestionDown = (id: string) => {
    const currentIndex = questions.findIndex(q => q.id === id);
    if (currentIndex < questions.length - 1) {
      const newQuestions = [...questions];
      [newQuestions[currentIndex], newQuestions[currentIndex + 1]] = 
      [newQuestions[currentIndex + 1], newQuestions[currentIndex]];
      setQuestions(newQuestions);
    }
  };

  const updateQuestion = (id: string, field: keyof QuestionInput, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const analyzeQuestion = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.question.trim() || question.options.some(opt => !opt.trim())) {
      alert('Vui lòng nhập đầy đủ câu hỏi và tất cả đáp án trước khi phân tích');
      return;
    }
    
    if (question.options.length < 2) {
      alert('Cần ít nhất 2 đáp án để phân tích');
      return;
    }

    // Set analyzing state
    updateQuestion(questionId, 'isAnalyzing', true);

    try {
      // Call AI service to analyze the question
      const result = await appService.analyzeQuestion(question.question, question.options);
      
      // Update the question with AI analysis
      updateQuestion(questionId, 'correctAnswer', result.correctAnswer);
      updateQuestion(questionId, 'explanation', result.explanation);
      
    } catch (error) {
      console.error('Error analyzing question:', error);
        // Fallback: ask user to select correct answer manually
        const optionsList = question.options.map((opt, index) => `${index + 1}. ${opt}`).join('\n');
        const validAnswers = question.options.map((_, index) => (index + 1).toString()).join(', ');
        
        const correctAnswer = prompt(
          `AI không thể phân tích tự động. Vui lòng nhập số thứ tự của đáp án đúng (${validAnswers}):\n\n` +
          `Câu hỏi: ${question.question}\n\n` +
          optionsList
        );
        
        const answerIndex = parseInt(correctAnswer) - 1;
        if (correctAnswer && answerIndex >= 0 && answerIndex < question.options.length) {
          updateQuestion(questionId, 'correctAnswer', answerIndex);
          updateQuestion(questionId, 'explanation', 'Được xác định thủ công bởi người dùng');
        }
    } finally {
      updateQuestion(questionId, 'isAnalyzing', false);
    }
  };

  const analyzeAllQuestions = async () => {
    const validQuestions = questions.filter(q => 
      q.question.trim() && q.options.every(opt => opt.trim())
    );

    if (validQuestions.length === 0) {
      alert('Vui lòng nhập ít nhất một câu hỏi đầy đủ');
      return;
    }

    // Analyze all questions
    for (const question of validQuestions) {
      if (!question.correctAnswer && question.correctAnswer !== 0) {
        await analyzeQuestion(question.id);
      }
    }
  };

  const handleSave = () => {
    const validQuestions = questions.filter(q => 
      q.question.trim() && 
      q.options.every(opt => opt.trim()) && 
      (q.correctAnswer !== undefined && q.correctAnswer !== null)
    );

    if (validQuestions.length === 0) {
      alert('Vui lòng nhập và phân tích ít nhất một câu hỏi');
      return;
    }

    // Convert to AnalyzedQuestion format
    const analyzedQuestions: AnalyzedQuestion[] = validQuestions.map(q => ({
      question: q.question,
      options: q.options.map((option, index) => ({
        id: (index + 1).toString(),
        text: option,
        isCorrect: index === q.correctAnswer
      })),
      correctAnswer: q.correctAnswer!,
      explanation: q.explanation || 'Được phân tích bởi AI'
    }));

    onQuestionsAnalyzed(analyzedQuestions);
  };

  const canSave = questions.some(q => 
    q.question.trim() && 
    q.options.every(opt => opt.trim()) && 
    (q.correctAnswer !== undefined && q.correctAnswer !== null)
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Nhập câu hỏi thủ công</h4>
        <div className="flex space-x-2">
          <button
            onClick={addNewQuestion}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            + Thêm câu hỏi
          </button>
          <button
            onClick={analyzeAllQuestions}
            disabled={loading}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang phân tích...' : 'Phân tích tất cả'}
          </button>
        </div>
      </div>

      {/* Existing Questions Display */}
      {existingQuestions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">Câu hỏi đã có ({existingQuestions.length})</h4>
            <div className="text-xs text-gray-500">
              Tổng số câu hỏi sẽ là: {existingQuestions.length + questions.length}
            </div>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
            {existingQuestions.map((existingQ, index) => (
              <div key={index} className="p-2 bg-white rounded border text-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-700 mb-1">
                      Câu {index + 1}:
                    </div>
                    <div className="text-gray-600 text-xs mb-1 line-clamp-2">
                      {existingQ.question}
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-green-600 font-medium">
                        ✓ Đáp án: {existingQ.correctAnswer + 1}
                      </span>
                      {existingQ.options.length > 0 && (
                        <span className="text-gray-500">
                          ({existingQ.options.length} đáp án)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {questions.map((question, index) => (
          <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="text-gray-400 cursor-move" title="Kéo để thay đổi thứ tự">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  <h5 className="font-medium text-gray-800">
                    Câu hỏi mới {index + 1}
                  </h5>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => moveQuestionUp(question.id)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Di chuyển lên"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveQuestionDown(question.id)}
                    disabled={index === questions.length - 1}
                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Di chuyển xuống"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Question Input */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Câu hỏi *
              </label>
              <textarea
                value={question.question}
                onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Options */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Đáp án ({question.options.length} đáp án)
                </label>
                <button
                  onClick={() => addOption(question.id)}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  + Thêm đáp án
                </button>
              </div>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Đáp án {optionIndex + 1} *
                      </label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                        placeholder={`Nhập đáp án ${optionIndex + 1}...`}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {question.options.length > 2 && (
                      <button
                        onClick={() => removeOption(question.id, optionIndex)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Xóa đáp án này"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {question.options.length < 2 && (
                <p className="text-xs text-red-500 mt-1">
                  Cần ít nhất 2 đáp án
                </p>
              )}
            </div>

            {/* Analysis Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => analyzeQuestion(question.id)}
                  disabled={question.isAnalyzing || loading || !question.question.trim() || question.options.some(opt => !opt.trim())}
                  className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {question.isAnalyzing ? 'Đang phân tích...' : 'Phân tích câu hỏi'}
                </button>
                
                {question.correctAnswer !== undefined && question.correctAnswer !== null && (
                  <span className="text-sm text-green-600 font-medium">
                    ✓ Đáp án đúng: {question.correctAnswer + 1}
                  </span>
                )}
              </div>
            </div>

            {/* Explanation */}
            {question.explanation && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                <strong>Giải thích:</strong> {question.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave || loading}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Lưu câu hỏi'}
        </button>
      </div>
    </div>
  );
};

export default ManualQuestionInput;
